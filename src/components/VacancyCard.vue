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
        <button class="btn-more" @click.stop="toggleMenu">⋮</button>
        
        <transition name="fade">
          <div v-if="isMenuOpen" class="dropdown-menu">
            <button class="dropdown-item" @click="solicitarEdicion">
              <span class="icon-sm">✏️</span> Editar
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
        <button class="btn-action" title="Ver Notas/Feedback">
          <span class="icon">📝</span>
          <span class="text">Notas</span>
        </button>
      </div>
      <span class="posted-date">Actualizado ahora</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, default: 'Confidencial' },
  status: { type: String, default: 'Enviada' }
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
    status: props.status 
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
  overflow: visible; /* Cambiado para que el menú se vea */
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

.btn-more { 
  background: transparent; border: none; color: #6b7280; 
  font-size: 1.5rem; cursor: pointer; padding: 0 5px;
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute; top: 100%; right: 0;
  background: #18181b; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px; padding: 6px; z-index: 100;
  min-width: 130px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.dropdown-item {
  width: 100%; padding: 8px 12px; background: transparent;
  border: none; border-radius: 6px; color: #d1d5db;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 0.85rem; transition: 0.2s;
}

.dropdown-item:hover { background: rgba(255,255,255,0.05); color: white; }
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

/* FOOTER */
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
.btn-action { background: rgba(255, 255, 255, 0.05); border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; gap: 6px; }
.text { font-size: 0.8rem; color: #d1d5db; }
.posted-date { font-size: 0.75rem; color: #6b7280; }

/* ANIMATION */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>