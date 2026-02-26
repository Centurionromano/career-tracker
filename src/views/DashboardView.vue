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
            <p class="hero-subtitle">Registra vacantes y convierte el feedback en oportunidades.</p>
          </div>
          <button class="btn-gradient" @click="abrirModalNuevo">
            <span class="btn-content">+ Nueva Vacante</span>
          </button>
        </header>

        <div v-if="misDatos.length > 0" class="filter-tabs-container">
          <div class="filter-tabs-glass">
            <button 
              class="tab-btn" 
              :class="{ active: filtroActivo === 'activas' }" 
              @click="filtroActivo = 'activas'"
            >
              <svg class="tab-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Activas
              <span class="badge" v-if="contadorActivas > 0">{{ contadorActivas }}</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: filtroActivo === 'archivo' }" 
              @click="filtroActivo = 'archivo'"
            >
              <svg class="tab-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archivo
              <span class="badge" v-if="contadorArchivo > 0">{{ contadorArchivo }}</span>
            </button>
          </div>
        </div>

        <section v-if="vacantesFiltradas.length > 0" class="cards-grid">
          <VacancyCard 
            v-for="item in vacantesFiltradas" 
            :key="item.id" 
            :id="item.id" 
            :title="item.nombreVacante" 
            :company="item.empresa" 
            :status="item.estatus || 'Enviada'" 
            :linkCV="item.linkCV" 
            :tipoCV="item.tipoCV" 
            @update-status="actualizarEstatus"
            @delete-vacancy="eliminarVacante"
            @edit-vacancy="abrirEditor"
          />
        </section>

        <div v-else-if="misDatos.length > 0 && filtroActivo === 'activas'" class="empty-state-pro">
          <div class="glow-icon">✦</div>
          <h2 class="welcome-title">¡Todo al día!</h2>
          <p class="welcome-subtitle">No tienes procesos activos en este momento.</p>
          <div class="onboarding-box">
            <p><span>1️⃣</span> Da clic en <strong>+ Nueva Vacante</strong> para registrar tu próxima postulación.</p>
            <p><span>2️⃣</span> Si el proceso se detiene, usa el icono <strong>🗃️</strong> para <strong>Mover a Historial</strong>.</p>
          </div>
        </div>

        <div v-else-if="misDatos.length > 0 && filtroActivo === 'archivo'" class="empty-state-pro">
          <div class="glow-icon" style="color: #6b7280; text-shadow: 0 0 20px rgba(107, 114, 128, 0.5);">✧</div>
          <h2>Archivo limpio</h2>
          <p>Aún no tienes vacantes rechazadas o archivadas.</p>
        </div>

        <div v-else class="empty-state-pro">
          <div class="glow-icon">✦</div>
          <h2 class="welcome-title">¡Bienvenida a tu Carrera Tech! 🚀</h2>
          <p class="welcome-subtitle">Tu tablero está limpio, ¡es hora de llenarlo de oportunidades!</p>
          <div class="onboarding-box">
            <p><span>1️⃣</span> Da clic en <strong>+ Nueva Vacante</strong> arriba para agregar tu primera postulación.</p>
            <p><span>2️⃣</span> Si el proceso no avanza, usa el icono <strong>📥</strong> en la tarjeta para <strong>Mover a Historial</strong>.</p>
          </div>
        </div>
      </main>

      <div v-if="showModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-glass">
          <h3>{{ isEditing ? 'Editar Oportunidad' : 'Nueva Oportunidad' }}</h3>
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
            
            <div class="form-group">
              <label>Enlace del CV (Drive, LinkedIn, PDF)</label>
              <input v-model="nuevaVacante.linkCV" placeholder="https://..." />
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

      <ArchiveModal 
        :isOpen="showRechazoModal"
        :vacanteActiva="vacanteParaArchivar"
        @close="cancelarRechazo"
        @confirmar-archivo="ejecutarArchivado"
      />

      <transition name="toast-slide">
        <div v-if="toast.show" class="toast-notification" :class="toast.type">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="toast-svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-if="toast.type === 'error'" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="toast-svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      </transition>

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
import ArchiveModal from '../components/ArchiveModal.vue';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';
import { useRouter } from 'vue-router'; 

const router = useRouter();
const usuario = ref(null);
const misDatos = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const vacanteIdActual = ref(null);
const filtroActivo = ref('activas');

const nuevaVacante = ref({ nombreVacante: '', empresa: '', estatus: 'Enviada', linkCV: '' });

// --- ESTADOS PARA EL RECHAZO (SPRINT 4 -> SPRINT 7) ---
const showRechazoModal = ref(false);
const idPendienteRechazo = ref(null);
const datosPendientesGuardar = ref(null);
const vacanteParaArchivar = ref(null); 

// --- SISTEMA DE TOASTS ---
const toast = ref({ show: false, message: '', type: 'success' });

const mostrarToast = (mensaje, tipo = 'success') => {
  toast.value = { show: true, message: mensaje, type: tipo };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// --- COMPUTADAS ---
const nombreCorto = computed(() => {
  if (usuario.value) {
    if (usuario.value.displayName) return usuario.value.displayName.split(' ')[0];
    return usuario.value.email.split('@')[0];
  }
  return '';
});

const vacantesFiltradas = computed(() => {
  if (filtroActivo.value === 'activas') {
    return misDatos.value.filter(v => v.estatus !== 'Rechazada');
  } else {
    return misDatos.value.filter(v => v.estatus === 'Rechazada');
  }
});

const contadorActivas = computed(() => misDatos.value.filter(v => v.estatus !== 'Rechazada').length);
const contadorArchivo = computed(() => misDatos.value.filter(v => v.estatus === 'Rechazada').length);

// --- SESIÓN ---
const cerrarSesion = async () => {
  await signOut(auth);
  router.push('/'); 
};

// --- LÓGICA DE MODALES ---
const abrirModalNuevo = () => {
  isEditing.value = false;
  nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada', linkCV: '' };
  showModal.value = true;
};

const abrirEditor = (datos) => {
  isEditing.value = true;
  vacanteIdActual.value = datos.id;
  nuevaVacante.value = { 
    nombreVacante: datos.title, 
    empresa: datos.company, 
    estatus: datos.status,
    linkCV: datos.linkCV || ''
  };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  isEditing.value = false;
  vacanteIdActual.value = null;
  nuevaVacante.value = { nombreVacante: '', empresa: '', estatus: 'Enviada', linkCV: '' };
};

const cancelarRechazo = () => {
  showRechazoModal.value = false;
  idPendienteRechazo.value = null;
  datosPendientesGuardar.value = null;
  vacanteParaArchivar.value = null; 
};

// --- OPERACIONES FIREBASE (CRUD QUIRÚRGICO) ---
const guardarVacante = async () => {
  if (!usuario.value) return;

  let tipoDetectado = 'ninguno';
  if (nuevaVacante.value.linkCV) {
    const url = nuevaVacante.value.linkCV.toLowerCase();
    if (url.includes('drive.google.com')) tipoDetectado = 'drive';
    else if (url.includes('linkedin.com/in/')) tipoDetectado = 'linkedin';
    else if (url.endsWith('.pdf')) tipoDetectado = 'pdf';
    else tipoDetectado = 'otro';
  }

  if (nuevaVacante.value.estatus === 'Rechazada') {
    datosPendientesGuardar.value = {
      isEditing: isEditing.value,
      id: vacanteIdActual.value,
      payload: {
        nombreVacante: nuevaVacante.value.nombreVacante,
        empresa: nuevaVacante.value.empresa,
        estatus: nuevaVacante.value.estatus,
        linkCV: nuevaVacante.value.linkCV,
        tipoCV: tipoDetectado
      }
    };
    
    let etapaAnterior = 'Enviada';
    if (isEditing.value && vacanteIdActual.value) {
      const v = misDatos.value.find(x => x.id === vacanteIdActual.value);
      if (v) etapaAnterior = v.estatus;
    }
    
    vacanteParaArchivar.value = { etapa: etapaAnterior };
    showModal.value = false;
    showRechazoModal.value = true; 
    return; 
  }

  try {
    if (isEditing.value) {
      const docRef = doc(db, "vacantes", vacanteIdActual.value);
      await updateDoc(docRef, {
        nombreVacante: nuevaVacante.value.nombreVacante,
        empresa: nuevaVacante.value.empresa,
        estatus: nuevaVacante.value.estatus,
        linkCV: nuevaVacante.value.linkCV,
        tipoCV: tipoDetectado
      });
      mostrarToast("Oportunidad actualizada con éxito");
    } else {
      await addDoc(collection(db, "vacantes"), {
        userId: usuario.value.uid,
        nombreVacante: nuevaVacante.value.nombreVacante,
        empresa: nuevaVacante.value.empresa,
        estatus: nuevaVacante.value.estatus || 'Enviada',
        linkCV: nuevaVacante.value.linkCV,
        tipoCV: tipoDetectado,
        fechaCreacion: serverTimestamp()
      });
      mostrarToast("Nueva oportunidad registrada");
    }
    filtroActivo.value = 'activas';
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarToast("Hubo un error al procesar la solicitud", "error");
  }
};

const actualizarEstatus = async (id, nuevoEstatus) => {
  if (!id) return;

  if (nuevoEstatus === 'Rechazada') {
    idPendienteRechazo.value = id;
    datosPendientesGuardar.value = null;
    
    const vacante = misDatos.value.find(v => v.id === id);
    vacanteParaArchivar.value = vacante ? { etapa: vacante.estatus } : { etapa: 'Enviada' };
    
    showRechazoModal.value = true;
    return; 
  }

  const docRef = doc(db, "vacantes", id);
  try {
    await updateDoc(docRef, { estatus: nuevoEstatus });
    mostrarToast(`Estatus actualizado a: ${nuevoEstatus}`);
    if (filtroActivo.value === 'archivo') filtroActivo.value = 'activas';
  } catch (error) {
    console.error("Error al actualizar estatus:", error);
    mostrarToast("Error al actualizar el estatus", "error");
  }
};

const ejecutarArchivado = async (datosDelModal) => {
  try {
    if (datosPendientesGuardar.value) {
      const payloadConMotivo = { 
        ...datosPendientesGuardar.value.payload, 
        motivoRechazo: datosDelModal.motivoRechazo,
        detallesRechazo: datosDelModal.detallesRechazo || null 
      };

      if (datosPendientesGuardar.value.isEditing) {
        await updateDoc(doc(db, "vacantes", datosPendientesGuardar.value.id), payloadConMotivo);
      } else {
        payloadConMotivo.userId = usuario.value.uid;
        payloadConMotivo.fechaCreacion = serverTimestamp();
        await addDoc(collection(db, "vacantes"), payloadConMotivo);
      }
    } else {
      await updateDoc(doc(db, "vacantes", idPendienteRechazo.value), { 
        estatus: 'Rechazada',
        motivoRechazo: datosDelModal.motivoRechazo,
        detallesRechazo: datosDelModal.detallesRechazo || null 
      });
    }

    mostrarToast("Vacante archivada con análisis inteligente");
    cancelarRechazo(); 
    cerrarModal(); 
    filtroActivo.value = 'archivo'; 

  } catch (error) {
    console.error("Error al archivar:", error);
    mostrarToast("Error al archivar la vacante", "error");
  }
};

const eliminarVacante = async (id) => {
  if (confirm("¿Estás seguro de eliminar esta vacante? ¡Se perderán los datos para tu analítica!")) {
    try {
      await deleteDoc(doc(db, "vacantes", id));
      mostrarToast("Vacante eliminada permanentemente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarToast("Error al eliminar la vacante", "error");
    }
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
.hero-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
.glitch-title { font-size: 3rem; font-weight: 800; margin: 0; color: white; }
.hero-subtitle { color: #888; font-size: 1.1rem; margin-top: 5px; }

/* BOTÓN PRINCIPAL CYBERPUNK */
.btn-gradient { background: linear-gradient(90deg, #6366f1, #06b6d4); padding: 2px; border-radius: 12px; border: none; cursor: pointer; display: flex; overflow: hidden; }
.btn-content { background: #09090b; color: white; padding: 12px 24px; border-radius: 10px; display: block; font-weight: 700; transition: 0.3s; }
.btn-gradient:hover .btn-content { background: transparent; }

/* MODIFICADOR PARA BOTÓN DE PELIGRO/RECHAZO */
.btn-danger { background: linear-gradient(90deg, #ef4444, #991b1b); }

/* --- PESTAÑAS CYBERPUNK GLASSMORPHISM --- */
.filter-tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 35px;
}

.filter-tabs-glass {
  display: flex;
  background: rgba(9, 9, 11, 0.8); 
  backdrop-filter: blur(12px);
  padding: 6px;
  border-radius: 16px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); 
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #888;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-svg {
  width: 18px;
  height: 18px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.tab-btn:hover:not(.active) { 
  color: white; 
  text-shadow: 0 0 8px rgba(255,255,255,0.5);
}
.tab-btn:hover:not(.active) .tab-svg { opacity: 1; }

.tab-btn.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15));
  color: white;
  border: 1px solid rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(99, 102, 241, 0.2);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}
.tab-btn.active .tab-svg { 
  opacity: 1; 
  color: #06b6d4;
  filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.8));
}

.badge {
  background: linear-gradient(90deg, #6366f1, #06b6d4);
  color: #09090b;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 900;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}

/* GRID */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }

/* ESTADOS VACÍOS Y ONBOARDING (CIRUGÍA CSS) */
.empty-state-pro { 
  text-align: center; 
  padding: 80px 0; 
  background: #18181b; 
  border-radius: 24px; 
  border: 1px solid rgba(255,255,255,0.08); 
  margin-top: 20px; 
}
.glow-icon { 
  font-size: 3rem; 
  color: #06b6d4; 
  margin-bottom: 15px; 
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); 
}
.welcome-title {
  color: white;
  margin-bottom: 5px;
  text-shadow: 0 0 10px rgba(255,255,255,0.2);
}
.welcome-subtitle {
  color: #9ca3af;
  margin-bottom: 25px;
  font-size: 1rem;
}
.onboarding-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px 20px;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
}
.onboarding-box p {
  margin: 10px 0;
  font-size: 0.95rem;
  color: #cffafe;
}
.onboarding-box strong {
  color: white;
}

/* MODALES OSCUROS */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-glass { background: #111113 !important; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; }
.modal-glass h3 { color: white !important; margin-bottom: 25px; text-align: center; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #888; font-size: 0.9rem; }
.form-group input, .form-group select { 
  width: 100%; padding: 12px; background: #1c1c1f !important; 
  border: 1px solid rgba(255,255,255,0.1); color: white !important; border-radius: 8px; box-sizing: border-box; transition: 0.3s;
}

.modal-actions { display: flex; gap: 15px; margin-top: 30px; }
.btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #888; flex: 1; padding: 12px; cursor: pointer; transition: 0.3s; }
.btn-cancel:hover { background: rgba(255,255,255,0.05); color: white; }
.btn-save-modal { flex: 1; }
.save-content { width: 100%; text-align: center; padding: 10px; }

/* --- TOAST NOTIFICATIONS CYBERPUNK --- */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 14px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 3000;
  background: rgba(9, 9, 11, 0.85); 
  backdrop-filter: blur(16px);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.toast-notification.success { 
  border: 1px solid rgba(6, 182, 212, 0.5); 
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(6, 182, 212, 0.1);
}

.toast-notification.error { 
  border: 1px solid rgba(244, 63, 94, 0.5); 
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(244, 63, 94, 0.2), inset 0 0 10px rgba(244, 63, 94, 0.1);
}

.toast-icon { display: flex; align-items: center; justify-content: center; }
.toast-svg { 
  width: 22px; 
  height: 22px; 
  filter: drop-shadow(0 0 6px currentColor); 
}
.toast-notification.success .toast-svg { color: #06b6d4; }
.toast-notification.error .toast-svg { color: #f43f5e; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from { opacity: 0; transform: translateX(50px) scale(0.9); }
.toast-slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }

@media (max-width: 768px) {
  .toast-notification {
    bottom: 24px;
    right: 20px;
    left: 20px;
    justify-content: center;
  }
  .hero-section { flex-direction: column; align-items: flex-start; gap: 20px; } 
  .glitch-title { font-size: 2.2rem; } 
  .hide-mobile { display: none; } 
  
  /* RESPONSIVIDAD DE PESTAÑAS */
  .filter-tabs-container { margin-bottom: 25px; }
  .filter-tabs-glass { width: 100%; }
  .tab-btn { flex: 1; justify-content: center; padding: 12px 16px; }
}
</style>