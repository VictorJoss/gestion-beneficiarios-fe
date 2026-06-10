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

    <section>
      <h3>6. Pagination — básico (pocos registros)</h3>
      <Pagination
        :current-page="basicPage"
        :page-size="10"
        :total="42"
        item-label="usuario"
        @update:current-page="basicPage = $event"
      />
      <p class="muted">Página actual: {{ basicPage }} de {{ Math.ceil(42 / 10) }}</p>
    </section>

    <section>
      <h3>7. Pagination — muchas páginas con elipsis</h3>
      <Pagination
        :current-page="manyPage"
        :page-size="10"
        :total="237"
        :sibling-count="1"
        item-label="registro"
        @update:current-page="manyPage = $event"
      />
      <p class="muted">Página actual: {{ manyPage }} — total 237 registros / 24 páginas</p>
    </section>

    <section>
      <h3>8. Pagination — cambio de tamaño de página</h3>
      <Pagination
        :current-page="sizedPage"
        :page-size="sizedSize"
        :total="sizedTotal"
        :page-size-options="[5, 10, 25, 50]"
        item-label="familia"
        @update:current-page="sizedPage = $event"
        @update:page-size="sizedSize = $event"
      />
      <p class="muted">
        Página: {{ sizedPage }} · Tamaño: {{ sizedSize }} · Total: {{ sizedTotal }}
      </p>
    </section>

    <section>
      <h3>9. Pagination — estado de carga (loading)</h3>
      <Pagination
        :current-page="loadingPage"
        :page-size="10"
        :total="85"
        :loading="true"
        item-label="donante"
        @update:current-page="loadingPage = $event"
      />
      <p class="muted">Todos los controles se deshabilitan mientras <code>:loading="true"</code>.</p>
    </section>

    <section>
      <h3>10. Pagination — solo íconos (iconOnly)</h3>
      <Pagination
        :current-page="iconPage"
        :page-size="10"
        :total="130"
        :icon-only="true"
        :sibling-count="0"
        @update:current-page="iconPage = $event"
      />
    </section>

    <section>
      <h3>11. Pagination — sin info (showInfo=false)</h3>
      <Pagination
        :current-page="noInfoPage"
        :page-size="10"
        :total="60"
        :show-info="false"
        @update:current-page="noInfoPage = $event"
      />
    </section>

    <section>
      <h3>12. Pagination — una sola página (oculta por defecto)</h3>
      <Pagination
        :current-page="1"
        :page-size="10"
        :total="5"
        item-label="recurso"
      />
      <p class="muted">No se muestra porque <code>totalPages <= 1</code>.</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import Pagination from '../../components/Pagination.vue'

export default defineComponent({
  name: 'EstadosSandbox',
  components: { LoadingState, EmptyState, ErrorState, Pagination },
  setup() {
    const onRetry = () => alert('¡Reintento disparado! El emit retry funciona.')

    const basicPage = ref(2)
    const manyPage = ref(12)
    const sizedPage = ref(1)
    const sizedSize = ref(10)
    const sizedTotal = ref(123)
    const loadingPage = ref(3)
    const iconPage = ref(5)
    const noInfoPage = ref(2)

    return {
      onRetry,
      basicPage,
      manyPage,
      sizedPage,
      sizedSize,
      sizedTotal,
      loadingPage,
      iconPage,
      noInfoPage
    }
  }
})
</script>

<style scoped>
section h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #344054;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.muted {
  margin-top: 8px;
  font-size: 12.5px;
  color: #667085;
}
code {
  padding: 1px 6px;
  border-radius: 6px;
  background: #f2f4f7;
  color: #1d4ed8;
  font-size: 12px;
}
</style>
