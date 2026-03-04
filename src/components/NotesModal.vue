<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-glass notes-panel">
      <h3>📝 Notas: {{ vacante?.company }}</h3>
      
      <div class="rich-text-toolbar">
        <button type="button" @click="ejecutarComando('bold')" title="Negrita"><b>B</b></button>
        <button type="button" @click="ejecutarComando('italic')" title="Cursiva"><i>I</i></button>
        <button type="button" @click="ejecutarComando('insertUnorderedList')" title="Lista">• Lista</button>
        <button type="button" @click="ejecutarComando('insertOrderedList')" title="Lista Numerada">1. Nros</button>
        <button type="button" @click="ejecutarComando('formatBlock', 'pre')" title="Código">&lt;/&gt;</button>
      </div>

      <div 
        ref="editor"
        contenteditable="true"
        class="notes-editor"
        placeholder="Ej: Entrevista técnica con el líder de Frontend..."
      ></div>

      <div class="editor-actions">
        <button class="btn-gradient" @click="guardarEnBitacora">
          <span class="btn-content">{{ editId ? 'Actualizar Nota' : 'Guardar en Bitácora' }}</span>
        </button>
        <button v-if="editId" class="btn-cancel-edit" @click="cancelarEdicion">Cancelar</button>
      </div>

      <hr class="divider" />

      <h4>🕒 BITÁCORA DE SISTEMA (TIMELINE)</h4>
      <div class="timeline">
        <div v-if="historial.length === 0" class="no-notes">Sin registros previos...</div>
        <div v-for="nota in historial" :key="nota.id" class="timeline-item">
          <div class="timeline-header">
            <span class="timestamp">{{ nota.fechaFormateada }}</span>
            <div class="item-actions">
              <button class="btn-mini-action" @click="prepararEdicion(nota)" title="Editar">✏️</button>
              <button class="btn-mini-action btn-delete" @click="eliminarNota(nota.id)" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="nota-contenido" v-html="nota.texto"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, auth } from '../firebase'; 
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';

const props = defineProps({
  vacante: { type: Object, required: true }
});

const editor = ref(null);
const historial = ref([]);
const editId = ref(null);

const ejecutarComando = (comando, valor = null) => {
  if (editor.value) editor.value.focus();
  if (comando === 'formatBlock' && valor === 'pre') {
    const formatoActual = document.queryCommandValue('formatBlock') || '';
    formatoActual.includes('pre') ? document.execCommand('formatBlock', false, 'p') : document.execCommand('formatBlock', false, 'pre');
  } else {
    document.execCommand(comando, false, valor);
  }
};

const guardarEnBitacora = async () => {
  const contenido = editor.value.innerHTML;
  if(!contenido || contenido === '<br>') return;

  if (!auth.currentUser) return;

  try {
    const textoTemp = contenido;
    editor.value.innerHTML = ''; 

    if (editId.value) {
      await updateDoc(doc(db, "notas", editId.value), {
        texto: textoTemp
      });
      editId.value = null;
    } else {
      await addDoc(collection(db, "notas"), {
        vacanteId: props.vacante.id,
        userId: auth.currentUser.uid, // Aseguramos que se guarde el dueño
        texto: textoTemp,
        fecha: serverTimestamp() 
      });
    }
  } catch (error) {
    console.error("Error al procesar la nota:", error);
  }
};

const prepararEdicion = (nota) => {
  editor.value.innerHTML = nota.texto;
  editId.value = nota.id;
  editor.value.focus();
};

const cancelarEdicion = () => {
  editId.value = null;
  editor.value.innerHTML = '';
};

const eliminarNota = async (id) => {
  if (confirm("¿Seguro que quieres borrar esta nota?")) {
    try {
      await deleteDoc(doc(db, "notas", id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

onMounted(() => {
  if (!props.vacante?.id || !auth.currentUser) return;

  // IMPORTANTE: La consulta debe incluir el userId para que las reglas no la bloqueen
  const q = query(
    collection(db, "notas"), 
    where("vacanteId", "==", props.vacante.id),
    where("userId", "==", auth.currentUser.uid), // Filtro de seguridad obligatorio
    orderBy("fecha", "desc")
  );

  // includeMetadataChanges permite que la UI se actualice con datos locales
  onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    historial.value = snapshot.docs.map(doc => {
      const data = doc.data();
      let fechaVisual = 'Sincronizando...';
      
      if (data.fecha) {
        fechaVisual = data.fecha.toDate().toLocaleString();
      } else if (doc.metadata.hasPendingWrites) {
        // Si la nota es nueva y aún no tiene fecha del servidor, usamos la hora local
        fechaVisual = new Date().toLocaleString() + ' (Local)';
      }

      return { id: doc.id, ...data, fechaFormateada: fechaVisual };
    });
  });
});
</script>

<style scoped>
.notes-panel { max-width: 500px !important; width: 95%; }
.rich-text-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; background: #1c1c1f; padding: 8px; border-radius: 8px; }
.rich-text-toolbar button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.rich-text-toolbar button:hover { background: #6366f1; }

.notes-editor { width: 100%; min-height: 120px; background: #09090b; color: white; border: 1px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 15px; outline: none; text-align: left; }
.notes-editor:empty:before { content: attr(placeholder); color: #555; }

.editor-actions { display: flex; gap: 10px; align-items: center; }
.btn-cancel-edit { background: transparent; border: 1px solid #444; color: #888; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-size: 0.85rem; }
.btn-cancel-edit:hover { color: white; border-color: white; }

.timeline { margin-top: 15px; max-height: 250px; overflow-y: auto; text-align: left; padding-right: 5px; }
.timeline-item { border-left: 2px solid #6366f1; padding-left: 15px; margin-bottom: 20px; position: relative; }

.timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.timestamp { font-size: 0.75rem; color: #888; font-weight: bold; }

.item-actions { display: flex; gap: 8px; opacity: 0.6; transition: 0.3s; }
.timeline-item:hover .item-actions { opacity: 1; }
.btn-mini-action { background: transparent; border: none; cursor: pointer; font-size: 0.85rem; padding: 2px; }
.btn-mini-action:hover { transform: scale(1.2); }
.btn-delete:hover { filter: drop-shadow(0 0 5px #ef4444); }

.nota-contenido { font-size: 0.9rem; color: #ddd; line-height: 1.4; }
.no-notes { color: #555; font-style: italic; text-align: center; }
.divider { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0; }
.timeline::-webkit-scrollbar { width: 4px; }
.timeline::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

@media (max-width: 600px) {
  .item-actions { opacity: 1 !important; gap: 15px; }
  .btn-mini-action { padding: 8px; font-size: 1.1rem; }
  .notes-panel { padding: 15px; }
}
</style>