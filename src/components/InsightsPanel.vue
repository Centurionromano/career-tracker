<template>
  <div class="empty-state-pro" style="margin-top: 40px;">
    
    <div class="glow-icon" style="margin-bottom: 25px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.4));">
        <defs>
          <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" /> <stop offset="100%" stop-color="#8b5cf6" /> </linearGradient>
        </defs>
        
        <path d="M3 3v18h18" stroke="url(#cyber-gradient)" />
        <path d="M18 11l-4-4-4 4-4-4-2 2" stroke="url(#cyber-gradient)" />
        <rect x="7" y="14" width="2" height="4" rx="0.5" fill="url(#cyber-gradient)" stroke="none" />
        <rect x="11" y="10" width="2" height="8" rx="0.5" fill="url(#cyber-gradient)" stroke="none" />
        <rect x="15" y="6" width="2" height="12" rx="0.5" fill="url(#cyber-gradient)" stroke="none" />

        <path d="M18 11l-4-4-4 4-4-4-2 2" stroke="white" stroke-opacity="0.5" />
        <path d="M21 3l-1.5 2-1.5-2Z" fill="#38bdf8" stroke="none" filter="drop-shadow(0 0 10px #38bdf8)" /> </svg>
    </div>

    <h2 class="welcome-title">Métricas en Construcción</h2>
    <p class="welcome-subtitle">Motor analítico del Sprint 7 próximo a conectarse...</p>
  </div>
</template>

<script setup>
// Ricardo: Aquí recibes el array "vacantes" desde el Dashboard. 
// Usa "props.vacantes" para hacer toda tu lógica de conteo, tiempos y tags.
const props = defineProps({
  vacantes: { type: Array, required: true }
});
</script>

<style scoped>
/* Los estilos del empty-state-pro ya se heredan de tu CSS global/Dashboard */
</style>