<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('donantes.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Registrar donante</h3>
            <span>Añade un nuevo donante a la plataforma</span>
          </div>
        </div>
        <form @submit.prevent="createDonor">
          <div class="form-grid">
            <div class="form-field" :class="{ error: fieldErrors.nombre }">
              <label class="req">Nombre</label>
              <input v-model="form.nombre" class="input" placeholder="Nombre del donante" />
              <span v-if="fieldErrors.nombre" class="error-text">{{ fieldErrors.nombre }}</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.tipo_donante }">
              <label class="req">Tipo de donante</label>
              <select v-model="form.tipo_donante" class="select">
                <option value="">Selecciona una opción</option>
                <option value="Persona">Persona natural</option>
                <option value="Empresa">Empresa</option>
                <option value="ONG">ONG</option>
                <option value="Gobierno">Entidad gubernamental</option>
                <option value="Iglesia">Iglesia / Comunidad religiosa</option>
                <option value="Otro">Otro</option>
              </select>
              <span v-if="fieldErrors.tipo_donante" class="error-text">{{ fieldErrors.tipo_donante }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'create'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              {{ isLoading && mode === 'create' ? 'Registrando...' : 'Registrar donante' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="reset" :disabled="isLoading">Limpiar</button>
          </div>
        </form>
      </article>
    </div>

    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Donantes</span>
          <span v-if="!isListLoading && donantes.length" class="count">
            <strong>{{ donantes.length }}</strong> {{ donantes.length === 1 ? 'donante' : 'donantes' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item"><div class="skeleton-avatar"></div><div class="skeleton-body"><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div></div>
      </div>

      <div v-else-if="isCreatedResult && createdDonante" class="item-list">
        <div class="item-card">
          <div class="item-avatar variant-pink">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div class="item-content">
            <h4>{{ createdDonante.nombre }}</h4>
            <p>Donante creado correctamente</p>
            <div class="item-meta"><span class="badge badge-pink">{{ createdDonante.tipo_donante }}</span></div>
          </div>
          <div class="item-actions"><span class="badge badge-default">ID {{ createdDonante.id_donante }}</span></div>
        </div>
      </div>

      <div v-else-if="donantes.length" class="item-list">
        <div v-for="donante in donantes" :key="donante.id_donante" class="item-card">
          <div class="item-avatar variant-pink">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div class="item-content">
            <h4>{{ donante.nombre }}</h4>
            <p v-if="donante.fecha_registro">Registrado el {{ formatDate(donante.fecha_registro) }}</p>
            <p v-else>Donante registrado</p>
            <div class="item-meta"><span class="badge badge-pink">{{ donante.tipo_donante }}</span></div>
          </div>
          <div class="item-actions"><span class="badge badge-default">ID {{ donante.id_donante }}</span></div>
        </div>
      </div>

      <div v-else class="empty-list">
        <div class="icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        <h4>Sin donantes registrados</h4>
        <p>A&uacute;n no se han creado donantes en la plataforma.</p>
      </div>

      <div v-if="resultKind === 'error'" class="toast error">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <div><strong>No se pudo completar la operaci&oacute;n.</strong><div>{{ errorMessage }}</div></div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { donanteService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import type { Donante } from '../../types'

export default defineComponent({
  name: 'DashboardDonantes',
  setup() {
    const { puedeAccion } = usePermissions()
    const form = reactive({ nombre: '', tipo_donante: '' })
    const fieldErrors = reactive<Record<string, string>>({})
    const isLoading = ref(false)
    const mode = ref<'create' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const donantes = ref<Donante[]>([])
    const isListLoading = ref(false)
    const isCreatedResult = ref(false)
    const createdDonante = ref<Donante | null>(null)
    const errorMessage = ref('')

    onMounted(async () => {
      isListLoading.value = true
      try {
        const response = await donanteService.list()
        donantes.value = Array.isArray(response) ? response : []
      } catch {
        // silent
      } finally {
        isListLoading.value = false
      }
    })

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.nombre.trim()) fieldErrors.nombre = 'Ingresa el nombre del donante'
      if (!form.tipo_donante) fieldErrors.tipo_donante = 'Selecciona el tipo de donante'
      return Object.keys(fieldErrors).length === 0
    }

    const reset = () => {
      form.nombre = ''
      form.tipo_donante = ''
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    }

    const closeResult = () => {
      showPanel.value = false
      isCreatedResult.value = false
      createdDonante.value = null
      errorMessage.value = ''
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const formatDate = (iso?: string) => {
      if (!iso) return '—'
      try {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      } catch {
        return iso
      }
    }

    const createDonor = async () => {
      if (!validate()) return
      isLoading.value = true
      mode.value = 'create'
      try {
        const response: Donante = await donanteService.create({
          nombre: form.nombre.trim(),
          tipo_donante: form.tipo_donante
        })
        resultKind.value = 'success'
        createdDonante.value = response
        isCreatedResult.value = true
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

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      donantes, isListLoading, isCreatedResult, createdDonante, errorMessage,
      createDonor, reset, closeResult,
      formatDate, puedeAccion
    }
  }
})
</script>
