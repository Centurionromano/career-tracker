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
      <button class="btn-more">⋮</button>
    </div>

    <div class="stepper-container">
      <div class="progress-track"></div>
      <div class="progress-fill" :style="{ width: progressWidth, background: statusColor }"></div>
      
      <div class="steps-wrapper">
        <div v-for="(step, index) in steps" :key="index" class="step-item">
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
      <span class="posted-date">Hace 2 días</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  company: { type: String, default: 'Confidencial' },
  status: { type: String, default: 'Enviada' }
});

// --- CAMBIO QUIRÚRGICO: 4 PASOS ---
const steps = ['Enviada', 'Entrevista', 'Prueba', 'Oferta'];

const isRejected = computed(() => props.status === 'Rechazada');

const currentStepIndex = computed(() => {
  if (isRejected.value) return 1; 
  const idx = steps.indexOf(props.status);
  return idx === -1 ? 0 : idx; 
});

const progressWidth = computed(() => {
  if (isRejected.value) return '100%'; 
  // Ajuste matemático para 4 pasos
  const percent = (currentStepIndex.value / (steps.length - 1)) * 100;
  return `${percent}%`;
});

// --- COLORES ACTUALIZADOS ---
const statusColor = computed(() => {
  if (isRejected.value) return '#ef4444'; // Rojo (Rechazada)
  if (props.status === 'Oferta') return '#10b981'; // Verde (Éxito)
  if (props.status === 'Prueba') return '#06b6d4'; // Cyan (Nuevo estado - Tech Challenge)
  if (props.status === 'Entrevista') return '#f59e0b'; // Naranja (Proceso)
  return '#6366f1'; // Indigo (Inicio)
});
</script>

<style scoped>
/* ESTILOS INTACTOS - SOLO SE ADAPTAN AUTOMÁTICAMENTE */
.card-glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; gap: 20px;
  backdrop-filter: blur(5px);
}

.card-glass:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.rejected-glow { border-color: rgba(239, 68, 68, 0.3); }

/* HEADER */
.card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-left { display: flex; gap: 12px; align-items: center; }

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
.btn-more { background: transparent; border: none; color: #6b7280; font-size: 1.2rem; cursor: pointer; }

/* STEPPER CONTAINER */
.stepper-container { position: relative; padding: 10px 0; margin-top: 5px; }

.progress-track {
  position: absolute; top: 22px; left: 0; width: 100%; height: 2px;
  background: rgba(255, 255, 255, 0.1); z-index: 1; border-radius: 2px;
}

.progress-fill {
  position: absolute; top: 22px; left: 0; height: 2px;
  z-index: 2; border-radius: 2px; transition: width 0.5s ease, background 0.3s;
}

.steps-wrapper {
  display: flex; justify-content: space-between; position: relative; z-index: 3;
}

.step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }

.step-dot {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #1f2937;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; color: white;
  transition: all 0.3s;
}

.step-label { font-size: 0.7rem; color: #6b7280; font-weight: 600; transition: color 0.3s; }
.step-label.active-label { color: white; }

/* FOOTER */
.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-action {
  background: rgba(255, 255, 255, 0.05);
  border: none; padding: 6px 12px; border-radius: 6px;
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; transition: background 0.2s;
}
.btn-action:hover { background: rgba(255, 255, 255, 0.1); }
.btn-action .icon { font-size: 0.9rem; }
.btn-action .text { font-size: 0.8rem; color: #d1d5db; font-weight: 500; }

.posted-date { font-size: 0.75rem; color: #6b7280; }
</style>