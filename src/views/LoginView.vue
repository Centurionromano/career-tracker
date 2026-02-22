<template>
  <div class="login-container">
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="login-glass">
      <div class="brand login-brand">
        <img :src="logoImg" alt="Logo CareerTracker" class="app-logo-lg" />
        <span class="brand-text lg">CAREER<span>TRACKER</span></span>
      </div>
      
      <div class="text-content">
        <h2 class="login-title">Tu carrera, bajo control.</h2>
        <p class="login-desc">Centraliza tus postulaciones y optimiza tu búsqueda de empleo con inteligencia.</p>
      </div>
      
      <button @click="entrarConGoogle" class="btn-google-pro">
        <div class="btn-content-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="google-icon"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
          <span>Continuar con Google</span>
        </div>
      </button>

      <div class="legal-footer">
        <p>© 2026 CareerTracker Inc.</p>
        <div class="legal-links">
          <a href="#" class="legal-link" @click.prevent="showTerms = true">Términos</a>
          <span class="dot">•</span>
          <a href="#" class="legal-link" @click.prevent="showPrivacy = true">Privacidad</a>
        </div>
      </div>
    </div>

    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-legal">
        <h3>Términos de Servicio</h3>
        <p class="legal-text">Bienvenido a CareerTracker. Gestiona tu información responsablemente.</p>
        <button class="btn-close" @click="showTerms = false">Cerrar</button>
      </div>
    </div>
    
    <div v-if="showPrivacy" class="modal-overlay" @click.self="showPrivacy = false">
      <div class="modal-legal">
        <h3>Aviso de Privacidad</h3>
        <p class="legal-text">Tus datos son tuyos. No compartimos información con terceros.</p>
        <button class="btn-close" @click="showPrivacy = false">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* --- LÓGICA INTACTA (0 Cambios) --- */
import { onMounted, ref } from 'vue'; 
import { auth, googleProvider } from '../firebase'; 
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';

const router = useRouter();
const showTerms = ref(false);
const showPrivacy = ref(false);

const entrarConGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    router.push('/dashboard');
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') alert("Error de conexión.");
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => { if (user) router.push('/dashboard'); });
});
</script>

<style scoped>
/* --- ESTILOS --- */
.login-container {
  min-height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center;
  background: #09090b; position: relative; overflow-x: hidden;
}
.background-blobs { position: absolute; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
.blob-1 { width: 400px; height: 400px; background: #4f46e5; top: -100px; left: -100px; animation: pulseBlob 8s infinite alternate; }
.blob-2 { width: 300px; height: 300px; background: #0ea5e9; bottom: -50px; right: -50px; animation: pulseBlob 10s infinite alternate-reverse; }

@keyframes pulseBlob { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.2); opacity: 0.5; } }

.login-glass {
  z-index: 10; background: rgba(20, 20, 23, 0.7); backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08); padding: 40px 30px;
  width: 100%; max-width: 400px; border-radius: 24px; text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); margin: 20px;
}

.login-brand { display: flex; flex-direction: column; align-items: center; }

/* --- AQUÍ ESTÁN LOS CAMBIOS QUIRÚRGICOS 💉 --- */
.app-logo-lg {
  height: 60px;
  /* FIX 1: Centrado robusto */
  display: block;
  margin: 0 auto 10px auto; /* Arriba 0, Derecha Auto, Abajo 10px, Izquierda Auto */

  /* FIX 2: Shadow outstanding */
  filter: drop-shadow(0 0 15px rgba(196, 214, 255, 0.9)) drop-shadow(0 0 40px rgba(79, 70, 229, 0.7));

  animation: float 3s ease-in-out infinite;
}
/* ------------------------------------------- */

@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }

.brand-text { font-size: 1.25rem; font-weight: 700; color: white; letter-spacing: 3px; }
.brand-text span { background: linear-gradient(135deg, #C4D6FF 0%, #4D7CFF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.login-title { font-size: 1.5rem; color: white; margin-bottom: 5px; }
.login-desc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 30px; }

.btn-google-pro {
  width: 100%; background: white; border: none; padding: 12px; border-radius: 12px;
  font-weight: 600; cursor: pointer; transition: transform 0.2s;
}
.btn-google-pro:hover { transform: translateY(-2px); }
.btn-content-wrapper { display: flex; align-items: center; justify-content: center; gap: 10px; }
.legal-footer { margin-top: 20px; font-size: 0.7rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
.legal-links a { color: #94a3b8; text-decoration: none; cursor: pointer; margin: 0 5px; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 20px; box-sizing: border-box; }
.modal-legal { background: #18181b; padding: 30px; border-radius: 16px; width: 100%; max-width: 400px; color: #a1a1aa; border: 1px solid rgba(255,255,255,0.1); }
.modal-legal h3 { color: white; margin-top: 0; }
.btn-close { margin-top: 20px; width: 100%; padding: 10px; background: #27272a; color: white; border: none; border-radius: 8px; cursor: pointer; }
</style>