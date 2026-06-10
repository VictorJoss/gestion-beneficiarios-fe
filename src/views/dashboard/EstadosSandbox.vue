<template>
  <div class="dash-page" style="display:flex; flex-direction:column; gap:24px; padding:24px;">
    <h2>Sandbox de estados UI</h2>

    <section>
      <h3>1. LoadingState (skeleton)</h3>
      <LoadingState variant="skeleton" :count="3" label="Cargando datos..." />
    </section>

    <section>
      <h3>2. LoadingState (spinner)</h3>
      <LoadingState variant="spinner" label="Cargando con spinner..." />
    </section>

    <section>
      <h3>3. EmptyState</h3>
      <EmptyState
        title="No hay beneficiarios"
        message="Crea la primera familia para empezar a registrar personas."
      />
    </section>

    <section>
      <h3>4. ErrorState (con retry)</h3>
      <ErrorState
        title="No se pudo completar la operación."
        message="Error 500: Error interno del servidor"
        retry-label="Reintentar"
        @retry="onRetry"
      />
    </section>

    <section>
      <h3>5. ErrorState (sin retry)</h3>
      <ErrorState
        title="Error de validación"
        message="El nombre es obligatorio"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'

export default defineComponent({
  name: 'EstadosSandbox',
  components: { LoadingState, EmptyState, ErrorState },
  setup() {
    const onRetry = () => alert('¡Reintento disparado! El emit retry funciona.')
    return { onRetry }
  }
})
</script>
