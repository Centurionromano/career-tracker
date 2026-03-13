<template>
  <div class="insights-dashboard">
    <div class="dashboard-header">
      <h2 class="section-title">Panel de Rendimiento Analítico</h2>
      <p class="section-subtitle">Métricas en tiempo real de tu embudo de conversión y mercado</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card-premium">
        <div class="kpi-header">
          <p class="kpi-label">Total Postulaciones</p>
          <svg class="kpi-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3 class="kpi-value">{{ totalPostulaciones }}</h3>
      </div>

      <div class="kpi-card-premium">
        <div class="kpi-header">
          <p class="kpi-label">Rechazos Analizados</p>
          <svg class="kpi-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h3 class="kpi-value">{{ rechazosAnalizados }}</h3>
      </div>

      <div class="kpi-card-premium">
        <div class="kpi-header">
          <p class="kpi-label">Procesos Activos</p>
          <svg class="kpi-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        </div>
        <h3 class="kpi-value">{{ tasaSupervivencia }}</h3>
      </div>
    </div>

    <div class="charts-grid">
      
      <div class="chart-card-premium">
        <div class="chart-header-group">
          <h3 class="chart-title">Motivos de Rechazo</h3>
          <p class="chart-hint">
            Análisis de por qué se detuvieron los procesos. 
            <span class="hint-highlight">(Haz clic en "Otros" para ver detalles)</span>
          </p>
        </div>
        <div v-if="!hayRechazos" class="empty-state-pro">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <p class="empty-text">Datos insuficientes para análisis.</p>
        </div>
        <div v-else class="chart-content-wrapper">
          <div class="pie-wrapper">
            <Pie :data="datosPie" :options="opcionesPie" />
          </div>
          <div class="custom-saas-legend">
            <div v-for="(item, index) in statsRechazos.legendData" :key="index" 
                  class="legend-item" 
                  :class="{ 'clickable-legend': item.label.toLowerCase().includes('otro') }"
                  @click="item.label.toLowerCase().includes('otro') ? abrirModalOtros() : null">
              <div class="legend-left">
                <span class="legend-dot" :style="{ background: fallbackColors[index] }"></span>
                <span class="legend-label">{{ item.label }}</span>
                <svg v-if="item.label.toLowerCase().includes('otro')" class="legend-link-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </div>
              <span class="legend-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card-premium">
        <div class="chart-header-group">
          <h3 class="chart-title">Habilidades más Buscadas</h3>
          <p class="chart-hint">Lo que los empleadores están pidiendo más en tus postulaciones.</p>
        </div>
        <div v-if="!hayHabilidades" class="empty-state-pro">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12l5.25 5 2.625-3M12.875 14l3.5-4 5.625 5"></path></svg>
          <p class="empty-text">Agrega etiquetas a tus vacantes.</p>
        </div>
        <div v-else class="chart-content-wrapper">
          <div class="chart-wrapper bar-wrapper">
            <Bar :data="datosHabilidades" :options="opcionesHabilidades" />
          </div>
          <div class="custom-saas-legend">
            <div v-for="(item, index) in statsHabilidades.legendData" :key="index" class="legend-item">
              <div class="legend-left">
                <span class="legend-dot" style="background: #8B5CF6"></span>
                <span class="legend-label">{{ item.label }}</span>
              </div>
              <span class="legend-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card-premium">
        <div class="chart-header-group">
          <h3 class="chart-title">Postulaciones Activas</h3>
          <p class="chart-hint">Mide cuántas oportunidades tienes vivas en cada etapa.</p>
        </div>
        <div v-if="!hayPipeline" class="empty-state-pro">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <p class="empty-text">No hay vacantes en proceso activo.</p>
        </div>
        <div v-else class="chart-content-wrapper">
          <div class="chart-wrapper line-wrapper">
            <Line :data="datosPipeline" :options="opcionesPipeline" />
          </div>
          <div class="custom-saas-legend" style="flex-direction: row; flex-wrap: wrap; justify-content: space-between;">
            <div v-for="(item, index) in statsPipeline.legendData" :key="index" class="legend-item" style="min-width: 45%;">
              <div class="legend-left">
                <span class="legend-dot" style="background: #10B981"></span>
                <span class="legend-label">{{ item.label }}</span>
              </div>
              <span class="legend-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showOtrosModal" class="modal-overlay-premium" @click.self="showOtrosModal = false">
          <div class="modal-glass-premium">
            <div class="modal-header-premium">
              <h3 class="modal-title-premium">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: text-bottom;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Desglose: Otros Motivos
              </h3>
              <button class="btn-close-premium" @click="showOtrosModal = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="modal-body-premium">
              <ul class="reasons-list">
                <li v-for="(item, idx) in otrosDetalles" :key="idx" class="reason-item-custom">
                  <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span class="reason-title">{{ item.titulo }}</span>
                    <span class="reason-badge">{{ item.count }} {{ item.count === 1 ? 'vez' : 'veces' }}</span>
                  </div>
                  <p class="reason-text">"{{ item.descripcion }}"</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Pie, Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, Filler,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend, Filler,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
);

const props = defineProps({
  vacantes: { type: Array, required: true, default: () => [] }
});

const showOtrosModal = ref(false);
const otrosDetalles = ref([]);

const abrirModalOtros = () => {
  otrosDetalles.value = statsRechazos.value.othersList;
  showOtrosModal.value = true;
};

const totalPostulaciones = computed(() => props.vacantes.length);
const rechazosAnalizados = computed(() => props.vacantes.filter(v => (v.estatus || v.status) === 'Rechazada').length);
const tasaSupervivencia = computed(() => {
  if (totalPostulaciones.value === 0) return '0%';
  const activas = totalPostulaciones.value - rechazosAnalizados.value;
  return Math.round((activas / totalPostulaciones.value) * 100) + '%';
});

const fallbackColors = ['#6366F1', '#0EA5E9', '#F43F5E', '#10B981'];

const getGradient = (ctx, colorStart, colorEnd, horizontal = false) => {
  const gradient = horizontal ? ctx.createLinearGradient(0, 0, 400, 0) : ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

const statsRechazos = computed(() => {
  const conteo = {};
  let total = 0;
  const inputsPersonalizados = [];
  
  props.vacantes.forEach(vacante => {
    const st = vacante.estatus || vacante.status;
    if (st === 'Rechazada') {
      const motivo = vacante.motivoRechazo || 'No especificado';
      conteo[motivo] = (conteo[motivo] || 0) + 1;
      total++;
      if (motivo.toLowerCase().includes('otro')) {
        const textoReal = vacante.detallesRechazo || vacante.detalleRechazo || 'Sin detalles';
        inputsPersonalizados.push({
          empresa: vacante.empresa || vacante.nombreVacante || 'Empresa',
          texto: textoReal
        });
      }
    }
  });

  const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const topCategories = [];
  const othersCategories = [];

  sorted.forEach(item => {
    if (item[0].toLowerCase().includes('otro')) {
      othersCategories.push(item);
    } else if (topCategories.length < 3) {
      topCategories.push(item);
    } else {
      othersCategories.push(item);
    }
  });

  const othersCount = othersCategories.reduce((sum, item) => sum + item[1], 0);
  const othersList = inputsPersonalizados.map(input => ({
    titulo: input.empresa,
    descripcion: input.texto,
    count: 1 
  }));

  othersCategories.forEach(item => {
    if (!item[0].toLowerCase().includes('otro')) {
      othersList.push({ titulo: 'Motivo General', descripcion: item[0], count: item[1] });
    }
  });

  const finalData = [...topCategories];
  if (othersCount > 0) finalData.push(['Otros Motivos', othersCount]);

  return { 
    labels: finalData.map(i => i[0]), 
    values: finalData.map(i => i[1]), 
    legendData: finalData.map(item => ({ label: item[0], percentage: total > 0 ? Math.round((item[1] / total) * 100) : 0 })), 
    othersList 
  };
});

const hayRechazos = computed(() => statsRechazos.value.values.length > 0);

const datosPie = computed(() => ({
  labels: statsRechazos.value.labels,
  datasets: [{
    data: statsRechazos.value.values,
    backgroundColor: (context) => {
      const { ctx, chartArea } = context.chart;
      if (!chartArea) return null; 
      const gradients = ['#6366F1', '#0EA5E9', '#F43F5E', '#10B981'];
      return gradients[context.dataIndex % gradients.length];
    },
    borderColor: '#111113', borderWidth: 4, borderRadius: 4, hoverOffset: 6
  }]
}));

const opcionesPie = { 
  responsive: true, maintainAspectRatio: false, 
  plugins: { 
    legend: { display: false }, 
    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 } 
  },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const label = statsRechazos.value.labels[elements[0].index];
      if (label.toLowerCase().includes('otro')) abrirModalOtros();
    }
  }
};

const statsHabilidades = computed(() => {
  const conteo = {};
  let total = 0; 
  props.vacantes.forEach(v => {
    if (v.tags) v.tags.forEach(tag => {
      const formatted = tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1).toLowerCase();
      conteo[formatted] = (conteo[formatted] || 0) + 1;
      total++;
    });
  });
  const sorted = Object.entries(conteo).sort((a,b) => b[1] - a[1]).slice(0, 5);
  return { 
    labels: sorted.map(i => i[0]), 
    values: sorted.map(i => i[1]), 
    legendData: sorted.map(item => ({ label: item[0], percentage: total > 0 ? Math.round((item[1] / total) * 100) : 0 }))
  };
});

const hayHabilidades = computed(() => statsHabilidades.value.values.length > 0);

const datosHabilidades = computed(() => ({
  labels: statsHabilidades.value.labels,
  datasets: [{
    label: 'Menciones',
    data: statsHabilidades.value.values,
    backgroundColor: (context) => {
      const { ctx, chartArea } = context.chart;
      if (!chartArea) return null;
      return getGradient(ctx, '#0EA5E9', '#8B5CF6', true); 
    },
    borderRadius: 6,
    barThickness: 16
  }]
}));

const opcionesHabilidades = {
  responsive: true, maintainAspectRatio: false, indexAxis: 'y', 
  plugins: { legend: { display: false } },
  scales: { x: { display: false }, y: { border: { display: false }, grid: { display: false }, ticks: { color: '#cbd5e1' } } }
};

const statsPipeline = computed(() => {
  const stages = { 'Enviada': 0, 'Entrevista': 0, 'Prueba': 0, 'Oferta': 0 };
  let total = 0; 
  props.vacantes.forEach(v => {
    const st = v.estatus || v.status;
    if (st in stages) { stages[st]++; total++; }
  });
  return { 
    labels: Object.keys(stages), 
    values: Object.values(stages), 
    legendData: Object.keys(stages).map((l, i) => ({ label: l, percentage: total > 0 ? Math.round((Object.values(stages)[i] / total) * 100) : 0 }))
  };
});

const hayPipeline = computed(() => statsPipeline.value.values.some(v => v > 0));

const datosPipeline = computed(() => ({
  labels: statsPipeline.value.labels,
  datasets: [{
    label: 'Volumen',
    data: statsPipeline.value.values,
    borderColor: '#10B981', 
    backgroundColor: (context) => {
      const { ctx, chartArea } = context.chart;
      if (!chartArea) return null;
      return getGradient(ctx, 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.0)');
    },
    fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5
  }]
}));

const opcionesPipeline = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8' } }, y: { display: false } }
};
</script>

<style scoped>
/* ESTRUCTURA GENERAL */
.insights-dashboard { 
  display: flex; flex-direction: column; gap: 24px; margin-top: 10px; 
  font-family: 'Inter', system-ui, sans-serif;
}

.dashboard-header { margin-bottom: 8px; }
.section-title { color: #f8fafc; font-size: 1.25rem; font-weight: 600; margin: 0; }
.section-subtitle { color: #64748b; font-size: 0.85rem; margin: 4px 0 0 0; }

/* KPIs - ESCRITORIO ORIGINAL */
.kpi-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 16px; 
}

.kpi-card-premium {
  background: rgba(15, 23, 42, 0.4); 
  border: 1px solid rgba(255, 255, 255, 0.06); 
  border-radius: 12px;
  padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.2s ease;
}

.kpi-card-premium:hover { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.1); }
.kpi-header { display: flex; justify-content: space-between; align-items: center; }
.kpi-label { color: #94a3b8; font-size: 0.8rem; margin: 0; font-weight: 500; }
.kpi-value { color: #f8fafc; font-size: 1.6rem; font-weight: 600; margin: 0; line-height: 1; }

/* GRÁFICAS */
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
@media (min-width: 1024px) { .charts-grid { grid-template-columns: repeat(3, 1fr); } }

.chart-card-premium {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06); 
  border-radius: 12px; padding: 24px;
  display: flex; flex-direction: column;
}

.chart-header-group { display: flex; flex-direction: column; align-items: flex-start; width: 100%; margin-bottom: 8px; }
.chart-title { font-size: 0.95rem; color: #cbd5e1; font-weight: 600; margin: 0; margin-bottom: 8px; }
.chart-hint { font-size: 0.8rem; line-height: 1.4; color: #64748b; margin: 0; margin-bottom: 20px; }
.hint-highlight { color: #94a3b8; font-weight: 600; }

.chart-content-wrapper { display: flex; flex-direction: column; align-items: center; gap: 24px; flex: 1; width: 100%;}
.pie-wrapper { position: relative; height: 200px; width: 200px; margin: 0 auto;}
.bar-wrapper, .line-wrapper { height: 200px; width: 100%; }

.empty-state-pro { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; opacity: 0.6; }
.empty-text { color: #64748b; font-size: 0.85rem; margin-top: 10px; }

/* LEYENDAS */
.custom-saas-legend { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: auto;}
.legend-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.legend-left { display: flex; align-items: center; gap: 8px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-label { font-size: 0.85rem; color: #cbd5e1; }
.legend-percent { font-size: 0.9rem; font-weight: 700; color: #ffffff; }
.clickable-legend { cursor: pointer; border-radius: 6px; }
.legend-link-icon { color: #64748b; margin-left: 4px; }

/* MODAL */
.modal-overlay-premium { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
.modal-glass-premium { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; width: 100%; max-width: 420px; }
.modal-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-title-premium { color: #f8fafc; font-size: 1.1rem; margin: 0; }
.btn-close-premium { background: none; border: none; color: #64748b; font-size: 1.5rem; cursor: pointer; }
.reason-item-custom { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px; list-style: none; }
.reason-title { color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.reason-text { color: #f8fafc; font-size: 0.95rem; margin: 4px 0 0; font-style: italic; }
.reason-badge { background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }

/* =========================================
   RESPONSIVO QUIRÚRGICO (VIEJONES MODE)
   ========================================= */
@media (max-width: 600px) {
  /* KPIs compactos pero con letra legible */
  .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; }
  .kpi-grid div:nth-child(3) { grid-column: span 2; }
  .kpi-card-premium { padding: 12px 14px !important; height: 90px !important; gap: 4px; }
  .kpi-label { font-size: 0.95rem !important; font-weight: 600; }
  .kpi-value { font-size: 1.6rem !important; }

  /* Fuentes aumentadas en gráficas */
  .chart-title { font-size: 1.2rem !important; }
  .chart-hint { font-size: 0.95rem !important; line-height: 1.5; margin-bottom: 24px !important; }
  
  .legend-label { font-size: 1rem !important; }
  .legend-percent { font-size: 1.1rem !important; }
  .legend-dot { width: 12px !important; height: 12px !important; }
  .legend-item { padding: 8px 0 !important; }

  /* Modal legible */
  .reason-title { font-size: 0.95rem !important; }
  .reason-text { font-size: 1.1rem !important; line-height: 1.6; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>