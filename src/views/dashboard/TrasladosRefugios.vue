<template>
  <section class="traslados-page">
    <header class="page-header">
      <div>
        <h1>Traslados a refugios</h1>
        <p>Asigna familias registradas a refugios disponibles.</p>
      </div>
    </header>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>

    <form class="card" @submit.prevent="registrarTraslado">
      <label>
        Familia
        <select v-model.number="form.id_familia" required>
          <option value="">Seleccione una familia</option>
          <option
            v-for="familia in familias"
            :key="familia.id_familia"
            :value="familia.id_familia"
          >
            {{ familia.codigo_familia }} - Puntaje {{ familia.puntaje_prioridad }}
          </option>
        </select>
      </label>

      <label>
        Refugio destino
        <select v-model.number="form.id_refugio_destino" required>
          <option value="">Seleccione un refugio</option>
          <option
            v-for="refugio in refugiosDisponibles"
            :key="refugio.id"
            :value="refugio.id"
          >
            {{ refugio.nombre }} - {{ refugio.ocupacion_actual }}/{{ refugio.capacidad_maxima_personas }}
          </option>
        </select>
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrar traslado' }}
      </button>
    </form>

    <section class="card" v-if="ultimoTraslado">
      <h2>Último traslado registrado</h2>
      <p><strong>Familia:</strong> {{ ultimoTraslado.id_familia }}</p>
      <p><strong>Personas trasladadas:</strong> {{ ultimoTraslado.personas_trasladadas }}</p>
      <p><strong>Refugio destino:</strong> {{ ultimoTraslado.destino?.nombre || ultimoTraslado.id_refugio_destino }}</p>
      <p><strong>Fecha:</strong> {{ formatFecha(ultimoTraslado.fecha_traslado) }}</p>
    </section>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { familiaService } from '../../services/familia'
import { refugioService, trasladoService } from '../../services/ubicaciones'
import type { Familia, Refugio, TrasladoResponse } from '../../types'

export default defineComponent({
  name: 'TrasladosRefugios',
  setup() {
    const familias = ref<Familia[]>([])
    const refugios = ref<Refugio[]>([])
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const ultimoTraslado = ref<TrasladoResponse | null>(null)

    const form = reactive({
      id_familia: undefined as number | undefined,
      id_refugio_destino: undefined as number | undefined
    })

    const refugiosDisponibles = computed(() => refugios.value.filter((refugio) => {
    const ocupacion = Number(refugio.ocupacion_actual || 0)
    const capacidad = Number(refugio.capacidad_maxima_personas || 0)
    return capacidad > 0 && ocupacion < capacidad
  })
)

    const cargarDatos = async () => {
      error.value = ''
      try {
        const [familiasData, refugiosData] = await Promise.all([
          familiaService.list(),
          refugioService.list()
        ])

        familias.value = familiasData
        refugios.value = refugiosData
      } catch (err: any) {
        error.value = err?.response?.data?.detail || 'No se pudieron cargar los datos.'
      }
    }

    const registrarTraslado = async () => {
      if (!form.id_familia || !form.id_refugio_destino) {
        error.value = 'Debe seleccionar una familia y un refugio destino.'
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const response = await trasladoService.trasladarFamilia({
          id_familia: form.id_familia,
          id_refugio_destino: form.id_refugio_destino
        })

        ultimoTraslado.value = response
        success.value = 'Traslado registrado correctamente.'
        form.id_familia = undefined
        form.id_refugio_destino = undefined
        await cargarDatos()
      } catch (err: any) {
        error.value = err?.response?.data?.detail || 'No se pudo registrar el traslado.'
      } finally {
        loading.value = false
      }
    }

    const formatFecha = (fecha: string) => {
      return new Date(fecha).toLocaleString('es-CO')
    }

    onMounted(cargarDatos)

    return {
      familias,
      refugiosDisponibles,
      form,
      loading,
      error,
      success,
      ultimoTraslado,
      registrarTraslado,
      formatFecha
    }
  }
})
</script>

<style scoped>
.traslados-page {
  display: grid;
  gap: 18px;
}

.page-header h1 {
  margin: 0;
  color: #101828;
  font-size: 28px;
}

.page-header p {
  margin: 6px 0 0;
  color: #667085;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.08);
  border: 1px solid #eaecf0;
  display: grid;
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 600;
  color: #344054;
}

select {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d0d5dd;
  font-size: 14px;
}

button {
  justify-self: start;
  border: 0;
  border-radius: 12px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #2b7cff, #5d8cff);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.alert {
  padding: 12px 14px;
  border-radius: 12px;
  font-weight: 600;
}

.alert.error {
  background: #fef3f2;
  color: #b42318;
}

.alert.success {
  background: #ecfdf3;
  color: #027a48;
}
</style>