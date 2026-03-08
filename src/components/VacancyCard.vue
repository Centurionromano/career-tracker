<template>
  <div class="card-glass" :class="{ 'rejected-glow': isRejected, 'menu-active': isMenuOpen }">
    
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

    <button 
      v-if="tags && tags.length > 0" 
      class="btn-skills-sm" 
      @click.stop="showTagsModal = true" 
      title="Ver lista de habilidades"
    >
      <svg class="icon-skills" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 17 22 12"></polyline>
      </svg>
      Habilidades ({{ tags.length }})
    </button>

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
          <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span class="text">Notas</span>
        </button>

        <a v-if="linkCV" :href="linkCV" target="_blank" class="btn-action" title="Ver CV">
          <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="text">CV</span>
        </a>
      </div>
    </div>
  </div>

  <transition name="fade">
    <div v-if="showTagsModal" class="modal-overlay-local" @click.self="showTagsModal = false">
      <div class="modal-glass-local">
        <div class="modal-header-local">
          <h3>Habilidades y Herramientas</h3>
          <button class="btn-close-local" @click="showTagsModal = false">×</button>
        </div>
        <div class="tags-grid-local">
          <span v-for="(tag, idx) in tags" :key="idx" class="tag-pill-modal">{{ tag }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, default: 'Confidencial' },
  status: { type: String, default: 'Enviada' },
  linkCV: { type: String, default: '' },
  tipoCV: { type: String, default: 'ninguno' },
  tags: { type: Array, default: () => [] } 
});

const emit = defineEmits(['update-status', 'delete-vacancy', 'edit-vacancy', 'edit-notes']);

const isMenuOpen = ref(false);
const showTagsModal = ref(false);
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const closeMenu = (e) => {
  if (!e.target.closest('.header-right')) {
    isMenuOpen.value = false;
  }
};

onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));

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
    linkCV: props.linkCV,
    tags: props.tags 
  });
};

const abrirNotas = () => {
  emit('edit-notes', { 
    id: props.id, 
    title: props.title, 
    company: props.company 
  });
};

const isRejected = computed(() => props.status === 'Rechazada');

// CIRUGÍA: Variables computadas para mostrar máximo 2 tags
const visibleTags = computed(() => {
  if (!props.tags) return [];
  return props.tags.slice(0, 2);
});

const extraTagsCount = computed(() => {
  if (!props.tags) return 0;
  return Math.max(0, props.tags.length - 2);
});

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
/* Respetando tus bloques de borde guardados intactos */
.card-glass {
  background: linear-gradient(#111113, #111113) padding-box, 
              linear-gradient(135deg, #ffffff, #b9cae3) border-box;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: visible;
  box-sizing: border-box;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; gap: 20px;
  height: 100%; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), 
              0 0 5px rgba(255, 255, 255, 0.6), 
              inset 0 0 2px rgba(255, 255, 255, 0.4);
}

.card-glass {
  background: linear-gradient(#111113, #111113) padding-box, 
              linear-gradient(135deg, #c6f6d5, #22543d) border-box;
  border: 1.5px solid transparent; 
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: visible;
  box-sizing: border-box;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; gap: 20px;
  height: 100%; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), 
              0 0 6px rgba(72, 187, 120, 0.35), 
              inset 0 0 4px rgba(72, 187, 120, 0.1);
}

/* ------------------------------------------------------------------
   CIRUGÍA: EL CRISTAL AHUMADO ORIGINAL (Cero ruido, 100% Minimalismo)
------------------------------------------------------------------- */
.card-glass {
  /* Fondo oscuro translúcido que deja adivinar el fondo de la app */
  background: rgba(200, 220, 255, 0.10);
  backdrop-filter: blur(12px); /* El verdadero efecto Glassmorphism */
  
  /* Borde ultra discreto, apenas un reflejo de luz (15% de opacidad) */
  border: 1px solid rgba(139, 92, 246, 0.15); 
  border-radius: 16px;
  padding: 20px;
  position: relative;
  display: flex; 
  flex-direction: column; 
  gap: 20px;
  height: 100%; 
  
  /* Sombra oscura para separar la tarjeta del fondo, sin emitir luz */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); 
  transition: all 0.3s ease;
}

.card-glass:hover { 
  transform: translateY(-4px); 
  
  /* Al pasar el mouse, solo se aclara sutilmente el fondo y el borde */
  background: rgba(255, 255, 255, 0.03); 
  border-color: rgba(255, 255, 255, 0.15); 
  
  /* La sombra se hace un poco más profunda, no más brillante */
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.rejected-glow { 
  background: linear-gradient(#111113, #111113) padding-box, 
              linear-gradient(135deg, rgba(239, 68, 68, 0.7), rgba(153, 27, 27, 0.7)) border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.9), 
              0 0 12px rgba(239, 68, 68, 0.3), 
              0 0 25px rgba(153, 27, 27, 0.2),
              inset 0 0 10px rgba(239, 68, 68, 0.15);
}

.rejected-glow:hover {
  background: linear-gradient(#111113, #111113) padding-box, 
              linear-gradient(135deg, #ef4444, #991b1b) border-box;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 1), 
              0 0 20px rgba(239, 68, 68, 0.5), 
              0 0 40px rgba(153, 27, 27, 0.35),
              inset 0 0 15px rgba(153, 27, 27, 0.25);
}

.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; }
.header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 0; }
.header-right { position: relative; flex-shrink: 0; }
.company-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #1f2937, #111827); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1.1rem; flex-shrink: 0; }

.titles { display: flex; flex-direction: column; flex: 1; }
.role-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: white; line-height: 1.3; }
.company-name { margin: 4px 0 0 0; font-size: 0.85rem; color: #9ca3af; line-height: 1.3; }

/* ------------------------------------------------------------------
   CIRUGÍA: NUEVO ESTILO DE TAGS (Minimalista y Discreto)
   El antiguo efecto Cyberpunk Neón está aquí guardado para que
   lo rescates y uses en la Action Bar del dashboard principal:
   
   .tag-pill-old {
     background: linear-gradient(#111113, #111113) padding-box, linear-gradient(90deg, #06b6d4, #8b5cf6) border-box;
     border: 1px solid transparent;
     color: #e0e7ff;
     box-shadow: 0 0 10px rgba(139, 92, 246, 0.2); 
   }
------------------------------------------------------------------- */
.tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: -8px; }

.tag-pill {
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  color: #94a3b8; 
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.tag-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(56, 189, 248, 0.4); 
  color: #e0e7ff;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.15);
  transform: translateY(-1px);
}

.tag-pill-extra {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.action-buttons-group { display: flex; align-items: center; gap: 6px; }
.btn-archive-direct { background: transparent; border: 1px solid transparent; color: #d1d5db; font-size: 1.1rem; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; position: relative; }
.btn-archive-direct:hover { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); box-shadow: 0 0 8px rgba(245, 158, 11, 0.2); transform: scale(1.05); }

@media (hover: hover) {
  .custom-tooltip::after { content: attr(data-tooltip); position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%); background: rgba(17, 17, 19, 0.95); color: #fff; font-size: 1rem; font-weight: 800; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.6); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(245, 158, 11, 0.2); white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity 0.05s ease, visibility 0.05s ease; pointer-events: none; z-index: 50; }
  .custom-tooltip:hover::after { opacity: 1; visibility: visible; }
}

.btn-more { background: transparent; border: none; color: #6b7280; font-size: 1.5rem; cursor: pointer; padding: 0 5px; }
.dropdown-menu { position: absolute; top: 100%; right: 0; background: #18181b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 6px; z-index: 100; min-width: 175px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
.dropdown-item { width: 100%; padding: 8px 12px; background: transparent; border: none; border-radius: 6px; color: #d1d5db; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.85rem; transition: 0.2s; text-align: left; }
.dropdown-item:hover { background: rgba(255,255,255,0.05); color: white; }
.reactivate-item:hover { color: #06b6d4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }
.delete-item:hover { color: #ef4444; }
.icon-sm { font-size: 0.9rem; }
.stepper-container { position: relative; padding: 10px 0; margin-top: auto;}
.progress-track { position: absolute; top: 22px; left: 0; width: 100%; height: 2px; background: rgba(255, 255, 255, 0.1); }
.progress-fill { position: absolute; top: 22px; left: 0; height: 2px; transition: 0.5s; }
.steps-wrapper { display: flex; justify-content: space-between; position: relative; z-index: 3; }
.step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.step-dot { width: 24px; height: 24px; border-radius: 50%; background: #1f2937; border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white; }
.step-label { font-size: 0.7rem; color: #6b7280; font-weight: 600; }
.step-label.active-label { color: white; }
.card-footer { display: flex; justify-content: flex-start; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
.footer-actions { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.btn-action { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.08); padding: 8px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; text-decoration: none; transition: all 0.2s ease; color: #d1d5db; font-size: 0.85rem; font-weight: 600; }
.btn-action:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255,255,255,0.2); color: white; }
.btn-cv.drive:hover { background: rgba(52, 168, 83, 0.15); border-color: #34a853; color: #34a853; }
.btn-cv.linkedin:hover { background: rgba(0, 119, 181, 0.15); border-color: #0077b5; color: #0077b5; }
.btn-cv.pdf:hover { background: rgba(255, 77, 77, 0.15); border-color: #ff4d4d; color: #ff4d4d; }
.cv-svg { width: 18px; height: 18px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ------------------------------------------------------------------
   CIRUGÍA: MODAL DE SKILLS (Responsivo y Cyberpunk)
------------------------------------------------------------------- */
.modal-overlay-local { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); 
  display: flex; align-items: center; justify-content: center; 
  z-index: 3000; padding: 20px; box-sizing: border-box; 
}
.modal-glass-local { 
  background: rgba(17, 17, 19, 0.95); 
  border: 1px solid rgba(56, 189, 248, 0.3); 
  padding: 24px; border-radius: 20px; 
  width: 100%; max-width: 380px; 
  box-shadow: 0 10px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(56, 189, 248, 0.1); 
}
.modal-header-local { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header-local h3 { margin: 0; color: white; font-size: 1.05rem; letter-spacing: 0.5px;}
.btn-close-local { background: transparent; border: none; color: #9ca3af; font-size: 1.8rem; cursor: pointer; line-height: 1; transition: 0.2s; padding: 0; }
.btn-close-local:hover { color: #f43f5e; text-shadow: 0 0 8px rgba(244, 63, 94, 0.5); }
.tags-grid-local { display: flex; flex-wrap: wrap; gap: 10px; max-height: 60vh; overflow-y: auto; padding-bottom: 5px;}
/* Scrollbar ultra delgado para el modal */
.tags-grid-local::-webkit-scrollbar { height: 4px; width: 4px; }
.tags-grid-local::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.4); border-radius: 10px; }

/* Las tags dentro del modal: elegantes y clickeables visualmente */
.tag-pill-modal { 
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: #e2e8f0; font-size: 0.85rem; padding: 8px 16px; 
  border-radius: 20px; font-weight: 600; letter-spacing: 0.5px; 
  transition: all 0.3s ease; 
}
.tag-pill-modal:hover { 
  border-color: #38bdf8; background: rgba(56, 189, 248, 0.1); 
  color: #38bdf8; transform: translateY(-2px); 
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.2);
}

/* ------------------------------------------------------------------
   CIRUGÍA: MICRO-BOTÓN DE HABILIDADES (Bajo la empresa)
------------------------------------------------------------------- */
.btn-skills-sm {
  margin-top: 8px;
  background: rgba(56, 189, 248, 0.08); /* Azul cielo súper translúcido */
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content; /* Responsivo: Solo ocupa lo que necesita */
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ------------------------------------------------------------------
   CIRUGÍA: MICRO-BOTÓN DE HABILIDADES (Bajo la empresa - Corregido)
------------------------------------------------------------------- */
.btn-skills-sm {
  /* Cero márgenes manuales. El 'gap: 20px' de la tarjeta hace la matemática perfecta arriba y abajo */
  margin: 0;
  align-self: flex-start; /* Lo ancla al margen izquierdo maestro de la tarjeta */
  
  background: rgba(56, 189, 248, 0.08); 
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 6px 14px; 
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-skills-sm:hover {
  background: rgba(56, 189, 248, 0.15);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
  transform: translateY(-1px);
}

.icon-skills {
  opacity: 0.9;
}
</style>