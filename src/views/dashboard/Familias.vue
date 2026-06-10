<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('familias.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Crear familia</h3>
            <span>Registra una nueva familia en el sistema</span>
          </div>
        </div>
        <form @submit.prevent="createFamily">
          <div class="form-grid single">
            <div class="form-field">
              <label>Zona (opcional)</label>
              <select v-model="form.id_zona" class="select">
                <option :value="null">Sin zona asignada</option>
                <option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option>
              </select>
              <span class="helper">Zona geogr&aacute;fica a la que pertenece la familia.</span>
            </div>
            <div class="form-field">
              <label class="check">
                <input v-model="form.acepta_privacidad" type="checkbox" />
                <span>Acepta política de privacidad <span class="req">*</span></span>
              </label>
              <span v-if="fieldErrors.acepta_privacidad" class="error-text">{{ fieldErrors.acepta_privacidad }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'create'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </span>
              {{ isLoading && mode === 'create' ? 'Creando...' : 'Crear familia' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="isLoading">Limpiar</button>
          </div>
        </form>
      </article>

    </div>

    <section v-if="showPanel || isListLoading" class="result-panel">
      <LoadingState v-if="isListLoading" variant="skeleton" :count="4" label="Cargando familias..." />

      <template v-else>
        <div class="result-head">
          <div class="result-head-info">
            <span class="label">Listado de familias</span>
            <span v-if="resultKind === 'success' && Array.isArray(familias)" class="count">
              <strong>{{ familias.length }}</strong> {{ familias.length === 1 ? 'familia' : 'familias' }}
            </span>
          </div>
          <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
        </div>

        <div v-if="resultKind === 'success'">
          <ul v-if="Array.isArray(familias) && familias.length" class="item-list">
            <li v-for="familia in familias" :key="familia.id_familia" class="item-card">
              <div class="item-avatar variant-green">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div class="item-content">
                <h4>{{ familia.codigo_familia || 'Familia #' + familia.id_familia }}</h4>
                <p>Registrada el {{ formatDate(familia.fecha_registro) }}</p>
                <div class="item-meta">
                  <span class="badge" :class="familia.acepta_privacidad ? 'badge-success' : 'badge-warning'">
                    {{ familia.acepta_privacidad ? 'Privacidad OK' : 'Sin privacidad' }}
                  </span>
                  <span v-if="familia.puntaje_prioridad !== undefined" class="badge badge-info">
                    Prioridad: {{ familia.puntaje_prioridad }}
                  </span>
                  <span v-if="familia.id_zona" class="badge badge-default">Zona #{{ familia.id_zona }}</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="badge badge-default">ID {{ familia.id_familia }}</span>
              </div>
            </li>
          </ul>

          <EmptyState
            v-else-if="Array.isArray(familias) && familias.length === 0"
            title="Sin familias registradas"
            message="Aún no se han creado familias en la plataforma."
          />

          <div v-else class="detail-card">
            <div class="detail-row">
              <span class="k">Detalle</span>
              <span class="v">Familia creada correctamente.</span>
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
import { familiaService } from '../../services/familia'
import { zonaService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import type { Familia, Zona } from '../../types'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'

export default defineComponent({
  name: 'DashboardFamilias',
  components: { LoadingState, EmptyState, ErrorState },
  setup() {
    const { puedeAccion } = usePermissions()
    const form = reactive({ acepta_privacidad: true, id_zona: null as number | null })
    const fieldErrors = reactive<Record<string, string>>({})
    const isLoading = ref(false)
    const mode = ref<'create' | 'list' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const familias = ref<Familia[]>([])
    const zonas = ref<Zona[]>([])
    const isListLoading = ref(false)
    const errorMessage = ref('')

    onMounted(async () => {
      try {
        zonas.value = await zonaService.list()
      } catch {
        // silent
      }
      if (puedeAccion('familias.listar')) {
        isListLoading.value = true
        try {
          const response = await familiaService.list()
          familias.value = Array.isArray(response) ? response : []
          resultKind.value = 'success'
          showPanel.value = true
        } catch (err: any) {
          resultKind.value = 'error'
          errorMessage.value = extractError(err)
          showPanel.value = true
        } finally {
          isListLoading.value = false
        }
      }
    })

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.acepta_privacidad) fieldErrors.acepta_privacidad = 'Debe aceptar la política de privacidad'
      return Object.keys(fieldErrors).length === 0
    }

    const closeResult = () => {
      showPanel.value = false
      familias.value = []
      errorMessage.value = ''
    }

    const resetForm = () => {
      form.acepta_privacidad = true
      form.id_zona = null
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
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

    const createFamily = async () => {
      if (!validate()) return
      isLoading.value = true
      mode.value = 'create'
      try {
        const response: Familia = await familiaService.create({
          acepta_privacidad: form.acepta_privacidad,
          id_zona: form.id_zona ?? undefined
        })
        resultKind.value = 'success'
        familias.value = [response]
        showPanel.value = true
        resetForm()
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const loadFamilies = async () => {
      isLoading.value = true
      mode.value = 'list'
      try {
        const response: Familia[] = await familiaService.list()
        resultKind.value = 'success'
        familias.value = Array.isArray(response) ? response : []
        showPanel.value = true
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        familias.value = []
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      familias, zonas, isListLoading, errorMessage,
      createFamily, loadFamilies, resetForm, closeResult,
      formatDate, puedeAccion
    }
  }
})
</script>
