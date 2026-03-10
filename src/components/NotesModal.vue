<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-glass notes-panel">
      
      <div class="modal-header">
        <h3 class="cyber-title">
          <svg class="icon-terminal" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <line x1="9" y1="14" x2="15" y2="14"></line>
            <line x1="9" y1="18" x2="15" y2="18"></line>
            <line x1="9" y1="10" x2="10" y2="10"></line>
          </svg>
          <span>Logs: {{ vacante?.company }}</span>
        </h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

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
        placeholder="> Ingresar entrada de bitácora..."
      ></div>

      <div class="editor-actions">
        <button class="btn-cyber-submit" @click="guardarEnBitacora">
          {{ editId ? 'ACTUALIZAR REGISTRO' : 'GUARDAR EN BITÁCORA' }}
        </button>
        <button v-if="editId" class="btn-cancel-edit" @click="cancelarEdicion">Cancelar</button>
      </div>

      <div class="divider-container">
        <div class="cyber-divider"></div>
        <span class="divider-text">TIMELINE DEL SISTEMA</span>
      </div>

      <div class="timeline">
        <div v-if="historial.length === 0" class="no-notes">> Sin registros previos detectados.</div>
        <div v-for="nota in historial" :key="nota.id" class="timeline-item">
          <div class="timeline-header">
            <span class="timestamp">{{ nota.fechaFormateada }}</span>
            <div class="item-actions">
              <button class="btn-mini-action edit-action" @click="prepararEdicion(nota)" title="Editar">✏️</button>
              <button class="btn-mini-action delete-action" @click="eliminarNota(nota.id)" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="nota-contenido" v-html="nota.texto"></div>
        </div>
      </div>
    </div>
  </div>

  <transition name="fade">
    <div v-if="showConfirmDelete" class="modal-overlay" style="z-index: 2000;" @click.self="cancelarEliminacion">
      <div class="confirm-panel">
        <h4 class="confirm-title">⚠️ Confirmar Eliminación</h4>
        <p class="confirm-text">¿Estás segura de que deseas borrar este log del sistema? Esta acción no se puede deshacer.</p>
        <div class="confirm-actions">
          <button class="btn-cancel-edit" @click="cancelarEliminacion">Cancelar</button>
          <button class="btn-danger-confirm" @click="confirmarEliminacion">Eliminar</button>
        </div>
      </div>
    </div>
  </transition>
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

const emit = defineEmits(['close']);

const editor = ref(null);
const historial = ref([]);
const editId = ref(null);

// Variables para el nuevo modal de confirmación
const showConfirmDelete = ref(false);
const noteToDelete = ref(null);

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
        userId: auth.currentUser.uid, 
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

// Lógica para abrir el modal en lugar del confirm nativo
const eliminarNota = (id) => {
  noteToDelete.value = id;
  showConfirmDelete.value = true;
};

// Lógica para ejecutar la eliminación desde el modal
const confirmarEliminacion = async () => {
  if (!noteToDelete.value) return;
  try {
    await deleteDoc(doc(db, "notas", noteToDelete.value));
    showConfirmDelete.value = false;
    noteToDelete.value = null;
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};

const cancelarEliminacion = () => {
  showConfirmDelete.value = false;
  noteToDelete.value = null;
};

onMounted(() => {
  if (!props.vacante?.id || !auth.currentUser) return;

  const q = query(
    collection(db, "notas"), 
    where("vacanteId", "==", props.vacante.id),
    where("userId", "==", auth.currentUser.uid), 
    orderBy("fecha", "desc")
  );

  onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    historial.value = snapshot.docs.map(doc => {
      const data = doc.data();
      let fechaVisual = 'Sincronizando...';
      
      if (data.fecha) {
        fechaVisual = data.fecha.toDate().toLocaleString();
      } else if (doc.metadata.hasPendingWrites) {
        fechaVisual = new Date().toLocaleString() + ' (Local)';
      }

      return { id: doc.id, ...data, fechaFormateada: fechaVisual };
    });
  });
});
</script>

<style scoped>
/* OVERLAY Y CONTENEDOR PRINCIPAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 15px; box-sizing: border-box; }

.notes-panel { 
  max-width: 550px !important; 
  width: 100%; 
  background: rgba(17, 17, 19, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(56, 189, 248, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* CABECERA */
/* CIRUGÍA: flex-shrink: 0 para proteger de compresión */
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.cyber-title { margin: 0; font-size: 1.2rem; color: #fff; display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: 0.5px; }

.icon-terminal {
  color: #38bdf8; 
  opacity: 0.9;
  filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.4)); 
}

.btn-close { background: transparent; border: none; color: #64748b; font-size: 1.8rem; cursor: pointer; transition: 0.3s; line-height: 1; padding: 0; }
.btn-close:hover { color: #f43f5e; text-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }

/* TOOLBAR GLASSMORPHISM */
/* CIRUGÍA: flex-shrink: 0 */
.rich-text-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; background: rgba(255, 255, 255, 0.03); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); flex-shrink: 0; }
.rich-text-toolbar button { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s ease; }
.rich-text-toolbar button:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.2); }

/* EDITOR TERMINAL */
/* CIRUGÍA: flex-shrink: 0 */
.notes-editor { 
  width: 100%; min-height: 120px; background: rgba(0,0,0,0.5); color: #e2e8f0; 
  border: 1px solid rgba(56, 189, 248, 0.2); 
  border-radius: 8px; padding: 15px; margin-bottom: 15px; outline: none; text-align: left; font-family: 'Courier New', Courier, monospace; font-size: 0.95rem; line-height: 1.5; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); transition: all 0.3s ease; box-sizing: border-box; 
  flex-shrink: 0;
}
.notes-editor:focus { 
  border-color: #38bdf8; 
  box-shadow: inset 0 0 15px rgba(0,0,0,0.8), 0 0 12px rgba(56, 189, 248, 0.2); 
}
.notes-editor:empty:before { content: attr(placeholder); color: #475569; font-style: italic; }

/* BOTONES DE ACCIÓN */
/* CIRUGÍA: flex-shrink: 0 */
.editor-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; flex-shrink: 0; }
.btn-cyber-submit { 
  background: rgba(56, 189, 248, 0.05); 
  color: #38bdf8; 
  border: 1px solid rgba(56, 189, 248, 0.3); 
  padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; letter-spacing: 1.5px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 10px rgba(56, 189, 248, 0.05); 
}

.btn-cyber-submit:hover { 
  background: rgba(56, 189, 248, 0.15); 
  border-color: #38bdf8; 
  color: #fff; 
  transform: translateY(-2px); 
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), 0 0 15px rgba(56, 189, 248, 0.3); 
}

.btn-cancel-edit { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: 0.2s; }
.btn-cancel-edit:hover { color: #fff; border-color: #fff; background: rgba(255,255,255,0.05); }

/* SEPARADOR CIBERNÉTICO */
/* CIRUGÍA: flex-shrink: 0 */
.divider-container { position: relative; margin: 25px 0 15px 0; text-align: center; flex-shrink: 0; }
.cyber-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent); width: 100%; position: absolute; top: 50%; z-index: 1; }
.divider-text { background: #111113; padding: 0 15px; color: #64748b; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; position: relative; z-index: 2; }

/* TIMELINE (HILO DE CONEXIÓN) */
/* CIRUGÍA: min-height: 0; añadido para forzar el scroll interno */
.timeline { overflow-y: auto; padding-right: 10px; flex: 1; min-height: 0; }
.timeline::-webkit-scrollbar { width: 4px; }
.timeline::-webkit-scrollbar-track { background: transparent; }
.timeline::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 10px; }

.no-notes { color: #475569; font-family: 'Courier New', monospace; font-size: 0.9rem; margin-top: 10px; }

.timeline-item { position: relative; padding-left: 24px; margin-bottom: 25px; }
.timeline-item::before { content: ''; position: absolute; left: 5px; top: 22px; bottom: -25px; width: 1px; background: linear-gradient(to bottom, rgba(56, 189, 248, 0.4), rgba(255, 255, 255, 0.05)); z-index: 1; }
.timeline-item:last-child::before { display: none; }
.timeline-item::after { content: ''; position: absolute; left: 0; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: #111113; border: 1.5px solid #38bdf8; box-shadow: 0 0 5px rgba(56, 189, 248, 0.4); z-index: 2; transition: all 0.3s ease; }
.timeline-item:hover::after { background: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6); transform: scale(1.2); }

.timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.timestamp { font-size: 0.75rem; color: #64748b; font-family: 'Courier New', monospace; }

.item-actions { display: flex; gap: 10px; opacity: 0; transition: 0.3s; }
.timeline-item:hover .item-actions { opacity: 1; }
.btn-mini-action { background: transparent; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px; transition: 0.2s; filter: grayscale(100%); opacity: 0.7;}
.btn-mini-action:hover { transform: scale(1.1); filter: grayscale(0%); opacity: 1;}

.nota-contenido { font-size: 0.9rem; color: #e2e8f0; line-height: 1.5; background: rgba(255,255,255,0.02); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

/* MICRO-MODAL DE CONFIRMACIÓN */
.confirm-panel {
  background: rgba(17, 17, 19, 0.98);
  border: 1px solid rgba(239, 68, 68, 0.4); 
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(239, 68, 68, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-title { color: #ef4444; margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.5px; }
.confirm-text { color: #94a3b8; font-size: 0.85rem; margin-bottom: 24px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 12px; justify-content: center; }

.btn-danger-confirm {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger-confirm:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* TRANSICIÓN VUE (FADE) */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* RESPONSIVE */
@media (max-width: 600px) {
  .notes-panel { padding: 15px; border-radius: 12px; max-height: 95vh; }
  .item-actions { opacity: 1 !important; gap: 12px; }
  .btn-mini-action { font-size: 1.1rem; filter: grayscale(0%); opacity: 1;}
  .timeline-item::before { left: 4px; }
  .timeline-item::after { width: 8px; height: 8px; left: 0px; top: 8px; }
}
</style>