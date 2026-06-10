<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="form-card-title">
            <h3>{{ editando ? 'Editar persona' : 'Crear persona' }}</h3>
            <span>{{ editando ? 'Modifica los datos de la persona' : 'Registra una persona asociada a una familia' }}</span>
          </div>
        </div>

        <form @submit.prevent="editando ? guardarEdicion() : createPerson()">
          <div class="form-grid">
            <div class="form-field">
              <label>Familia</label>
              <select v-model="form.id_familia" class="select">
                <option :value="null">Seleccionar familia</option>
                <option v-for="f in familias" :key="f.id_familia" :value="f.id_familia">{{ f.codigo_familia || 'Familia #' + f.id_familia }}</option>
              </select>
              <span class="helper">Familia a la que pertenece la persona.</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.nombre }">
              <label class="req">Nombre</label>
              <input v-model="form.nombre" class="input" placeholder="Nombre completo" />
              <span v-if="fieldErrors.nombre" class="error-text">{{ fieldErrors.nombre }}</span>
            </div>
            <div class="form-field full">
              <label>Edad</label>
              <input v-model.number="form.edad" class="input" type="number" min="0" max="120" placeholder="Ej. 35" />
            </div>
          </div>

          <div class="form-field full">
            <label>Características</label>
            <div class="checkbox-group">
              <label class="check"><input v-model="form.es_nino" type="checkbox" /> Es niño</label>
              <label class="check"><input v-model="form.es_anciano" type="checkbox" /> Es anciano</label>
              <label class="check"><input v-model="form.es_embarazada" type="checkbox" /> Es embarazada</label>
              <label class="check"><input v-model="form.tiene_discapacidad" type="checkbox" /> Tiene discapacidad</label>
              <label class="check"><input v-model="form.tiene_enfermedad_cronica" type="checkbox" /> Tiene enfermedad crónica</label>
              <label class="check"><input v-model="form.es_cabeza_familia" type="checkbox" /> Es cabeza de familia</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
              </span>
              {{ isLoading ? (editando ? 'Guardando...' : 'Creando...') : (editando ? 'Guardar cambios' : 'Crear persona') }}
            </button>
            <button v-if="editando" type="button" class="btn btn-secondary" @click="cancelarEdicion" :disabled="isLoading">Cancelar</button>
            <button v-else type="button" class="btn btn-secondary" @click="reset" :disabled="isLoading">Limpiar</button>
          </div>
        </form>
      </article>
    </div>

    <!-- Modal confirmación eliminar -->
    <div v-if="personaAEliminar" class="modal-overlay" @click.self="personaAEliminar = null">
      <div class="modal-card">
        <div class="modal-icon modal-icon--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <h4>¿Eliminar persona?</h4>
        <p>Se eliminará a <strong>{{ personaAEliminar.nombre }}</strong> de forma permanente. Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn btn-danger" :disabled="isLoading" @click="confirmarEliminar">
            <span v-if="isLoading" class="spinner dark"></span>
            <span v-else>Sí, eliminar</span>
          </button>
          <button class="btn btn-secondary" @click="personaAEliminar = null" :disabled="isLoading">Cancelar</button>
        </div>
      </div>
    </div>

    <section v-if="showPanel || isListLoading" class="result-panel">
      <LoadingState v-if="isListLoading" variant="skeleton" :count="4" label="Cargando personas..." />

      <template v-else>
        <div class="result-head">
          <div class="result-head-info">
            <span class="label">Listado de personas</span>
            <span v-if="resultKind === 'success' && Array.isArray(personas)" class="count">
              <strong>{{ personas.length }}</strong> {{ personas.length === 1 ? 'persona' : 'personas' }}
            </span>
          </div>
          <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
        </div>

        <div v-if="resultKind === 'success'">
          <ul v-if="Array.isArray(personas) && personas.length" class="item-list">
            <li v-for="persona in personas" :key="persona.id_persona" class="item-card">
              <div class="item-avatar variant-violet">
                {{ getInitials(persona.nombre) }}
              </div>
              <div class="item-content">
                <h4>{{ persona.nombre }}</h4>
                <p>
                  <span v-if="persona.edad !== undefined && persona.edad !== null">{{ persona.edad }} años</span>
                  <span v-else>Edad no registrada</span>
                  <span v-if="persona.id_familia"> &middot; Familia #{{ persona.id_familia }}</span>
                </p>
                <div class="item-meta">
                  <span v-if="persona.es_cabeza_familia" class="badge badge-primary">Cabeza de familia</span>
                  <span v-if="persona.es_nino" class="badge badge-info">Niño</span>
                  <span v-if="persona.es_anciano" class="badge badge-cyan">Anciano</span>
                  <span v-if="persona.es_embarazada" class="badge badge-pink">Embarazada</span>
                  <span v-if="persona.tiene_discapacidad" class="badge badge-warning">Discapacidad</span>
                  <span v-if="persona.tiene_enfermedad_cronica" class="badge badge-danger">Enfermedad crónica</span>
                  <span v-if="!hasAnyFlag(persona)" class="badge badge-default">Sin características</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="badge badge-default">ID {{ persona.id_persona }}</span>
                <div class="item-action-btns">
                  <button class="btn-icon-action btn-icon-action--edit" title="Editar" @click="iniciarEdicion(persona)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon-action btn-icon-action--delete" title="Eliminar" @click="solicitarEliminar(persona)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <EmptyState
            v-else-if="Array.isArray(personas) && personas.length === 0"
            title="Sin personas registradas"
            message="Aún no se han creado personas en la plataforma."
          />

          <div v-else class="detail-card">
            <div class="detail-row">
              <span class="k">Detalle</span>
              <span class="v">Persona creada correctamente.</span>
            </div>
          </div>
        </div>

        <ErrorState
          v-else
          title="No se pudo completar la operación."
          :message="errorMessage"
        />
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { familiaService, personaService } from '../../services/familia'
import type { Persona, Familia } from '../../types'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'

export default defineComponent({
  name: 'DashboardPersonas',
  components: { LoadingState, EmptyState, ErrorState },
  setup() {
    const familias = ref<Familia[]>([])
    const personas = ref<Persona[]>([])
    const editando = ref(false)
    const personaEditandoId = ref<number | null>(null)
    const personaAEliminar = ref<Persona | null>(null)

    const form = reactive({
      id_familia: null as number | null,
      nombre: '',
      edad: null as number | null,
      es_nino: false,
      es_anciano: false,
      es_embarazada: false,
      tiene_discapacidad: false,
      tiene_enfermedad_cronica: false,
      es_cabeza_familia: false
    })
    const fieldErrors = reactive<Record<string, string>>({})

    const isLoading = ref(false)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const isListLoading = ref(false)
    const errorMessage = ref('')

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    onMounted(async () => {
      try {
        familias.value = await familiaService.list()
      } catch {
        // silent
      }
      isListLoading.value = true
      try {
        const response = await personaService.list()
        personas.value = Array.isArray(response) ? response : []
        resultKind.value = 'success'
        showPanel.value = true
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isListLoading.value = false
      }
    })

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.nombre.trim()) fieldErrors.nombre = 'Ingresa el nombre'
      return Object.keys(fieldErrors).length === 0
    }

    const reset = () => {
      form.id_familia = null
      form.nombre = ''
      form.edad = null
      form.es_nino = false
      form.es_anciano = false
      form.es_embarazada = false
      form.tiene_discapacidad = false
      form.tiene_enfermedad_cronica = false
      form.es_cabeza_familia = false
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    }

    const closeResult = () => {
      showPanel.value = false
      personas.value = []
      errorMessage.value = ''
    }

    const getInitials = (name: string) => {
      const parts = (name || '').trim().split(/\s+/)
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'P'
    }

    const hasAnyFlag = (p: Persona) =>
      p.es_nino || p.es_anciano || p.es_embarazada || p.tiene_discapacidad || p.tiene_enfermedad_cronica || p.es_cabeza_familia

    const createPerson = async () => {
      if (!validate()) return
      isLoading.value = true
      try {
        const nueva: Persona = await personaService.create({
          id_familia: form.id_familia ?? undefined,
          nombre: form.nombre.trim(),
          edad: form.edad ?? undefined,
          es_nino: form.es_nino,
          es_anciano: form.es_anciano,
          es_embarazada: form.es_embarazada,
          tiene_discapacidad: form.tiene_discapacidad,
          tiene_enfermedad_cronica: form.tiene_enfermedad_cronica,
          es_cabeza_familia: form.es_cabeza_familia
        })
        personas.value = [...personas.value, nueva]
        resultKind.value = 'success'
        showPanel.value = true
        reset()
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
      }
    }

    // FE-06: iniciar edición — carga los datos en el formulario
    const iniciarEdicion = (persona: Persona) => {
      editando.value = true
      personaEditandoId.value = persona.id_persona
      form.id_familia = persona.id_familia ?? null
      form.nombre = persona.nombre
      form.edad = persona.edad ?? null
      form.es_nino = persona.es_nino
      form.es_anciano = persona.es_anciano
      form.es_embarazada = persona.es_embarazada
      form.tiene_discapacidad = persona.tiene_discapacidad
      form.tiene_enfermedad_cronica = persona.tiene_enfermedad_cronica
      form.es_cabeza_familia = persona.es_cabeza_familia
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelarEdicion = () => {
      editando.value = false
      personaEditandoId.value = null
      reset()
    }

    // FE-06: guardar edición — llama a personaService.update
    const guardarEdicion = async () => {
      if (!validate() || personaEditandoId.value === null) return
      isLoading.value = true
      try {
        const actualizada: Persona = await personaService.update(personaEditandoId.value, {
          id_familia: form.id_familia ?? undefined,
          nombre: form.nombre.trim(),
          edad: form.edad ?? undefined,
          es_nino: form.es_nino,
          es_anciano: form.es_anciano,
          es_embarazada: form.es_embarazada,
          tiene_discapacidad: form.tiene_discapacidad,
          tiene_enfermedad_cronica: form.tiene_enfermedad_cronica,
          es_cabeza_familia: form.es_cabeza_familia
        })
        personas.value = personas.value.map(p =>
          p.id_persona === actualizada.id_persona ? actualizada : p
        )
        cancelarEdicion()
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
      }
    }

    // FE-06: solicitar confirmación antes de eliminar
    const solicitarEliminar = (persona: Persona) => {
      personaAEliminar.value = persona
    }

    // FE-06: confirmar y ejecutar eliminación
    const confirmarEliminar = async () => {
      if (!personaAEliminar.value) return
      isLoading.value = true
      try {
        await personaService.delete(personaAEliminar.value.id_persona)
        personas.value = personas.value.filter(
          p => p.id_persona !== personaAEliminar.value!.id_persona
        )
        personaAEliminar.value = null
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
        personaAEliminar.value = null
      } finally {
        isLoading.value = false
      }
    }

    return {
      form, fieldErrors, isLoading, showPanel, resultKind,
      personas, familias, isListLoading, errorMessage,
      editando, personaEditandoId, personaAEliminar,
      createPerson, guardarEdicion, iniciarEdicion, cancelarEdicion,
      solicitarEliminar, confirmarEliminar,
      reset, closeResult, getInitials, hasAnyFlag
    }
  }
})
</script>

<style scoped>
.item-action-btns {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.btn-icon-action {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #eaecf0;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  color: #667085;
  padding: 0;
}

.btn-icon-action svg {
  width: 14px;
  height: 14px;
}

.btn-icon-action:hover {
  transform: translateY(-1px);
}

.btn-icon-action--edit:hover {
  background: #eef4ff;
  border-color: #b2c8ff;
  color: #1d4ed8;
}

.btn-icon-action--delete:hover {
  background: #fef3f2;
  border-color: #fecdca;
  color: #b42318;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.45);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 100;
  animation: resultFade 0.2s ease;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 24px 64px rgba(16, 24, 40, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.modal-icon svg {
  width: 24px;
  height: 24px;
}

.modal-icon--danger {
  background: #fef3f2;
  color: #b42318;
  border: 1px solid #fecdca;
}

.modal-card h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #101828;
}

.modal-card p {
  margin: 0;
  font-size: 13.5px;
  color: #667085;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}
</style>