<template>
  <div class="login-page">
    <h2>Bienvenido a CareerTracker</h2>
    <p>Inicia sesión para gestionar tus vacantes</p>
    <button @click="entrarConGoogle" class="btn-google">
      Entrar con Google
    </button>
  </div>
</template>

<script setup>
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const entrarConGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    // Una vez autenticado, lo mandamos al dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error("Error al autenticar:", error);
    alert("Hubo un error al intentar iniciar sesión");
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}
.btn-google {
  padding: 10px 20px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>