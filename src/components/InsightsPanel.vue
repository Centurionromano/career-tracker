<template>
  <div class="insights-dashboard">
    <h2 class="section-title">📊 Panel de Rendimiento y Actividad</h2>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon total-icon">🎯</div>
        <div class="kpi-data">
          <p class="kpi-label">Total Postulaciones</p>
          <h3 class="kpi-value">{{ totalPostulaciones }}</h3>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon error-icon">❌</div>
        <div class="kpi-data">
          <p class="kpi-label">Rechazos Analizados</p>
          <h3 class="kpi-value">{{ rechazosAnalizados }}</h3>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon success-icon">⚡</div>
        <div class="kpi-data">
          <p class="kpi-label">Tasa de Supervivencia</p>
          <h3 class="kpi-value">{{ tasaSupervivencia }}</h3>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      
      <div class="chart-card">
        <h3 class="chart-title">Distribución de Rechazos</h3>
        <div v-if="!hayRechazos" class="empty-state-pro">
          <div class="glow-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.4));">
              <path d="M3 3v18h18" stroke="#06b6d4" />
              <path d="M18 11l-4-4-4 4-4-4-2 2" stroke="#8b5cf6" />
            </svg>
          </div>
          <p class="empty-text">Aún no hay rechazos analizados.</p>
        </div>
        <div v-else class="chart-wrapper donut-wrapper">
          <Doughnut :data="datosDona" :options="opcionesDona" />
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Procesos con Más Actividad (Notas)</h3>
        <div v-if="!hayNotas" class="empty-state-pro">
          <p class="empty-text">Agrega notas a tus vacantes para ver tus procesos más activos.</p>
        </div>
        <div v-else class="chart-wrapper bar-wrapper">
          <Bar :data="datosBarras" :options="opcionesEjes" />
        </div>
      </div>
    </div>

    <div class="chart-card full-width">
      <h3 class="chart-title">Línea de Tiempo: Frecuencia de Entrevistas/Notas</h3>
      <div v-if="!hayNotas" class="empty-state-pro">
        <p class="empty-text">Registra tu primera nota para iniciar el rastreo temporal.</p>
      </div>
      <div v-else class="chart-wrapper line-wrapper">
        <Line :data="datosLinea" :options="opcionesEjes" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Doughnut, Bar, Line } from 'vue-chartjs';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, PointElement, LineElement 
} from 'chart.js';

// Importamos Firebase para traer las notas en tiempo real
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// ATENCIÓN: Verifica que la ruta a tu archivo de configuración de Firebase sea correcta. 
// Usualmente es '@/firebase' o '../main' dependiendo de tu proyecto.
import { db } from '../firebase'; 

ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
);

const props = defineProps({
  vacantes: { type: Array, required: true, default: () => [] }
});

// --- NUEVO: CONEXIÓN A LA COLECCIÓN DE NOTAS ---
const todasLasNotas = ref([]);
let unsubscribeNotas = null;

onMounted(() => {
  const auth = getAuth();
  // Escuchamos cambios en la sesión para traer solo TUS notas
  auth.onAuthStateChanged((user) => {
    if (user) {
      const q = query(collection(db, 'notas'), where('userId', '==', user.uid));
      unsubscribeNotas = onSnapshot(q, (snapshot) => {
        const notasArr = [];
        snapshot.forEach(doc => {
          notasArr.push({ id: doc.id, ...doc.data() });
        });
        todasLasNotas.value = notasArr;
      });
    }
  });
});

onUnmounted(() => {
  if (unsubscribeNotas) unsubscribeNotas(); // Limpiamos la conexión al salir de la pantalla
});

// --- 1. LÓGICA DE KPIs ---
const totalPostulaciones = computed(() => props.vacantes.length);
const rechazosAnalizados = computed(() => props.vacantes.filter(v => v.estatus === 'Rechazada').length);
const tasaSupervivencia = computed(() => {
  if (totalPostulaciones.value === 0) return '0%';
  const activas = totalPostulaciones.value - rechazosAnalizados.value;
  return Math.round((activas / totalPostulaciones.value) * 100) + '%';
});

// --- 2. LÓGICA GRÁFICA A: DONA (Rechazos) ---
const conteoRechazos = computed(() => {
  const conteo = {};
  props.vacantes.forEach(vacante => {
    if (vacante.estatus === 'Rechazada') {
      const motivo = vacante.motivoRechazo || 'Motivo no especificado';
      conteo[motivo] = (conteo[motivo] || 0) + 1;
    }
  });
  return conteo;
});
const hayRechazos = computed(() => Object.keys(conteoRechazos.value).length > 0);
const datosDona = computed(() => ({
  labels: Object.keys(conteoRechazos.value),
  datasets: [{
    data: Object.values(conteoRechazos.value),
    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1'],
    borderColor: '#09090b', borderWidth: 2, hoverOffset: 8
  }]
}));

// --- 3. LÓGICA GRÁFICA B: BARRAS (Top Procesos cruzando Vacantes + Notas) ---
const topProcesosData = computed(() => {
  return props.vacantes
    .map(v => {
      // Contamos cuántas notas le pertenecen a esta vacante específica
      const notasDeEstaVacante = todasLasNotas.value.filter(n => n.vacanteId === v.id);
      return {
        nombre: v.empresa || v.nombreVacante || 'Desconocida',
        cantidadNotas: notasDeEstaVacante.length
      };
    })
    .filter(v => v.cantidadNotas > 0)
    .sort((a, b) => b.cantidadNotas - a.cantidadNotas)
    .slice(0, 5);
});
const hayNotas = computed(() => topProcesosData.value.length > 0);
const datosBarras = computed(() => ({
  labels: topProcesosData.value.map(v => v.nombre),
  datasets: [{
    label: 'Interacciones (Notas)',
    data: topProcesosData.value.map(v => v.cantidadNotas),
    backgroundColor: 'rgba(56, 189, 248, 0.7)', 
    borderColor: '#38bdf8', borderWidth: 1, borderRadius: 6
  }]
}));

// --- 4. LÓGICA GRÁFICA C: LÍNEAS (Actividad en el Tiempo leyendo la colección Notas) ---
const datosLinea = computed(() => {
  const conteoPorDia = {};
  
  todasLasNotas.value.forEach(nota => {
    let fechaObj = new Date(); 
    if (nota.fecha && typeof nota.fecha.toDate === 'function') fechaObj = nota.fecha.toDate();
    else if (nota.fecha) fechaObj = new Date(nota.fecha);
    else if (nota.timestamp && typeof nota.timestamp.toDate === 'function') fechaObj = nota.timestamp.toDate();
    
    if (!isNaN(fechaObj)) {
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const fechaKey = `${dia}/${mes}`;
      conteoPorDia[fechaKey] = (conteoPorDia[fechaKey] || 0) + 1;
    }
  });

  const fechasOrdenadas = Object.keys(conteoPorDia).sort((a, b) => {
    const [diaA, mesA] = a.split('/');
    const [diaB, mesB] = b.split('/');
    return new Date(2026, mesA - 1, diaA) - new Date(2026, mesB - 1, diaB);
  });

  return {
    labels: fechasOrdenadas,
    datasets: [{
      label: 'Registro de Actividad',
      data: fechasOrdenadas.map(f => conteoPorDia[f]),
      borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#10b981', pointRadius: 5
    }]
  };
});

const opcionesDona = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e4e4e7' } } } };
const opcionesEjes = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#a1a1aa', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#a1a1aa' }, grid: { display: false } } } };
</script>

<style scoped>
.insights-dashboard { display: flex; flex-direction: column; gap: 25px; margin-top: 20px; }
.section-title { color: #fff; font-weight: 600; margin: 0; }
.chart-title { font-size: 1.1rem; margin-bottom: 20px; text-align: center; color: #e4e4e7; font-weight: 500;}

/* Tarjetas y Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }

.kpi-card, .chart-card {
  background: rgba(20, 20, 22, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  padding: 20px;
}

.kpi-card { display: flex; align-items: center; gap: 15px; }
.kpi-icon { font-size: 1.8rem; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255, 255, 255, 0.03); }
.total-icon { border: 1px solid rgba(56, 189, 248, 0.3); }
.error-icon { border: 1px solid rgba(239, 68, 68, 0.3); }
.success-icon { border: 1px solid rgba(16, 185, 129, 0.3); }

.kpi-label { color: #a1a1aa; font-size: 0.85rem; margin: 0 0 5px 0; text-transform: uppercase; }
.kpi-value { color: #fff; font-size: 1.8rem; font-weight: 700; margin: 0; }

/* Contenedores de Gráficas */
.chart-wrapper { position: relative; width: 100%; display: flex; justify-content: center; align-items: center; }
.donut-wrapper { height: 280px; }
.bar-wrapper { height: 280px; }
.line-wrapper { height: 300px; }
.full-width { grid-column: 1 / -1; }

.empty-state-pro { text-align: center; padding: 40px 0; opacity: 0.7; }
.empty-text { color: #888; font-size: 0.9rem; }
.glow-icon { margin-bottom: 15px; }

@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>