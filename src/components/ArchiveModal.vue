<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="cerrarModal">
    <div class="modal-glass rejection-glass">
      <h3 class="rejection-title">Archivar Vacante</h3>
      <p class="rejection-subtitle">Para futuras métricas, ¿cuál fue el motivo principal de este rechazo?</p>
      
      <form @submit.prevent="procesarArchivado">
        <div class="form-group select-container">
          <select v-model="motivoPrincipal" required class="rejection-select">
            <option value="" disabled hidden>Selecciona un motivo...</option>
            <option value="Nunca respondieron">🤐 Nunca respondieron</option>
            <option value="El salario era muy bajo">💸 Salario insuficiente</option>
            <option value="Decidí retirarme del proceso">🏃‍♀️ Decidí retirarme</option>
            <option value="Cultura laboral tóxica">☠️ Cultura laboral tóxica</option>
          </select>
        </div>

        <div v-if="motivoPrincipal === 'Nunca respondieron'" class="smart-chips-container">
         <p class="chips-title"><span class="emoji-grande">🤔</span> Cuando no hay respuesta en la etapa de <strong>{{ etapaActual }}</strong>, usualmente es por una de estas razones:</p>
          <div class="chips-grid">
            <button
              v-for="chip in chipsSugeridos"
              :key="chip"
              @click="seleccionarChip(chip)"
              type="button"
              class="chip-btn"
              :class="{ 'chip-active': chipSeleccionado === chip }"
            >
              {{ chip }}
            </button>
          </div>

          <div v-if="chipSeleccionado === 'Otro motivo'" class="otro-motivo-container">
            <input
              v-model="textoOtroMotivo"
              type="text"
              placeholder="Ej. Cuota de ventas irreal..."
              class="otro-input"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button 
            type="submit" 
            class="btn-gradient btn-danger" 
            :disabled="!isFormValid"
            :class="{ 'btn-disabled': !isFormValid }"
          >
            <span class="btn-content save-content">Confirmar y Archivar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  vacanteActiva: Object 
});

const emit = defineEmits(['close', 'confirmar-archivo']);

const motivoPrincipal = ref('');
const chipSeleccionado = ref('');
const textoOtroMotivo = ref('');

const etapaActual = computed(() => props.vacanteActiva?.etapa || 'Enviada');

const chipsSugeridos = computed(() => {
  if (etapaActual.value === 'Enviada') return ['🤖 No lo leyó un humano', '📉 Falta de experiencia', '🌍 Ubicación / Zona horaria', '🛑 Vacante cancelada', 'Otro motivo'];
  if (etapaActual.value === 'Entrevista') return ['💰 Expectativa salarial', '🤝 Fit cultural', '🗣️ Nivel de inglés', '📍 Exigen residir en el país', 'Otro motivo'];
  if (etapaActual.value === 'Prueba') return ['💻 Stack distinto', '🏗️ Buscaban otra arquitectura', '⏱️ Tiempo de entrega', '🧹 Faltaron buenas prácticas', 'Otro motivo'];
  return ['Otro motivo'];
});

const seleccionarChip = (chip) => {
  chipSeleccionado.value = chip;
  if (chip !== 'Otro motivo') {
    textoOtroMotivo.value = ''; 
  }
};

const isFormValid = computed(() => {
  if (!motivoPrincipal.value) return false;
  if (motivoPrincipal.value === 'Nunca respondieron') {
    if (!chipSeleccionado.value) return false;
    if (chipSeleccionado.value === 'Otro motivo' && !textoOtroMotivo.value.trim()) return false;
  }
  return true;
});

const cerrarModal = () => {
  motivoPrincipal.value = '';
  chipSeleccionado.value = '';
  textoOtroMotivo.value = '';
  emit('close');
};

const procesarArchivado = () => {
  let motivoFinal = motivoPrincipal.value;
  let detallesFinal = null;

  if (motivoPrincipal.value === 'Nunca respondieron') {
    if (chipSeleccionado.value === 'Otro motivo') {
      motivoFinal = 'Otro'; 
      detallesFinal = textoOtroMotivo.value; 
    } else {
      motivoFinal = chipSeleccionado.value;
    }
  }

  emit('confirmar-archivo', {
    motivoRechazo: motivoFinal,
    detallesRechazo: detallesFinal
  });

  cerrarModal();
};
</script>

<style scoped>
.modal-overlay { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0,0,0,0.8); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 2000; 
}

.modal-glass { 
  background: #111113 !important; 
  border: 1px solid rgba(255,255,255,0.1); 
  padding: 30px; 
  border-radius: 20px; 
  width: 90%; 
  max-width: 400px; 
  box-sizing: border-box; 
}

.rejection-glass { 
  border-color: rgba(239, 68, 68, 0.3); 
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.1); 
}

.rejection-title { 
  color: #ef4444 !important; 
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); 
  margin-bottom: 10px !important; 
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

.rejection-subtitle { 
  color: #9ca3af; 
  font-size: 0.85rem; 
  text-align: center; 
  margin-bottom: 25px; 
}

.form-group { 
  margin-bottom: 20px; 
  width: 100%; 
}

.select-container {
  width: 100%;
}

.rejection-select { 
  width: 100%; 
  display: block; 
  padding: 12px; 
  background: #1c1c1f !important; 
  border: 1px solid rgba(255,255,255,0.1); 
  color: white !important; 
  border-radius: 8px; 
  transition: 0.3s;
  cursor: pointer;
  box-sizing: border-box; 
}

.rejection-select:focus { 
  border-color: #ef4444 !important; 
  outline: none; 
}

.smart-chips-container {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(9, 9, 11, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.chips-title {
  color: #06b6d4;
  font-family: monospace;
  font-size: 0.75rem;
  margin-top: 0;
  margin-bottom: 15px;
  line-height: 1.4;
}
.chips-title strong {
  color: #67e8f9;
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #4b5563;
  color: #9ca3af;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover {
  border-color: rgba(6, 182, 212, 0.5);
  color: #cffafe;
}

.chip-active {
  background: rgba(6, 182, 212, 0.2);
  border-color: #06b6d4;
  color: #67e8f9;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

.otro-motivo-container {
  margin-top: 15px;
  animation: fadeIn 0.3s ease-out;
}

.otro-input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.5);
  color: #cffafe;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box; 
}
.otro-input:focus {
  border-color: #06b6d4;
  box-shadow: 0 0 5px rgba(6, 182, 212, 0.3);
}

.modal-actions { display: flex; gap: 15px; margin-top: 30px; }
.btn-cancel { 
  background: transparent; 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; 
  color: #888; 
  flex: 1; 
  padding: 12px; 
  cursor: pointer; 
  transition: 0.3s; 
}
.btn-cancel:hover { background: rgba(255,255,255,0.05); color: white; }

.btn-gradient { 
  background: linear-gradient(90deg, #6366f1, #06b6d4); 
  padding: 2px; 
  border-radius: 12px; 
  border: none; 
  cursor: pointer; 
  display: flex; 
  flex: 1;
  overflow: hidden; 
}
.btn-danger { background: linear-gradient(90deg, #ef4444, #991b1b); }
.btn-disabled { opacity: 0.5; cursor: not-allowed; }

.btn-content { 
  background: #09090b; 
  color: white; 
  padding: 10px 24px; 
  border-radius: 10px; 
  display: block; 
  font-weight: 700; 
  transition: 0.3s; 
  width: 100%;
  text-align: center;
}
.btn-gradient:not(.btn-disabled):hover .btn-content { background: transparent; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .modal-glass {
    padding: 20px;
  }
  .rejection-select {
    font-size: 0.9rem;
  }
  .modal-actions {
    flex-direction: column;
  }
}

.emoji-grande {
  font-size: 1rem; 
  vertical-align: middle; 
  margin-right: 4px; 
}
</style>