<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Crear persona</h3>
            <span>Registra una persona asociada a una familia</span>
          </div>
        </div>

        <form @submit.prevent="createPerson">
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
              <span v-if="isLoading && mode === 'create'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
              </span>
              {{ isLoading && mode === 'create' ? 'Creando...' : 'Crear persona' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="reset" :disabled="isLoading">Limpiar</button>
          </div>
        </form>
      </article>
    </div>

    <section v-if="showPanel || isListLoading" class="result-panel">
      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-80"></div>
          </div>
        </div>
      </div>

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
                  <span v-if="!hasAnyFlag(persona)" class="badge badge-default">Sin caracter&iacute;sticas</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="badge badge-default">ID {{ persona.id_persona }}</span>
              </div>
            </li>
          </ul>

          <div v-else-if="Array.isArray(personas) && personas.length === 0" class="empty-list">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h4>Sin personas registradas</h4>
            <p>Aún no se han creado personas en la plataforma.</p>
          </div>

          <div v-else class="detail-card">
            <div class="detail-row">
              <span class="k">Detalle</span>
              <span class="v">Persona creada correctamente.</span>
            </div>
          </div>
        </div>

        <div v-else class="toast error">
          <span class="toast-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </span>
          <div>
            <strong>No se pudo completar la operaci&oacute;n.</strong>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { familiaService, personaService } from '../../services/familia'
import type { Persona, Familia } from '../../types'

export default defineComponent({
  name: 'DashboardPersonas',
  setup() {
    const familias = ref<Familia[]>([])

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
    const mode = ref<'create' | 'list' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const personas = ref<Persona[]>([])
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
      mode.value = 'create'
      try {
        const response: Persona = await personaService.create({
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
        resultKind.value = 'success'
        personas.value = [response]
        showPanel.value = true
        reset()
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const loadPersonas = async () => {
      isLoading.value = true
      mode.value = 'list'
      try {
        const response: Persona[] = await personaService.list()
        resultKind.value = 'success'
        personas.value = Array.isArray(response) ? response : []
        showPanel.value = true
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        personas.value = []
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      personas, familias, isListLoading, errorMessage,
      createPerson, loadPersonas, reset, closeResult,
      getInitials, hasAnyFlag
    }
  }
})
</script>
