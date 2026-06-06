<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('recursos.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </div>
          <div class="form-card-title"><h3>Crear recurso</h3><span>Registra un nuevo recurso para el inventario</span></div>
        </div>
        <form @submit.prevent="createResource">
          <div class="form-grid">
            <div class="form-field full"><label>Nombre</label><input v-model="resource.nombre" class="input" placeholder="Ej. Arroz" /></div>
            <div class="form-field">
              <label>Categoría</label>
              <select v-model="resource.categoria" class="select">
                <option value="ALIMENTOS">ALIMENTOS</option>
                <option value="COBIJA">COBIJA</option>
                <option value="COLCHONETA">COLCHONETA</option>
                <option value="ASEO">ASEO</option>
                <option value="MEDICAMENTO">MEDICAMENTO</option>
              </select>
            </div>
            <div class="form-field">
              <label>Unidad de medida</label>
              <select v-model="resource.unidad_medida" class="select">
                <option value="KG">KG</option>
                <option value="UNIDAD">UNIDAD</option>
                <option value="LITRO">LITRO</option>
              </select>
            </div>
            <div class="form-field"><label>Peso unitario (kg)</label><input v-model.number="resource.peso_unitario_kg" class="input" type="number" step="any" placeholder="1.0" /></div>
            <div class="form-field"><label>Umbral de alerta</label><input v-model.number="resource.umbral_alerta" class="input" type="number" placeholder="50" /></div>
          </div>
          <div class="form-actions"><button type="submit" class="btn btn-primary" :disabled="loading.create">{{ loading.create ? 'Creando...' : 'Crear recurso' }}</button></div>
        </form>
      </article>

      <article v-if="puedeAccion('recursos.inventario')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg>
          </div>
          <div class="form-card-title"><h3>Consultar inventario</h3><span>Consulta el inventario de una bodega específica</span></div>
        </div>
        <form @submit.prevent="loadInventory">
          <div class="form-grid single">
            <div class="form-field"><label>ID de bodega (opcional)</label><select v-model.number="warehouseId" class="select"><option :value="null">Todas las bodegas</option><option v-for="b in bodegas" :key="b.id_bodega" :value="b.id_bodega">{{ b.nombre }}</option></select></div>
          </div>
          <div class="form-actions"><button type="submit" class="btn btn-primary" :disabled="loading.inv">{{ loading.inv ? 'Consultando...' : 'Consultar inventario' }}</button></div>
        </form>
      </article>
    </div>

    <section v-if="showPanel" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">{{ panelTitle }}</span>
          <span v-if="inventoryData && inventoryData.bodegas" class="count">
            <strong>{{ inventoryData.bodegas.length }}</strong> {{ inventoryData.bodegas.length === 1 ? 'bodega' : 'bodegas' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="resultKind === 'success'">
        <div v-if="createdResource" class="detail-card">
          <div class="detail-row"><span class="k">Nombre</span><span class="v">{{ createdResource.nombre }}</span></div>
          <div class="detail-row"><span class="k">Categor&iacute;a</span><span class="v"><span class="badge" :class="categoriaBadge(createdResource.categoria)">{{ createdResource.categoria }}</span></span></div>
          <div class="detail-row"><span class="k">Unidad de medida</span><span class="v">{{ createdResource.unidad_medida }}</span></div>
          <div class="detail-row"><span class="k">Peso unitario</span><span class="v">{{ createdResource.peso_unitario_kg ?? '—' }} kg</span></div>
          <div class="detail-row"><span class="k">Umbral de alerta</span><span class="v">{{ createdResource.umbral_alerta ?? '—' }}</span></div>
          <div class="detail-row"><span class="k">Estado</span><span class="v"><span class="status"><span class="dot" :class="createdResource.activo ? 'on' : 'off'"></span>{{ createdResource.activo ? 'Activo' : 'Inactivo' }}</span></span></div>
        </div>

        <div v-if="inventoryData" class="inventory-result">
          <div v-for="bodega in inventoryData.bodegas" :key="bodega.id_bodega" class="inv-bodega-card">
            <div class="inv-bodega-head">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <h4>{{ bodega.nombre }}</h4>
            </div>
            <table v-if="bodega.lineas.length" class="inv-table">
              <thead><tr><th>Recurso</th><th>Categor&iacute;a</th><th>Cantidad</th><th>U.M.</th><th>Alerta</th></tr></thead>
              <tbody>
                <tr v-for="linea in bodega.lineas" :key="linea.id_recurso">
                  <td>{{ linea.nombre }}</td>
                  <td><span class="badge badge-sm" :class="categoriaBadge(linea.categoria)">{{ linea.categoria }}</span></td>
                  <td class="num">{{ linea.cantidad_disponible }}</td>
                  <td>{{ linea.unidad_medida }}</td>
                  <td><span v-if="linea.alerta_activa" class="badge badge-sm badge-danger">⚠</span><span v-else class="muted">—</span></td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-mini">Sin l&iacute;neas de inventario</div>
          </div>

          <div v-if="inventoryData.consolidado && inventoryData.consolidado.length" class="inv-consolidado">
            <h4>Consolidado</h4>
            <table class="inv-table">
              <thead><tr><th>Recurso</th><th>Categor&iacute;a</th><th>Total</th><th>U.M.</th></tr></thead>
              <tbody>
                <tr v-for="linea in inventoryData.consolidado" :key="linea.id_recurso">
                  <td>{{ linea.nombre }}</td>
                  <td><span class="badge badge-sm" :class="categoriaBadge(linea.categoria)">{{ linea.categoria }}</span></td>
                  <td class="num">{{ linea.cantidad_total }}</td>
                  <td>{{ linea.unidad_medida }}</td>
                </tr>
              </tbody>
            </table>
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
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { recursoService, bodegaService } from '../../services/ubicaciones'
import { inventarioService } from '../../services/operaciones'
import { usePermissions } from '../../composables/usePermissions'
import type { Recurso, CategoriaRecurso, InventarioConsultaResponse, Bodega } from '../../types'

export default defineComponent({
  name: 'DashboardRecursos',
  setup() {
    const { puedeAccion } = usePermissions()
    const resource = reactive({ nombre: '', categoria: 'ALIMENTOS', unidad_medida: 'UNIDAD', peso_unitario_kg: null as number | null, umbral_alerta: null as number | null })
    const bodegas = ref<Bodega[]>([])
    const warehouseId = ref<number | null>(null)
    const loading = reactive({ create: false, inv: false })

    onMounted(async () => {
      try {
        bodegas.value = await bodegaService.list()
      } catch {
        // silent
      }
    })
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const mode = ref<'create' | 'inventory' | null>(null)
    const createdResource = ref<Recurso | null>(null)
    const inventoryData = ref<InventarioConsultaResponse | null>(null)
    const errorMessage = ref('')

    const panelTitle = computed(() => {
      if (mode.value === 'create') return 'Recurso creado'
      if (mode.value === 'inventory') return 'Inventario'
      return 'Resultado'
    })

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const closeResult = () => {
      showPanel.value = false
      createdResource.value = null
      inventoryData.value = null
      errorMessage.value = ''
    }

    const categoriaBadge = (cat: CategoriaRecurso): string => {
      const map: Record<CategoriaRecurso, string> = {
        ALIMENTOS: 'badge-success',
        COBIJA: 'badge-info',
        COLCHONETA: 'badge-cyan',
        ASEO: 'badge-warning',
        MEDICAMENTO: 'badge-danger'
      }
      return map[cat] || 'badge-default'
    }

    const createResource = async () => {
      loading.create = true
      mode.value = 'create'
      try {
        const result = await recursoService.create({
          nombre: resource.nombre,
          categoria: resource.categoria as CategoriaRecurso,
          unidad_medida: resource.unidad_medida as any,
          peso_unitario_kg: resource.peso_unitario_kg ?? 0,
          umbral_alerta: resource.umbral_alerta ?? undefined
        })
        resultKind.value = 'success'
        createdResource.value = result
        inventoryData.value = null
        showPanel.value = true
        resource.nombre = ''
        resource.categoria = 'ALIMENTOS'
        resource.unidad_medida = 'UNIDAD'
        resource.peso_unitario_kg = null
        resource.umbral_alerta = null
      } catch (e: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(e)
        inventoryData.value = null
        createdResource.value = null
        showPanel.value = true
      } finally {
        loading.create = false
      }
    }

    const loadInventory = async () => {
      loading.inv = true
      mode.value = 'inventory'
      try {
        const result = await inventarioService.consultar(warehouseId.value ?? undefined)
        resultKind.value = 'success'
        inventoryData.value = result
        createdResource.value = null
        showPanel.value = true
      } catch (e: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(e)
        inventoryData.value = null
        createdResource.value = null
        showPanel.value = true
      } finally {
        loading.inv = false
      }
    }

    return {
      resource, bodegas, warehouseId, loading, showPanel, resultKind, mode,
      createdResource, inventoryData, errorMessage,
      panelTitle, closeResult, categoriaBadge,
      createResource, loadInventory, puedeAccion
    }
  }
})
</script>
