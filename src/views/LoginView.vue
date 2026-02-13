<template>
  <div class="login-container">
    <div class="login-glass">
      <div class="brand login-brand">
        <img :src="logoImg" alt="Logo" class="app-logo-lg" />
        <span class="brand-text lg">CAREER<span>TRACKER</span></span>
      </div>
      
      <h2 class="login-title">Tu carrera despega hoy</h2>
      
      <p class="login-desc">
        Gestiona tus postulaciones y alcanza tu próximo empleo con inteligencia.
      </p>
      
      <button @click="entrarConGoogle" class="btn-gradient btn-login-google">
        <span class="btn-content login-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right:10px;">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          Entrar con Google
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { auth, googleProvider } from '../firebase'; // Ajusta la importación según tu config de firebase
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router';
import logoImg from '@/assets/careertracker-logo-no-bkg.png';

const router = useRouter();

const entrarConGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    // Redirige al dashboard tras el login exitoso
    router.push('/dashboard');
  } catch (error) {
    console.error("Error al autenticar:", error);
    alert("Hubo un error al intentar iniciar sesión");
  }
};
</script>

<style scoped>
/* Estilos extraídos y limpiados para el Login */
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f11; /* Fondo oscuro base */
  padding: 20px;
}

.login-glass {
  background: rgba(18, 18, 18, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 50px 30px;
  border-radius: 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.app-logo-lg {
  height: 60px;
  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.5));
  margin-bottom: 10px;
  /* CAMBIO QUIRÚRGICO: Animación de flotado agregada aquí */
  animation: float 3s ease-in-out infinite;
}

.brand-text {
  font-weight: 800;
  letter-spacing: 2px;
  color: white;
}

.brand-text span {
  color: #22d3ee; /* Accent Cyan */
}

.brand-text.lg {
  font-size: 1.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: white;
}

.login-desc {
  color: #9ca3af;
  margin-bottom: 40px;
  line-height: 1.6;
}

.btn-gradient {
  background: linear-gradient(90deg, #8b5cf6, #22d3ee);
  padding: 2px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
}

.btn-content {
  background: #0f0f11;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-gradient:hover {
  transform: scale(1.02);
}

.btn-gradient:hover .btn-content {
  background: transparent;
}

/* CAMBIO QUIRÚRGICO: Definición de la animación float */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px); /* Sube 10 pixeles */
  }
  100% {
    transform: translateY(0px);
  }
}
</style>