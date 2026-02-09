// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Analytics es opcional, lo dejamos por si quieres métricas después
import { getAnalytics } from "firebase/analytics";

// Tu configuración real de CareerTracker
const firebaseConfig = {
  apiKey: "AIzaSyA_X1Us1YDN6aI6ndwRx3OyT1oKSAP61jw",
  authDomain: "career-tracker-8bce4.firebaseapp.com",
  projectId: "career-tracker-8bce4",
  storageBucket: "career-tracker-8bce4.firebasestorage.app",
  messagingSenderId: "845362359789",
  appId: "1:845362359789:web:7942b49be88a66bfa50be4",
  measurementId: "G-1ZCZNL87ZE"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// --- EXPORTACIONES PARA EL PROYECTO ---
// Estas son las que usan LoginView.vue y DashboardView.vue
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();