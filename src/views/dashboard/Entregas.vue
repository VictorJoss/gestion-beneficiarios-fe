<template>
  <div class="dash-page">
    <!-- Filtros y cabecera -->
    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Entregas registradas</span>
          <span v-if="!isLoading" class="count">
            <strong>{{ total }}</strong>
            {{ total === 1 ? "entrega" : "entregas" }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="cargarEntregas">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Filtros -->
      <div class="filtros-row">
        <select
          v-model="filtroEstado"
          class="select filtro-select"
          @change="cargarEntregas"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ENTREGADA">Entregada</option>
          <option value="ANULADA">Anulada</option>
        </select>
        <input
          v-model="filtroFamilia"
          class="input filtro-input"
          type="number"
          min="1"
          placeholder="Filtrar por ID familia"
          @change="cargarEntregas"
        />
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="item-list">
        <div v-for="n in 5" :key="n" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-80"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="toast error">
        <span class="toast-icon">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <div>
          <strong>Error al cargar entregas.</strong>
          <div>{{ errorMessage }}</div>
        </div>
      </div>

      <!-- Lista -->
      <ul v-else-if="entregas.length" class="item-list">
        <li
          v-for="entrega in entregas"
          :key="entrega.id_entrega"
          class="item-card entrega-card"
          :class="{
            'entrega-card--expanded': expandida === entrega.id_entrega,
          }"
        >
          <!-- Cabecera del item -->
          <div class="item-avatar" :class="avatarEstado(entrega.estado)">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>

          <div class="item-content">
            <h4>
              {{
                entrega.codigo ||
                "ENT-" + String(entrega.id_entrega).padStart(5, "0")
              }}
            </h4>
            <p>
              <span v-if="entrega.id_familia"
                >Familia #{{ entrega.id_familia }}</span
              >
              <span v-if="entrega.fecha_efectiva">
                &middot; {{ formatFecha(entrega.fecha_efectiva) }}</span
              >
            </p>
            <div class="item-meta">
              <span :class="['badge', badgeEstado(entrega.estado)]">{{
                labelEstado(entrega.estado)
              }}</span>
              <span v-if="entrega.detalles?.length" class="badge badge-default"
                >{{ entrega.detalles.length }}
                {{
                  entrega.detalles.length === 1 ? "recurso" : "recursos"
                }}</span
              >
            </div>
          </div>

          <div class="item-actions">
            <button
              class="btn-expandir"
              :class="{
                'btn-expandir--active': expandida === entrega.id_entrega,
              }"
              :title="
                expandida === entrega.id_entrega
                  ? 'Cerrar detalle'
                  : 'Ver detalle'
              "
              @click="toggleDetalle(entrega.id_entrega)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <!-- Detalle expandible -->
          <div v-if="expandida === entrega.id_entrega" class="entrega-detalle">
            <div v-if="cargandoDetalle" class="detalle-loading">
              <div class="spinner-sm"></div>
              Cargando detalle...
            </div>
            <template v-else-if="detalleActual">
              <div class="detalle-grid">
                <div class="detalle-item">
                  <span class="detalle-label">ID entrega</span>
                  <span class="detalle-valor"
                    >#{{ detalleActual.id_entrega }}</span
                  >
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Código</span>
                  <span class="detalle-valor">{{
                    detalleActual.codigo || "—"
                  }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Familia</span>
                  <span class="detalle-valor">{{
                    detalleActual.id_familia
                      ? "#" + detalleActual.id_familia
                      : "—"
                  }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Bodega</span>
                  <span class="detalle-valor">{{
                    detalleActual.id_bodega
                      ? "#" + detalleActual.id_bodega
                      : "—"
                  }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Fecha efectiva</span>
                  <span class="detalle-valor">{{
                    formatFecha(detalleActual.fecha_efectiva)
                  }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Estado</span>
                  <span :class="['badge', badgeEstado(detalleActual.estado)]">{{
                    labelEstado(detalleActual.estado)
                  }}</span>
                </div>
                <div v-if="detalleActual.coordenadas" class="detalle-item full">
                  <span class="detalle-label">Coordenadas</span>
                  <span class="detalle-valor">{{
                    detalleActual.coordenadas
                  }}</span>
                </div>
              </div>

              <!-- Recursos entregados -->
              <div
                v-if="detalleActual.detalles?.length"
                class="detalle-recursos"
              >
                <h5>Recursos entregados</h5>
                <ul class="recursos-list">
                  <li
                    v-for="d in detalleActual.detalles"
                    :key="d.id_detalle"
                    class="recurso-item"
                  >
                    <span class="recurso-nombre">{{
                      d.nombre_recurso || "Recurso #" + d.id_recurso
                    }}</span>
                    <span class="badge badge-default"
                      >{{ d.cantidad }} unid.</span
                    >
                  </li>
                </ul>
              </div>
              <div v-else class="detalle-empty">
                Sin recursos registrados en esta entrega.
              </div>
            </template>
          </div>
        </li>
      </ul>

      <!-- Vacío -->
      <div v-else class="empty-list">
        <div class="icon">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
        <h4>Sin entregas registradas</h4>
        <p>No hay entregas que coincidan con los filtros aplicados.</p>
      </div>

      <!-- Paginación -->
      <Pagination
        v-if="!isLoading && total > pageSize"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @page-change="onPageChange"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import Pagination from "../../components/Pagination.vue";
import { entregaService } from "../../services/operaciones";
import type { Entrega } from "../../types";

export default defineComponent({
  name: "DashboardEntregas",
  components: { Pagination },
  setup() {
    const entregas = ref<Entrega[]>([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    const isLoading = ref(false);
    const errorMessage = ref("");

    const filtroEstado = ref("");
    const filtroFamilia = ref<number | null>(null);

    const expandida = ref<number | null>(null);
    const detalleActual = ref<Entrega | null>(null);
    const cargandoDetalle = ref(false);

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail))
        return detail.map((d: any) => d.msg).join(", ");
      return err?.message || "Error desconocido";
    };

    const cargarEntregas = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      expandida.value = null;
      try {
        const result = await entregaService.listar({
          estado: filtroEstado.value || undefined,
          id_familia: filtroFamilia.value ?? undefined,
          skip: (currentPage.value - 1) * pageSize.value,
          limit: pageSize.value,
        });
        entregas.value = Array.isArray(result)
          ? result
          : ((result as any).items ?? []);
        total.value = Array.isArray(result)
          ? result.length
          : ((result as any).total ?? entregas.value.length);
      } catch (err: any) {
        errorMessage.value = extractError(err);
      } finally {
        isLoading.value = false;
      }
    };

    const toggleDetalle = async (id: number) => {
      if (expandida.value === id) {
        expandida.value = null;
        detalleActual.value = null;
        return;
      }
      expandida.value = id;
      detalleActual.value = null;
      cargandoDetalle.value = true;
      try {
        detalleActual.value = await entregaService.get(id);
      } catch {
        detalleActual.value =
          entregas.value.find((e) => e.id_entrega === id) ?? null;
      } finally {
        cargandoDetalle.value = false;
      }
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
      cargarEntregas();
    };

    onMounted(cargarEntregas);

    // Helpers UI
    const labelEstado = (e: string) =>
      ({
        PENDIENTE: "Pendiente",
        ENTREGADA: "Entregada",
        ANULADA: "Anulada",
      })[e] ?? e;

    const badgeEstado = (e: string) =>
      ({
        PENDIENTE: "badge-warning",
        ENTREGADA: "badge-success",
        ANULADA: "badge-danger",
      })[e] ?? "badge-default";

    const avatarEstado = (e: string) =>
      ({
        PENDIENTE: "variant-yellow",
        ENTREGADA: "variant-green",
        ANULADA: "variant-red",
      })[e] ?? "";

    const formatFecha = (f: string) =>
      new Date(f).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    return {
      entregas,
      total,
      currentPage,
      pageSize,
      isLoading,
      errorMessage,
      filtroEstado,
      filtroFamilia,
      expandida,
      detalleActual,
      cargandoDetalle,
      cargarEntregas,
      toggleDetalle,
      onPageChange,
      labelEstado,
      badgeEstado,
      avatarEstado,
      formatFecha,
    };
  },
});
</script>

<style scoped>
.filtros-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 4px;
}

.filtro-select,
.filtro-input {
  width: auto;
  min-width: 180px;
  flex: 1;
}

/* Tarjeta entrega */
.entrega-card {
  flex-wrap: wrap;
  align-items: flex-start;
}

.entrega-card--expanded {
  border-color: #d0e0ff;
  background: #fafbff;
}

/* Botón expandir */
.btn-expandir {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #eaecf0;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.2s;
  color: #667085;
  padding: 0;
  flex-shrink: 0;
}

.btn-expandir svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.btn-expandir--active svg {
  transform: rotate(180deg);
}

.btn-expandir:hover {
  background: #eef4ff;
  border-color: #b2c8ff;
  color: #1d4ed8;
}

/* Detalle expandible */
.entrega-detalle {
  width: 100%;
  border-top: 1px solid #eaecf0;
  padding-top: 16px;
  margin-top: 8px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detalle-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667085;
  font-size: 13px;
  padding: 8px 0;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e6f0;
  border-top-color: #3b7cff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detalle-item.full {
  grid-column: 1 / -1;
}

.detalle-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #98a2b3;
}

.detalle-valor {
  font-size: 13.5px;
  color: #344054;
  font-weight: 500;
}

/* Recursos */
.detalle-recursos h5 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #667085;
  margin: 0 0 10px;
}

.recursos-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recurso-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #eaecf0;
}

.recurso-nombre {
  font-size: 13.5px;
  color: #344054;
  font-weight: 500;
}

.detalle-empty {
  font-size: 13px;
  color: #98a2b3;
  padding: 8px 0;
}
</style>
