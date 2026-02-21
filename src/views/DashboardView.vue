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
          <button class="btn-gradient" @click="abrirModalNuevo">
            <span class="btn-content">+ Nueva Vacante</span>
          </button>
        </header>

        <section v-if="misDatos.length > 0" class="cards-grid">
          <VacancyCard 
            v-for="item in misDatos" 
            :key="item.id" 
            :id="item.id" 
            :title="item.nombreVacante" 
            :company="item.empresa" 
            :status="item.estatus || 'Enviada'" 
            @update-status="actualizarEstatus"
            @delete-vacancy="eliminarVacante"
            @edit-vacancy="abrirEditor"
          />
        </section>

        <div v-else class="empty-state-pro">
          <div class="glow-icon">✦</div>
          <h2>Sin vacantes activas</h2>
          <p>Registra tu primera postulación para comenzar el seguimiento.</p>
        </div>
      </main>

      <div v-if="showModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-glass">
          <h3>{{ isEditing ? '✏️ Editar Oportunidad' : '🚀 Nueva Oportunidad' }}</h3>
          <form @submit.prevent="guardarVacante">
            <div class="form-group">
              <label>Puesto</label>
              <input v-model="nuevaVacante.nombreVacante" required placeholder="Ej. Java Developer" />
            </div>
            <div class="form-group">
              <label>Empresa</label>
              <input v-model="nuevaVacante.empresa" required placeholder="Ej. Google" />
            </div>
            <div class="form-group">
              <label>Estatus</label>
              <select v-model="nuevaVacante.estatus">
                <option>Enviada</option>
                <option>Entrevista</option>
                <option>Prueba</option>
                <option>Oferta</option>
                <option>Rechazada</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-gradient btn-save-modal">
                <span class="btn-content save-content">
                  {{ isEditing ? 'Actualizar' : 'Guardar' }}
                </span>
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
import { 
  collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import VacancyCard from '../components/VacancyCard.vue';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';
import { useRouter } from 'vue-router'; 

const router = useRouter();
const usuario = ref(null);
const misDatos = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const vacanteIdActual = ref(null);

const nuevaVacante = ref({ nombreVacante: '', empresa: '', estatus: 'Enviada' });

// --- COMPUTADAS ---
const nombreCorto = computed(() => {
  if (usuario.value) {
    if (usuario.value.displayName) return usuario.value.displayName.split(' ')[0];
    return usuario.value.email.split('@')[0];
  }
  return '';
});

// --- SESIÓN ---
const cerrarSesion = async () => {
  await signOut(auth);
  router.push('/'); 
};

// --- LÓGICA DE MODAL ---
const abrirModalNuevo = () => {
  isEditing.value = false;
  nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada' };
  showModal.value = true;
};

const abrirEditor = (datos) => {
  isEditing.value = true;
  vacanteIdActual.value = datos.id;
  nuevaVacante.value = { 
    nombreVacante: datos.title, 
    empresa: datos.company, 
    estatus: datos.status 
  };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  isEditing.value = false;
  vacanteIdActual.value = null;
  nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada' };
};

// --- OPERACIONES FIREBASE (CRUD) ---
const guardarVacante = async () => {
  if (!usuario.value) return;

  try {
    if (isEditing.value) {
      // EDITAR
      const docRef = doc(db, "vacantes", vacanteIdActual.value);
      await updateDoc(docRef, {
        nombreVacante: nuevaVacante.value.nombreVacante,
        empresa: nuevaVacante.value.empresa,
        estatus: nuevaVacante.value.estatus
      });
    } else {
      // CREAR NUEVO
      await addDoc(collection(db, "vacantes"), {
        userId: usuario.value.uid,
        nombreVacante: nuevaVacante.value.nombreVacante,
        empresa: nuevaVacante.value.empresa,
        estatus: nuevaVacante.value.estatus || 'Enviada',
        fechaCreacion: serverTimestamp()
      });
    }
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error al procesar la solicitud.");
  }
};

const actualizarEstatus = async (id, nuevoEstatus) => {
  if (!id) return;
  const docRef = doc(db, "vacantes", id);
  try {
    await updateDoc(docRef, { estatus: nuevoEstatus });
  } catch (error) {
    console.error("Error al actualizar estatus:", error);
  }
};

const eliminarVacante = async (id) => {
  if (confirm("¿Estás seguro de eliminar esta vacante?")) {
    try {
      await deleteDoc(doc(db, "vacantes", id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// --- CICLO DE VIDA ---
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
/* RESET Y FONDO GLOBAL */
:global(body) {
  margin: 0; padding: 0;
  background-color: #09090b !important;
  color: white !important;
}

.dashboard-wrapper {
  min-height: 100vh; width: 100%;
  background-color: #09090b; color: white;
  overflow-y: auto;
}

/* NAVEGACIÓN */
.glass-nav {
  background: rgba(0,0,0,0.4); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: sticky; top: 0; z-index: 1000; padding: 12px 0;
}
.nav-wrapper { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
.brand { display: flex; align-items: center; gap: 12px; }
.app-logo { height: 35px; }
.brand-text { font-weight: 800; font-size: 1.3rem; background: linear-gradient(to right, #C4D6FF, #4D7CFF); -webkit-background-clip: text; background-clip: text; color: transparent; }

.user-pill { background: rgba(255,255,255,0.05); padding: 4px; border-radius: 30px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.08); }
.user-img, .user-initial { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-initial { background: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.btn-logout { background: transparent; border: none; color: #ccc; cursor: pointer; padding: 0 10px; font-size: 1.1rem; }

/* CONTENIDO PRINCIPAL */
.main-content { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
.hero-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 50px; }
.glitch-title { font-size: 3rem; font-weight: 800; margin: 0; color: white; }
.hero-subtitle { color: #888; font-size: 1.1rem; margin-top: 5px; }

/* BOTONES */
.btn-gradient { background: linear-gradient(90deg, #6366f1, #06b6d4); padding: 2px; border-radius: 12px; border: none; cursor: pointer; }
.btn-content { background: #09090b; color: white; padding: 12px 24px; border-radius: 10px; display: block; font-weight: 700; transition: 0.3s; }
.btn-gradient:hover .btn-content { background: transparent; }

/* GRID */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
.empty-state-pro { text-align: center; padding: 80px 0; background: #18181b; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); }
.glow-icon { font-size: 3rem; color: #06b6d4; margin-bottom: 15px; }

/* MODAL OSCURO */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-glass { background: #111113 !important; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; }
.modal-glass h3 { color: white !important; margin-bottom: 25px; text-align: center; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #888; font-size: 0.9rem; }
.form-group input, .form-group select { 
  width: 100%; padding: 12px; background: #1c1c1f !important; 
  border: 1px solid rgba(255,255,255,0.1); color: white !important; border-radius: 8px; box-sizing: border-box; 
}

.modal-actions { display: flex; gap: 15px; margin-top: 30px; }
.btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #888; flex: 1; padding: 12px; cursor: pointer; }
.btn-save-modal { flex: 1; }
.save-content { width: 100%; text-align: center; padding: 10px; }

@media (max-width: 768px) { .hero-section { flex-direction: column; align-items: flex-start; gap: 20px; } .glitch-title { font-size: 2.2rem; } .hide-mobile { display: none; } }
</style>