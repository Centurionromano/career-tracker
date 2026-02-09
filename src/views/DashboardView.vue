<template>
  <div v-if="usuario">
    <h2>Bienvenido, {{ usuario.displayName }}</h2>
    <div v-for="item in misDatos" :key="item.id">
      {{ item.nombreVacante }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const usuario = ref(null);
const misDatos = ref([]);

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      usuario.ref = user;
      // CONSULTA SEGURA: Solo trae datos donde el 'userId' sea igual al del logueado
      const q = query(
        collection(db, "vacantes"), 
        where("userId", "==", user.uid)
      );
      
      onSnapshot(q, (snapshot) => {
        misDatos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    }
  });
});
</script>