<template>
  <div class="dashboard-wrapper">
    <div v-if="usuario" class="dashboard-container">
      
      <nav class="glass-nav">
        <div class="nav-wrapper">
          <div class="brand">
            <img :src="logoImg" alt="Logo" class="app-logo" />
            <span class="brand-text">CAREER<span>TRACKER</span></span>
          </div>
          <div class="user-pill">
            <div class="avatar-container">
              <img v-if="usuario.photoURL" :src="usuario.photoURL" class="user-img" />
              <div v-else class="user-initial">{{ usuario.email.charAt(0).toUpperCase() }}</div>
            </div>
            <span class="user-display-name hide-mobile">{{ nombreCorto }}</span>
            <button @click="cerrarSesion" class="btn-logout">➜</button>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <header class="hero-section">
          <div class="hero-text">
            <h1 class="glitch-title">Hola, {{ nombreCorto }}</h1>
            <p class="hero-subtitle">Tu próximo salto profesional empieza aquí.</p>
          </div>
          <button class="btn-gradient" @click="showModal = true">
            <span class="btn-content">+ Nueva Vacante</span>
          </button>
        </header>

        <section v-if="misDatos.length > 0" class="cards-grid">
          <VacancyCard 
            v-for="item in misDatos" 
            :key="item.id" 
            :title="item.nombreVacante" 
            :company="item.empresa" 
            :status="item.estatus || 'Enviada'" 
          />
        </section>

        <div v-else class="empty-state-pro">
          <div class="glow-icon">✦</div>
          <h2>Sin vacantes activas</h2>
          <p>Registra tu primera postulación.</p>
        </div>
      </main>

      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-glass">
          <h3>🚀 Nueva Oportunidad</h3>
          <form @submit.prevent="guardarVacante">
            <div class="form-group"><label>Puesto</label><input v-model="nuevaVacante.nombreVacante" required placeholder="Ej. UX Designer" /></div>
            <div class="form-group"><label>Empresa</label><input v-model="nuevaVacante.empresa" required placeholder="Ej. Google" /></div>
            <div class="form-group">
              <label>Estatus</label>
              <select v-model="nuevaVacante.estatus">
                <option>Enviada</option><option>Entrevista</option><option>Oferta</option><option>Rechazada</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
              <button type="submit" class="btn-gradient btn-save-modal"><span class="btn-content save-content">Guardar</span></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth'; 
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import VacancyCard from '../components/VacancyCard.vue';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';
import { useRouter } from 'vue-router'; 

const router = useRouter();
const usuario = ref(null);
const misDatos = ref([]);
const showModal = ref(false);
const nuevaVacante = ref({ nombreVacante: '', empresa: '', estatus: 'Enviada' });

const nombreCorto = computed(() => {
  if (usuario.value) {
    if (usuario.value.displayName) return usuario.value.displayName.split(' ')[0];
    return usuario.value.email.split('@')[0];
  }
  return '';
});

const cerrarSesion = async () => {
  await signOut(auth);
  router.push('/'); 
};

const guardarVacante = async () => {
  if (!usuario.value) return;
  await addDoc(collection(db, "vacantes"), {
    userId: usuario.value.uid,
    nombreVacante: nuevaVacante.value.nombreVacante,
    empresa: nuevaVacante.value.empresa,
    estatus: nuevaVacante.value.estatus || 'Enviada',
    fechaCreacion: new Date()
  });
  nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada' };
  showModal.value = false;
};

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      usuario.value = user;
      const q = query(collection(db, "vacantes"), where("userId", "==", user.uid));
      onSnapshot(q, (snapshot) => {
        misDatos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    } else {
      router.push('/'); 
    }
  });
});
</script>

<style scoped>
.dashboard-wrapper { min-height: 100vh; width: 100%; background-color: #09090b; overflow-y: auto; }
.dashboard-container { padding-bottom: 50px; }

.glass-nav {
  background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08);
  position: sticky; top: 0; z-index: 1000; padding: 12px 0;
}
.nav-wrapper { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
.brand { display: flex; align-items: center; gap: 12px; }
.app-logo { height: 35px; filter: drop-shadow(0 0 8px rgba(77, 124, 255, 0.3)); }
.brand-text { font-weight: 800; font-size: 1.3rem; letter-spacing: 1px; background: linear-gradient(to right, #C4D6FF 0%, #4D7CFF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }

.user-pill { background: rgba(255, 255, 255, 0.05); padding: 4px; border-radius: 30px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.08); }
.user-img, .user-initial { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-initial { background: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.user-display-name { font-size: 0.85rem; font-weight: 600; color: #ccc; }
.btn-logout { background: transparent; border: none; color: #ccc; cursor: pointer; padding: 0 8px; font-size: 1rem; }

.main-content { max-width: 1200px; margin: 0 auto; padding: 60px 24px; }
.hero-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; }
.glitch-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; margin: 0; color: white; }
.hero-subtitle { color: #888; font-size: 1.2rem; margin-top: 10px; }

.btn-gradient { background: linear-gradient(90deg, #6366f1, #06b6d4); padding: 2px; border-radius: 12px; border: none; cursor: pointer; }
.btn-content { background: #09090b; color: white; padding: 12px 24px; border-radius: 10px; display: block; font-weight: 700; }
.btn-gradient:hover .btn-content { background: transparent; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
.empty-state-pro { text-align: center; padding: 100px 0; background: #18181b; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); }
.glow-icon { font-size: 3rem; color: #06b6d4; margin-bottom: 20px; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal-glass { background: #0f0f11; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; width: 100%; max-width: 450px; }
.modal-glass h3 { color: white; margin: 0 0 24px 0; text-align: center; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #888; }
.form-group input, .form-group select { width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; box-sizing: border-box; }

.modal-actions { display: flex; gap: 16px; margin-top: 30px; }
.btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #888; flex: 1; padding: 12px; cursor: pointer; }
.btn-save-modal { flex: 1; }
.save-content { width: 100%; text-align: center; }

@media (max-width: 768px) { .hero-section { flex-direction: column; align-items: flex-start; gap: 30px; } .glitch-title { font-size: 2.5rem; } }
@media (max-width: 480px) { .hide-mobile { display: none; } .btn-gradient { width: 100%; } .btn-content { text-align: center; } }
</style>