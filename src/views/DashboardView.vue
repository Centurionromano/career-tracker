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
            <button @click="cerrarSesion" class="btn-logout" title="Cerrar Sesión">➜</button>
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
            :status="item.estatus" 
          />
        </section>

        <div v-else class="empty-state-pro">
          <div class="glow-icon">✦</div>
          <h2>Sin vacantes activas</h2>
          <p>Registra tu primera postulación para comenzar el seguimiento.</p>
        </div>
      </main>

      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-glass">
          <h3>🚀 Nueva Oportunidad</h3>
          
          <form @submit.prevent="guardarVacante" class="modal-form">
            <div class="form-group">
              <label>Cargo / Puesto</label>
              <input v-model="nuevaVacante.nombreVacante" type="text" placeholder="Ej. UX Designer" required />
            </div>

            <div class="form-group">
              <label>Empresa</label>
              <input v-model="nuevaVacante.empresa" type="text" placeholder="Ej. Google" required />
            </div>

            <div class="form-group">
              <label>Estatus</label>
              <select v-model="nuevaVacante.estatus">
                <option value="Enviada">Enviada 📤</option>
                <option value="Entrevista">Entrevista 🎤</option>
                <option value="Prueba">Prueba 💻</option>
                <option value="Oferta">Oferta 🎉</option>
                <option value="Rechazada">Rechazada ❌</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
              <button type="submit" class="btn-gradient btn-save-modal">
                <span class="btn-content save-content">Guardar</span>
              </button>
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

const nuevaVacante = ref({
  nombreVacante: '',
  empresa: '',
  estatus: 'Enviada'
});

const nombreCorto = computed(() => {
  if (usuario.value) {
    if (usuario.value.displayName) return usuario.value.displayName.split(' ')[0];
    return usuario.value.email.split('@')[0];
  }
  return '';
});

const cerrarSesion = async () => {
  await signOut(auth);
  usuario.value = null;
  misDatos.value = [];
  router.push('/'); 
};

const guardarVacante = async () => {
  if (!usuario.value) return;

  try {
    await addDoc(collection(db, "vacantes"), {
      userId: usuario.value.uid,
      nombreVacante: nuevaVacante.value.nombreVacante,
      empresa: nuevaVacante.value.empresa,
      estatus: nuevaVacante.value.estatus,
      fechaCreacion: new Date()
    });
    nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada' };
    showModal.value = false;
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error al guardar.");
  }
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
      usuario.value = null;
      misDatos.value = [];
      router.push('/'); // Si no hay usuario, regresa al login
    }
  });
});
</script>

<style scoped>
.dashboard-wrapper { min-height: 100vh; width: 100%; }
.dashboard-container { padding-bottom: 50px; }

.glass-nav {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky; top: 0; z-index: 1000; padding: 12px 0;
}

.nav-wrapper {
  max-width: 1200px; margin: 0 auto; display: flex;
  justify-content: space-between; align-items: center; padding: 0 24px;
}

.brand { display: flex; align-items: center; gap: 12px; }

/* --- ESTE ES EL CSS QUE CONTROLA EL TAMAÑO PEQUEÑO --- */
.app-logo { 
  height: 35px; /* AQUÍ ESTÁ EL SECRETO: 35px */
  filter: drop-shadow(0 0 8px rgba(77, 124, 255, 0.3)); 
}

/* TEXTO DEGRADADO (Azul Pálido -> Eléctrico) */
.brand-text {
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: 1px;
  background: linear-gradient(to right, #C4D6FF 0%, #4D7CFF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 8px rgba(77, 124, 255, 0.4));
}

.user-pill {
  background: rgba(255, 255, 255, 0.05); padding: 4px 4px 4px 4px;
  border-radius: 30px; display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--glass-border);
}
.user-pill .user-display-name { padding-left: 4px; }

.user-img, .user-initial { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-initial { background: var(--accent-purple); display: flex; align-items: center; justify-content: center; font-weight: bold; }
.user-display-name { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.btn-logout {
  background: transparent; border: none; color: var(--text-secondary);
  cursor: pointer; padding: 0 8px; font-size: 1rem; transition: color 0.2s;
}
.btn-logout:hover { color: var(--accent-cyan); }

.main-content { max-width: 1200px; margin: 0 auto; padding: 60px 24px; }

.hero-section {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 60px; gap: 20px;
}

.glitch-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; margin: 0; }
.hero-subtitle { color: var(--text-secondary); font-size: 1.2rem; margin-top: 10px; }

.btn-gradient {
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
  padding: 2px; border-radius: 12px; border: none; cursor: pointer;
  transition: transform 0.2s; flex-shrink: 0;
}
.btn-content {
  background: var(--bg-dark); color: white; padding: 12px 24px;
  border-radius: 10px; display: block; font-weight: 700; transition: background 0.2s;
}
.btn-gradient:hover { transform: scale(1.05); }
.btn-gradient:hover .btn-content { background: transparent; }

.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 25px;
}

.empty-state-pro {
  text-align: center; padding: 100px 0; background: var(--card-bg);
  border-radius: 24px; border: 1px solid var(--glass-border);
}
.glow-icon { font-size: 3rem; color: var(--accent-cyan); text-shadow: 0 0 20px var(--accent-cyan); margin-bottom: 20px; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;
}
.modal-glass {
  background: #0f0f11; border: 1px solid var(--glass-border); padding: 30px;
  border-radius: 20px; width: 100%; max-width: 450px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: slideUp 0.3s ease-out;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-glass h3 { margin: 0 0 24px 0; font-size: 1.5rem; text-align: center; color: white; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-secondary); }
.form-group input, .form-group select {
  width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05);
  border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px;
  color: white; font-family: inherit; outline: none; appearance: none;
}
.form-group input:focus, .form-group select:focus { border-color: var(--accent-purple); }
.form-group select option { background: #0f0f11; color: white; }

.modal-actions { display: flex; gap: 16px; margin-top: 30px; }
.btn-cancel { 
  background: transparent; border: 1px solid var(--glass-border);
  border-radius: 12px; color: var(--text-secondary); cursor: pointer; flex: 1; 
  font-weight: 600; padding: 12px;
}
.btn-save-modal { flex: 1; display: flex; justify-content: center; width: auto; }
.save-content { width: 100%; text-align: center; }

@media (max-width: 768px) {
  .hero-section { flex-direction: column; align-items: flex-start; gap: 30px; }
  .glitch-title { font-size: 2.5rem; }
}
@media (max-width: 480px) {
  .hide-mobile { display: none; }
  .btn-gradient { width: 100%; }
  .btn-content { text-align: center; }
}
</style>