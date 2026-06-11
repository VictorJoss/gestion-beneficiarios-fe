<template>
  <div class="dash-page">
    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Configuración de puntaje</span>
          <span v-if="!isListLoading && configuraciones.length" class="count">
            <strong>{{ configuraciones.length }}</strong> reglas
          </span>
        </div>
        <button class="btn btn-ghost" @click="loadConfiguraciones">Actualizar</button>
      </div>

      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>

      <div v-else-if="configuraciones.length" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Clave</th>
              <th>Descripción</th>
              <th>Valor</th>
              <th v-if="puedeAccion('configuracion_puntaje.editar')">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in configuraciones" :key="config.id_config">
              <td>
                <strong>{{ config.clave }}</strong>
              </td>
              <td>{{ config.descripcion || 'Sin descripción' }}</td>
              <td>
                <input
                  v-if="editandoClave === config.clave"
                  v-model.number="valorEditado"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                />
                <span v-else class="badge badge-info">{{ config.valor }}</span>
              </td>
              <td v-if="puedeAccion('configuracion_puntaje.editar')">
                <div class="item-actions">
                  <template v-if="editandoClave === config.clave">
                    <button
                      class="btn btn-primary"
                      type="button"
                      :disabled="savingClave === config.clave"
                      @click="guardar(config)"
                    >
                      {{ savingClave === config.clave ? 'Guardando...' : 'Guardar' }}
                    </button>
                    <button class="btn btn-ghost" type="button" @click="cancelar">
                      Cancelar
                    </button>
                  </template>

                  <button
                    v-else
                    class="btn btn-ghost"
                    type="button"
                    @click="editar(config)"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-list">
        <div class="icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1v22"/>
            <path d="M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7"/>
          </svg>
        </div>
        <h4>Sin configuraciones</h4>
        <p>No hay reglas de puntaje registradas.</p>
      </div>

      <div v-if="successMessage" class="toast success">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </span>
        <div><strong>Operación exitosa.</strong><div>{{ successMessage }}</div></div>
      </div>

      <div v-if="errorMessage" class="toast error">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <div><strong>No se pudo completar la operación.</strong><div>{{ errorMessage }}</div></div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { configuracionPuntajeService } from '../../services/configuracionPuntaje'
import { usePermissions } from '../../composables/usePermissions'
import type { ConfiguracionPuntaje } from '../../types'

export default defineComponent({
  name: 'DashboardConfiguracionPuntaje',
  setup() {
    const { puedeAccion } = usePermissions()
    const configuraciones = ref<ConfiguracionPuntaje[]>([])
    const isListLoading = ref(false)
    const editandoClave = ref('')
    const savingClave = ref('')
    const valorEditado = ref<number>(0)
    const successMessage = ref('')
    const errorMessage = ref('')

    onMounted(async () => {
      await loadConfiguraciones()
    })

    const loadConfiguraciones = async () => {
      isListLoading.value = true
      errorMessage.value = ''
      try {
        const response = await configuracionPuntajeService.listar()
        configuraciones.value = Array.isArray(response) ? response : []
      } catch (err: any) {
        errorMessage.value = extractError(err)
      } finally {
        isListLoading.value = false
      }
    }

    const editar = (config: ConfiguracionPuntaje) => {
      editandoClave.value = config.clave
      valorEditado.value = config.valor
      successMessage.value = ''
      errorMessage.value = ''
    }

    const cancelar = () => {
      editandoClave.value = ''
      valorEditado.value = 0
    }

    const guardar = async (config: ConfiguracionPuntaje) => {
      if (valorEditado.value < 0) {
        errorMessage.value = 'El valor no puede ser negativo.'
        return
      }

      savingClave.value = config.clave
      errorMessage.value = ''
      successMessage.value = ''

      try {
        await configuracionPuntajeService.actualizar(config.clave, {
          valor: valorEditado.value
        })

        successMessage.value = `La configuración ${config.clave} fue actualizada.`
        editandoClave.value = ''
        await loadConfiguraciones()
      } catch (err: any) {
        errorMessage.value = extractError(err)
      } finally {
        savingClave.value = ''
      }
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    return {
      configuraciones,
      isListLoading,
      editandoClave,
      savingClave,
      valorEditado,
      successMessage,
      errorMessage,
      puedeAccion,
      loadConfiguraciones,
      editar,
      cancelar,
      guardar
    }
  }
})
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.9rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  text-align: left;
}

.data-table th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.input {
  width: 120px;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 0.75rem;
  outline: none;
}
</style>