# Componentes UI del Dashboard

Este documento describe los **componentes reutilizables** del frontend y dónde están integrados.

| Componente       | Archivo                                  | Vistas donde se usa                                                                              |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `LoadingState`   | `src/components/LoadingState.vue`        | Familias, Donantes, Personas, Ubicaciones, Recursos, Usuarios, Sandbox                          |
| `EmptyState`     | `src/components/EmptyState.vue`          | Familias, Donantes, Personas, Ubicaciones, Recursos, Sandbox                                     |
| `ErrorState`     | `src/components/ErrorState.vue`          | Familias, Donantes, Personas, Ubicaciones, Recursos, Usuarios, Sandbox                           |
| `Pagination`     | `src/components/Pagination.vue`          | Sandbox (aún no se ha integrado en vistas — listo para conectar a endpoints paginados)          |

---

## 1. LoadingState / EmptyState / ErrorState

### 📋 Resumen de cambios

Este PR responde a la observación del revisor:

> "Podemos integrar estas pantallas a los casos de uso ya existentes? así como están no aportan realmente nada hasta que alguien más las use. Idealmente identifiquemos primero donde puede ir cada una en todo el codebase y luego podemos integrarlos. Sumemos capturas tambien para ver como se ven y si parecen estar alineadas con el diseño actual"

### 🎯 Mapeo de componentes → vistas del dashboard

| Componente       | Vistas donde ya se usaba antes              | Vistas integradas en este PR                    |
| ---------------- | ------------------------------------------- | ----------------------------------------------- |
| `LoadingState`   | Familias, Donantes, Personas, Ubicaciones   | **Recursos**, **Usuarios**                      |
| `EmptyState`     | Familias, Donantes, Personas, Ubicaciones   | **Recursos** (inventario sin bodegas)           |
| `ErrorState`     | Familias, Donantes, Personas, Ubicaciones   | **Recursos** (ahora con `retry-label` funcional) y **Usuarios** (que ya lo tenía) |

### 🔧 Cambios realizados

#### a) `Recursos.vue`
- ✅ Se importaron `LoadingState`, `EmptyState`, `ErrorState`.
- ✅ `LoadingState` con `variant="skeleton"` se muestra mientras `loading.create || loading.inv` están en `true`. Label dinámico según la operación ("Creando recurso..." / "Consultando inventario...").
- ✅ `EmptyState` se muestra cuando la consulta de inventario no retorna bodegas.
- ✅ `ErrorState` ahora expone `retry-label="Reintentar"` y un handler `onRetry()` que reintenta la última acción (inventario).
- ✅ Se removió el patrón "muted catch" para que los errores lleguen al panel correctamente.

#### b) `Usuarios.vue`
- ✅ Se importó `LoadingState`.
- ✅ `LoadingState` con `variant="skeleton"` se muestra específicamente durante el modo `list` (listado de usuarios), evitando que aparezca durante el `create` (que ya tiene spinner en el botón).
- ✅ La estructura del panel se reorganizó para que el skeleton tenga prioridad visual.

#### c) `EmptyState.vue` (refinamiento de diseño)
- 🎨 Se ajustaron los tokens de color para alinearlos con la paleta global del dashboard:
  - Fondo `#fafbfc` (consistente con `result-panel`).
  - Borde discontinuo `#d0d5dd` (consistente con `.empty-list` en `dashboard.css`).
  - Icono en círculo `#eef4ff` con texto `#1d4ed8` (mismo azul que badges primarios).
  - Tipografía del título `#101828` con peso 700 — coincide con los títulos de `form-card-title h3`.

### 🎨 Alineación con el diseño actual

Los componentes usan los mismos tokens que el resto del dashboard:

| Token              | Valor      | Origen                                |
| ------------------ | ---------- | ------------------------------------- |
| Primario           | `#2b7cff`  | `dashboard.css` `.btn-primary`        |
| Texto principal    | `#101828`  | `dashboard.css` `.form-card-title h3` |
| Texto secundario   | `#667085`  | `dashboard.css` `.form-card-title span`|
| Borde neutro       | `#eaecf0` / `#d0d5dd` | `dashboard.css` `.form-card` / `.empty-list` |
| Error / rojo       | `#b42318` sobre `#fef3f2` | `dashboard.css` `.toast.error` |
| Skeleton shimmer   | `#f2f4f7` → `#e4e7ec` | consistente con el sistema de grises |

### 📸 Capturas de referencia

Ruta en el navegador para validar visualmente:
- `http://localhost:5173/dashboard/sandbox` — catálogo de los 4 componentes.
- `http://localhost:5173/dashboard/recursos` — skeleton al consultar, empty si no hay bodegas, error con retry.
- `http://localhost:5173/dashboard/usuarios` — skeleton de 4 items al listar.

### Estados visuales (ASCII mockups)

**LoadingState (skeleton)** — 4 items con avatar + 3 líneas de texto con efecto shimmer.
```
┌──────────────────────────────────────────┐
│ ▢  ████████████  ███████                 │
│     ████████████████████████             │
└──────────────────────────────────────────┘
```

**EmptyState** — tarjeta centrada con icono, título y mensaje.
```
┌──────────────────────────────────────────┐
│             ⊘ (azul)                     │
│         Sin usuarios registrados         │
│   Aún no se han creado usuarios en la    │
│            plataforma.                   │
└──────────────────────────────────────────┘
```

**ErrorState** — toast con borde rojo, ícono de alerta, mensaje y botón Reintentar.
```
┌──────────────────────────────────────────┐
│ ⚠ No se pudo completar la operación.     │
│   Error 500: ...               [Reintentar] │
└──────────────────────────────────────────┘
```

---

## 2. Pagination

### 🎯 Propósito

Componente reutilizable para paginación de listados. Diseñado para integrarse con cualquier vista del dashboard que liste datos del backend. Sigue la convención `v-model` (`update:currentPage`, `update:pageSize`) para una integración declarativa.

### 📦 Props

| Prop              | Tipo       | Default            | Descripción                                                                 |
| ----------------- | ---------- | ------------------ | --------------------------------------------------------------------------- |
| `currentPage`     | `Number`   | **requerido**      | Página actual (1-indexed).                                                  |
| `pageSize`        | `Number`   | `10`               | Tamaño de página.                                                           |
| `total`           | `Number`   | **requerido**      | Total de registros.                                                         |
| `siblingCount`    | `Number`   | `1`                | Cuántas páginas mostrar a cada lado de la actual antes de los `…`.         |
| `pageSizeOptions` | `Number[]` | `[10, 20, 50, 100]`| Opciones del selector "Por página". Pasar `[]` para ocultarlo.             |
| `showInfo`        | `Boolean`  | `true`             | Mostrar el texto "Mostrando X–Y de N registros".                            |
| `showAlways`      | `Boolean`  | `false`            | Mostrar la barra aunque haya una sola página (útil para mantener layout).  |
| `iconOnly`        | `Boolean`  | `false`            | Ocultar las etiquetas "Anterior"/"Siguiente" (solo flechas).                |
| `loading`         | `Boolean`  | `false`            | Deshabilita todos los controles (para evitar clicks durante la carga).     |
| `prevLabel`       | `String`   | `'Anterior'`       | Texto del botón anterior.                                                   |
| `nextLabel`       | `String`   | `'Siguiente'`      | Texto del botón siguiente.                                                  |
| `sizeLabel`       | `String`   | `'Por página'`     | Etiqueta del selector de tamaño.                                            |
| `itemLabel`       | `String`   | `'registro'`       | Sustantivo para "Mostrando X–Y de N registro(s)".                           |
| `ariaLabel`       | `String`   | `'Paginación'`     | `aria-label` del `<nav>`.                                                   |

### 📡 Emits

| Evento                    | Payload                          | Descripción                                       |
| ------------------------- | -------------------------------- | ------------------------------------------------- |
| `update:currentPage`      | `number`                         | Nueva página seleccionada.                        |
| `update:pageSize`         | `number`                         | Nuevo tamaño de página.                           |
| `change`                  | `{ page: number, pageSize: number }` | Se dispara en cualquier cambio (útil para `watch`). |

### 🧪 Ejemplo de uso

```vue
<template>
  <Pagination
    v-model:current-page="page"
    v-model:page-size="size"
    :total="total"
    :loading="isLoading"
    item-label="usuario"
    :page-size-options="[10, 25, 50]"
    @change="fetchUsers"
  />
</template>

<script lang="ts">
import { ref } from 'vue'
import Pagination from '@/components/Pagination.vue'

export default {
  components: { Pagination },
  setup() {
    const page = ref(1)
    const size = ref(10)
    const total = ref(0)
    const isLoading = ref(false)

    async function fetchUsers() {
      isLoading.value = true
      try {
        const res = await usersApi.list({ page: page.value, size: size.value })
        total.value = res.total
        // ...
      } finally {
        isLoading.value = false
      }
    }

    return { page, size, total, isLoading, fetchUsers }
  }
}
</script>
```

### 🎨 Alineación con el diseño

| Elemento        | Token            | Origen                            |
| --------------- | ---------------- | --------------------------------- |
| Fondo tarjeta   | `rgba(255,255,255,0.92)` + blur | igual que `result-panel` |
| Borde           | `#eaecf0`        | `dashboard.css`                   |
| Texto secundario| `#667085`        | `dashboard.css`                   |
| Número activo   | gradiente `#2b7cff` → `#5d8cff` | mismo que `.btn-primary` |
| Focus ring      | `0 0 0 4px rgba(43,124,255,0.14)` | mismo que `.input:focus` |
| Radio           | `10px`           | mismo que inputs y select         |
| Sombra          | `0 1px 2px rgba(16,24,40,0.04)` | mismo que `.item-card`      |

### 📸 Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│ Mostrando 21–30 de 237 registros    ‹ Ant.  1 … 11 12 13 … 24  Sig. ›   Por página [10 ▾] │
└─────────────────────────────────────────────────────────────────────┘
```

### ✅ Checklist de validación

- [x] Se renderiza correctamente con `totalPages <= 1` (oculto salvo `showAlways`).
- [x] Elipsis `…` aparecen solo cuando hay suficientes páginas.
- [x] Botones `Anterior`/`Siguiente` se deshabilitan en los extremos.
- [x] Selector de tamaño funciona y emite `update:pageSize` + `change`.
- [x] Estado `loading` deshabilita toda la barra.
- [x] `aria-current="page"` en la página activa.
- [x] `aria-label` en cada control para lectores de pantalla.
- [x] Responsive: en pantallas < 640px los labels se ocultan (`iconOnly` implícito).
- [x] 7 ejemplos de uso en `EstadosSandbox.vue` (secciones 6-12).

### 📂 Archivos

1. `gestion-beneficiarios-fe/src/components/Pagination.vue` — componente.
2. `gestion-beneficiarios-fe/src/views/dashboard/EstadosSandbox.vue` — ejemplos de uso.

### 🔌 Próximos pasos (no incluidos en este PR)

Cuando el backend exponga endpoints paginados (e.g. `GET /usuarios?page=N&size=M&total=true`), basta con:

```ts
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await userService.listPaged({ page: page.value, size: size.value })
    usuarios.value = res.items
    total.value = res.total
  } finally {
    isLoading.value = false
  }
}

watch([page, size], fetchUsers)
```

Y colocar `<Pagination>` debajo del listado de items en cada vista (`Familias.vue`, `Donantes.vue`, `Personas.vue`, `Ubicaciones.vue`, `Recursos.vue`, `Usuarios.vue`).

---

## 📂 Archivos modificados en este PR

1. `gestion-beneficiarios-fe/src/components/Pagination.vue` — **nuevo componente**.
2. `gestion-beneficiarios-fe/src/components/EmptyState.vue` — refactor de estilos.
3. `gestion-beneficiarios-fe/src/views/dashboard/Recursos.vue` — integración de los 3 componentes de estado.
4. `gestion-beneficiarios-fe/src/views/dashboard/Usuarios.vue` — agregado `LoadingState`.
5. `gestion-beneficiarios-fe/src/views/dashboard/EstadosSandbox.vue` — catálogo con 7 ejemplos de Pagination.
6. `gestion-beneficiarios-fe/docs/COMPONENTES_ESTADO.md` — este documento.
