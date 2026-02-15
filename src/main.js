import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

/* --------------------------------------------------------------
   CREDITOS DEL EQUIPO (Visible en F12 - Developer Console)
   -------------------------------------------------------------- 
*/
console.log(
  "%c CareerTracker v1.0 ", 
  "background: #0f172a; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px; border-radius: 4px;"
);

console.groupCollapsed("Dev Team / Créditos");
console.log("🚀 Ricardo Coronado - Developer");
console.log("🎨 Tanya Medina Cárdenas - UI/UX");
console.log("📅 Feb 2026");
console.groupEnd();