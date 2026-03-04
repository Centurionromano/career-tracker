<template>
  <div class="card-glass" :class="{ 'rejected-glow': isRejected }">
    <div class="card-header">
      <div class="header-left">
        <div class="company-icon">
          {{ company.charAt(0).toUpperCase() }}
        </div>
        <div class="titles">
          <h3 class="role-title">{{ title }}</h3>
          <p class="company-name">{{ company }}</p>
        </div>
      </div>

      <div class="header-right">
        <div class="action-buttons-group">
          <button 
            v-if="!isRejected" 
            class="btn-archive-direct custom-tooltip" 
            @click.stop="solicitarArchivo" 
            data-tooltip="Mover a Historial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
          </button>
          
          <button class="btn-more" @click.stop="toggleMenu">⋮</button>
        </div>
        
        <transition name="fade">
          <div v-if="isMenuOpen" class="dropdown-menu">
            <button class="dropdown-item" @click="solicitarEdicion">
              <span class="icon-sm">✏️</span> Editar
            </button>
            
            <button v-if="isRejected" class="dropdown-item reactivate-item" @click="solicitarReactivacion">
              <span class="icon-sm">🚀</span> Reactivar Proceso
            </button>

            <button class="dropdown-item delete-item" @click="solicitarEliminacion">
              <span class="icon-sm">🗑️</span> Eliminar
            </button>
          </div>
        </transition>
      </div>
    </div>

    <div class="stepper-container">
      <div class="progress-track"></div>
      <div class="progress-fill" :style="{ width: progressWidth, background: statusColor }"></div>
      
      <div class="steps-wrapper">
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          class="step-item"
          @click="cambiarEstatus(step)" 
          style="cursor: pointer;"
        >
          <div class="step-dot" 
               :class="{ 'active': currentStepIndex >= index, 'current': currentStepIndex === index }"
               :style="currentStepIndex >= index ? { background: statusColor, borderColor: statusColor } : {}">
            <span v-if="currentStepIndex > index">✓</span>
          </div>
          <span class="step-label" :class="{ 'active-label': currentStepIndex >= index }">{{ step }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-actions">
        <button class="btn-action" @click="abrirNotas" title="Ver Notas/Feedback">
        <span class="icon">📝</span>
        <span class="text">Notas</span>
      </button>

        <a v-if="linkCV" :href="linkCV" target="_blank" class="btn-action btn-cv" :class="tipoCV" :title="'Ver CV en ' + tipoCV">
          <svg v-if="tipoCV === 'drive'" class="icon cv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.3 78"><path d="m6.6 66.85 25.3-43.8 25.3 43.8z" fill="#0066da"/><path d="M43.8 23.05 69.1 66.85H18.5z" fill="#e91100"/><path d="M69.1 66.85h17.5L61.3 23.05h-17.5z" fill="#f9ab00"/><path d="M61.3 23.05 43.8 53.35l-17.5-30.3z" fill="#1f8a00"/><path d="M18.5 66.85H.95L26.3 23.05h17.5z" fill="#33a853"/><path d="m43.8 23.05 17.5 30.3H26.3z" fill="#547dbf"/></svg>
          <svg v-if="tipoCV === 'linkedin'" class="icon cv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
          <svg v-if="tipoCV === 'pdf'" class="icon cv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-2 12v-4h2v4h2l-3 3-3-3h2zm4-7V7H8v2h2v2H8v2h2v-2h2v2h2V7h-4z"/></svg>
          <svg v-if="tipoCV === 'otro'" class="icon cv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
          <span class="text">CV</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, default: 'Confidencial' },
  status: { type: String, default: 'Enviada' },
  linkCV: { type: String, default: '' },
  tipoCV: { type: String, default: 'ninguno' }
});

const emit = defineEmits(['update-status', 'delete-vacancy', 'edit-vacancy']);

// --- LÓGICA DEL MENÚ ---
const isMenuOpen = ref(false);
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const closeMenu = (e) => {
  if (!e.target.closest('.header-right')) {
    isMenuOpen.value = false;
  }
};

onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));

// --- ACCIONES ---
const steps = ['Enviada', 'Entrevista', 'Prueba', 'Oferta'];

const cambiarEstatus = (nuevoEstatus) => {
  emit('update-status', props.id, nuevoEstatus);
};

const solicitarArchivo = () => {
  isMenuOpen.value = false;
  emit('update-status', props.id, 'Rechazada');
};

const solicitarReactivacion = () => {
  isMenuOpen.value = false;
  emit('update-status', props.id, 'Enviada');
};

const solicitarEliminacion = () => {
  isMenuOpen.value = false;
  emit('delete-vacancy', props.id);
};

const solicitarEdicion = () => {
  isMenuOpen.value = false;
  emit('edit-vacancy', { 
    id: props.id, 
    title: props.title, 
    company: props.company, 
    status: props.status,
    linkCV: props.linkCV
  });
  };

const abrirNotas = () => {
  emit('edit-notes', { 
    id: props.id, 
    title: props.title, 
    company: props.company 
  });
};


// --- COMPUTADAS VISUALES ---
const isRejected = computed(() => props.status === 'Rechazada');

const currentStepIndex = computed(() => {
  if (isRejected.value) return 1; 
  const idx = steps.indexOf(props.status);
  return idx === -1 ? 0 : idx; 
});

const progressWidth = computed(() => {
  if (isRejected.value) return '100%'; 
  const percent = (currentStepIndex.value / (steps.length - 1)) * 100;
  return `${percent}%`;
});

const statusColor = computed(() => {
  if (isRejected.value) return '#ef4444';
  if (props.status === 'Oferta') return '#10b981';
  if (props.status === 'Prueba') return '#06b6d4';
  if (props.status === 'Entrevista') return '#f59e0b';
  return '#6366f1';
});
</script>

<style scoped>
.card-glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; gap: 20px;
  backdrop-filter: blur(5px);
}

.card-glass:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.rejected-glow { border-color: rgba(239, 68, 68, 0.3); }

/* HEADER */
.card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-left { display: flex; gap: 12px; align-items: center; }
.header-right { position: relative; }

.company-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #1f2937, #111827);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: white; font-size: 1.1rem;
}

.role-title { margin: 0; font-size: 1rem; font-weight: 700; color: white; }
.company-name { margin: 2px 0 0 0; font-size: 0.85rem; color: #9ca3af; }

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-archive-direct {
  background: transparent;
  border: 1px solid transparent;
  color: #d1d5db;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* Necesario para el tooltip custom */
}

.btn-archive-direct:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
  transform: scale(1.05);
}

/* CIRUGÍA CSS: Tooltip Personalizado Inmediato */
.custom-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%; /* Aparece justo arriba del botón */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 17, 19, 0.95); /* Cristal súper oscuro */
  color: #fff;
  font-size: 1rem; /* Texto más grande */
  font-weight: 800; /* Negrita */
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.6); /* Borde neón ámbar */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(245, 158, 11, 0.2);
  white-space: nowrap;
  
  /* Magia de la aparición instantánea */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.05s ease, visibility 0.05s ease; /* Prácticamente inmediato */
  pointer-events: none;
  z-index: 50;
}

.custom-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
}

.btn-more { 
  background: transparent; border: none; color: #6b7280; 
  font-size: 1.5rem; cursor: pointer; padding: 0 5px;
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute; top: 100%; right: 0;
  background: #18181b; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px; padding: 6px; z-index: 100;
  min-width: 175px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.dropdown-item {
  width: 100%; padding: 8px 12px; background: transparent;
  border: none; border-radius: 6px; color: #d1d5db;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 0.85rem; transition: 0.2s;
  text-align: left;
}

.dropdown-item:hover { background: rgba(255,255,255,0.05); color: white; }

.reactivate-item:hover { color: #06b6d4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }
.delete-item:hover { color: #ef4444; }

.icon-sm { font-size: 0.9rem; }

/* STEPPER */
.stepper-container { position: relative; padding: 10px 0; }
.progress-track { position: absolute; top: 22px; left: 0; width: 100%; height: 2px; background: rgba(255, 255, 255, 0.1); }
.progress-fill { position: absolute; top: 22px; left: 0; height: 2px; transition: 0.5s; }
.steps-wrapper { display: flex; justify-content: space-between; position: relative; z-index: 3; }
.step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.step-dot { width: 24px; height: 24px; border-radius: 50%; background: #1f2937; border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white; }
.step-label { font-size: 0.7rem; color: #6b7280; font-weight: 600; }
.step-label.active-label { color: white; }

/* FOOTER - LIMPIO Y FLEXIBLE */
.card-footer { 
  display: flex; 
  justify-content: flex-start; 
  align-items: center; 
  padding-top: 16px; 
  border-top: 1px solid rgba(255, 255, 255, 0.05); 
}
.footer-actions { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  width: 100%;
}

/* ESTILOS DE LOS BOTONES DE ACCIÓN */
.btn-action { 
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.08); 
  padding: 8px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;
  text-decoration: none; transition: all 0.2s ease; color: #d1d5db; font-size: 0.85rem; font-weight: 600;
}
.btn-action:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255,255,255,0.2); color: white; }

.btn-cv.drive:hover { background: rgba(52, 168, 83, 0.15); border-color: #34a853; color: #34a853; }
.btn-cv.linkedin:hover { background: rgba(0, 119, 181, 0.15); border-color: #0077b5; color: #0077b5; }
.btn-cv.pdf:hover { background: rgba(255, 77, 77, 0.15); border-color: #ff4d4d; color: #ff4d4d; }

.cv-svg { width: 18px; height: 18px; }

/* ANIMATION */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>