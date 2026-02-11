<template>
  <div class="dashboard-container">
    <nav class="glass-nav">
      <div class="nav-wrapper">
        <div class="brand">
          <img :src="logoImg" alt="Logo" class="app-logo" />
          <span class="brand-text">CAREER<span>TRACKER</span></span>
        </div>
        
        <div class="user-pill" v-if="usuario">
          <div class="avatar-container">
            <img v-if="usuario.photoURL" :src="usuario.photoURL" class="user-img" />
            <div v-else class="user-initial">{{ usuario.email.charAt(0).toUpperCase() }}</div>
          </div>
          <span class="user-display-name">{{ nombreCorto }}</span>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <header class="hero-section">
        <div class="hero-text">
          <h1 class="glitch-title">Hola, {{ nombreCorto }}</h1>
          <p class="hero-subtitle">Tu próximo salto profesional empieza aquí.</p>
        </div>
        <button class="btn-gradient">
          <span class="btn-content">+ Nueva Vacante</span>
        </button>
      </header>

      <section v-if="misDatos.length > 0" class="cards-grid">
        <VacancyCard 
          v-for="item in misDatos" 
          :key="item.id" 
          :title="item.nombreVacante" 
          :company="item.empresa" 
          :status="item.estatus" 
        />
      </section>

      <div v-else class="empty-state-pro">
        <div class="glow-icon">✦</div>
        <h2>Sin vacantes activas</h2>
        <p>Registra tu primera postulación para comenzar el seguimiento.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import VacancyCard from '../components/VacancyCard.vue';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';

const usuario = ref(null);
const misDatos = ref([]);

const nombreCorto = computed(() => {
  if (usuario.value) {
    if (usuario.value.displayName) return usuario.value.displayName.split(' ')[0];
    return usuario.value.email.split('@')[0];
  }
  return 'Guest';
});

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      usuario.value = user;
      const q = query(collection(db, "vacantes"), where("userId", "==", user.uid));
      onSnapshot(q, (snapshot) => {
        misDatos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    }
  });
});
</script>

<style scoped>
.dashboard-container { padding-bottom: 50px; }

/* NAVBAR GLASS */
.glass-nav {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 12px 0;
}

.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.brand { display: flex; align-items: center; gap: 12px; }
.app-logo { height: 35px; filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3)); }
.brand-text { font-weight: 800; font-size: 1.1rem; letter-spacing: 2px; }
.brand-text span { color: var(--accent-cyan); }

/* USER PILL */
.user-pill {
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px 4px 4px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--glass-border);
}

.user-img, .user-initial { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-initial { background: var(--accent-purple); display: flex; align-items: center; justify-content: center; font-weight: bold; }
.user-display-name { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

/* HERO SECTION */
.main-content { max-width: 1200px; margin: 0 auto; padding: 60px 24px; }

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 60px;
  gap: 20px; /* Asegura que el botón y texto no choquen antes del quiebre */
}

.welcome-text { margin: 0; }
.glitch-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; margin: 0; line-height: 1; }
.hero-subtitle { color: var(--text-secondary); font-size: 1.2rem; margin-top: 10px; }

/* BUTTON GRADIENT */
.btn-gradient {
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
  padding: 2px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0; /* Evita que el botón se deforme */
}

.btn-content {
  background: var(--bg-dark);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  display: block;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-gradient:hover { transform: scale(1.05); }
.btn-gradient:hover .btn-content { background: transparent; }

/* GRID */
.cards-grid {
  display: grid;
  /* Cambio quirúrgico: repeat(auto-fill, minmax(min(100%, 320px), 1fr)) 
     permite que las tarjetas ocupen todo el ancho si la pantalla es menor a 320px */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 25px;
}

/* EMPTY STATE */
.empty-state-pro {
  text-align: center;
  padding: 100px 20px;
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
}

.glow-icon { font-size: 3rem; color: var(--accent-cyan); text-shadow: 0 0 20px var(--accent-cyan); margin-bottom: 20px; }

/* MEDIA QUERIES (Solo ajustes de posicionamiento) */
@media (max-width: 768px) {
  .hero-section { flex-direction: column; align-items: flex-start; gap: 30px; }
  .glitch-title { font-size: 2.5rem; }
  .main-content { padding: 40px 20px; }
}

@media (max-width: 480px) {
  .brand-text { display: none; } /* Oculta texto de marca en móviles mini para evitar encimamiento */
  .user-display-name { display: none; } /* Muestra solo el avatar */
  .user-pill { padding: 4px; }
  .btn-gradient { width: 100%; } /* Botón full-width para mejor UX en móvil */
  .btn-content { text-align: center; }
}
</style>