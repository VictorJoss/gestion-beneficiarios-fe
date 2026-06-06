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
            <div class="form-field"><label>ID de bodega (opcional)</label><input v-model.number="warehouseId" class="input" type="number" placeholder="Ej. 1" /></div>
          </div>
          <div class="form-actions"><button type="submit" class="btn btn-primary" :disabled="loading.inv">{{ loading.inv ? 'Consultando...' : 'Consultar inventario' }}</button></div>
        </form>
      </article>
    </div>

    <section v-if="resultText" class="result-panel">
      <div class="result-head">
        <span class="label">{{ resultKind === 'success' ? 'Resultado' : 'Detalle' }}</span>
        <button class="btn btn-ghost" @click="resultText = ''">Cerrar</button>
      </div>
      <pre class="result-pre">{{ resultText }}</pre>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { recursoService } from '../../services/ubicaciones'
import { inventarioService } from '../../services/operaciones'
import { usePermissions } from '../../composables/usePermissions'

export default defineComponent({
  name: 'DashboardRecursos',
  setup() {
    const { puedeAccion } = usePermissions()
    const resource = reactive({ nombre: '', categoria: 'ALIMENTOS', unidad_medida: 'UNIDAD', peso_unitario_kg: null as number | null, umbral_alerta: null as number | null })
    const warehouseId = ref<number | null>(null)
    const loading = reactive({ create: false, inv: false })
    const resultText = ref('')
    const resultKind = ref<'success' | 'error'>('success')

    const setResult = (kind: 'success' | 'error', value: unknown) => {
      resultKind.value = kind
      resultText.value = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }

    const createResource = async () => {
      loading.create = true
      try {
        setResult('success', await recursoService.create({
          nombre: resource.nombre,
          categoria: resource.categoria as any,
          unidad_medida: resource.unidad_medida as any,
          peso_unitario_kg: resource.peso_unitario_kg ?? 0,
          umbral_alerta: resource.umbral_alerta ?? undefined
        }))
      } catch (e: any) { setResult('error', e.response?.data || e.message) } finally { loading.create = false }
    }

    const loadInventory = async () => {
      loading.inv = true
      try { setResult('success', await inventarioService.consultar(warehouseId.value ?? undefined)) }
      catch (e: any) { setResult('error', e.response?.data || e.message) } finally { loading.inv = false }
    }

    return { resource, warehouseId, loading, resultText, resultKind, createResource, loadInventory, puedeAccion }
  }
})
</script>
