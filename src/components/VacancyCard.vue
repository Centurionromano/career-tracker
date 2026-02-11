<template>
  <div class="card-glass">
    <div class="card-header">
      <div class="company-icon">
        {{ company.charAt(0).toUpperCase() }}
      </div>
      <div class="status-badge" :class="statusColor">
        <span class="status-dot"></span>
        {{ status }}
      </div>
    </div>

    <div class="card-body">
      <h3 class="role-title">{{ title }}</h3>
      <p class="company-name">{{ company }}</p>
    </div>

    <div class="card-footer">
      <span class="posted-date">Hace 2 días</span>
      <button class="btn-icon">
        ➜
      </button>
    </div>

    <div class="hover-glow"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  company: { type: String, default: 'Confidencial' },
  status: { type: String, default: 'Enviada' }
});

// Lógica simple para colorear el estado
const statusColor = computed(() => {
  const s = props.status.toLowerCase();
  if (s.includes('entrevista')) return 'status-warning';
  if (s.includes('oferta')) return 'status-success';
  if (s.includes('rechazo')) return 'status-danger';
  return 'status-neutral';
});
</script>

<style scoped>
/* 1. EL CONTENEDOR (La Tarjeta de Vidrio) */
.card-glass {
  background: rgba(255, 255, 255, 0.03); /* Casi transparente */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Borde sutil */
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(5px); /* Desenfoque del fondo */
}

/* Interacción: Al pasar el mouse, se eleva y brilla el borde */
.card-glass:hover {
  transform: translateY(-5px);
  border-color: rgba(139, 92, 246, 0.5); /* Borde violeta neón */
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

/* 2. HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1f2937, #111827);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 1.2rem;
}

/* Badges de Estado (Etiquetas) */
.status-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* Colores de los estados (Neón suave) */
.status-neutral { background: rgba(255, 255, 255, 0.1); color: #9ca3af; border-color: rgba(255, 255, 255, 0.1); }
.status-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); } /* Amarillo */
.status-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); } /* Verde */
.status-danger  { background: rgba(239, 68, 68, 0.15);  color: #f87171; border-color: rgba(239, 68, 68, 0.3); } /* Rojo */

/* 3. BODY */
.role-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f3f4f6; /* Blanco casi puro */
  line-height: 1.3;
}

.company-name {
  margin: 0;
  font-size: 0.9rem;
  color: #9ca3af; /* Gris medio */
}

/* 4. FOOTER */
.card-footer {
  margin-top: auto; /* Empuja el footer al fondo */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.posted-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s, color 0.2s;
  padding: 0;
}

.card-glass:hover .btn-icon {
  color: #fff;
  transform: translateX(3px); /* Pequeña animación de flecha */
}

/* Efecto visual extra */
.hover-glow {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.1), transparent 40%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.card-glass:hover .hover-glow { opacity: 1; }
</style>