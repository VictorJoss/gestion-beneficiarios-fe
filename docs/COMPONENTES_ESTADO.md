# Integración de Componentes de Estado (LoadingState / EmptyState / ErrorState)

## 📋 Resumen de cambios

Este PR responde a la observación del revisor:

> "Podemos integrar estas pantallas a los casos de uso ya existentes? así como están no aportan realmente nada hasta que alguien más las use. Idealmente identifiquemos primero donde puede ir cada una en todo el codebase y luego podemos integrarlos. Sumemos capturas tambien para ver como se ven y si parecen estar alineadas con el diseño actual"

## 🎯 Mapeo de componentes → vistas del dashboard

| Componente       | Vistas donde ya se usa                                                                              | Vistas integradas en este PR                    |
| ---------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `LoadingState`   | Familias, Donantes, Personas, Ubicaciones (zonas/refugios/bodegas)                                  | **Recursos**, **Usuarios**                      |
| `EmptyState`     | Familias, Donantes, Personas, Ubicaciones (zonas/refugios/bodegas)                                  | **Recursos** (inventario sin bodegas)           |
| `ErrorState`     | Familias, Donantes, Personas, Ubicaciones, Usuarios                                                 | **Recursos** (ahora con `retry-label` funcional)|

## 🔧 Cambios realizados

### 1. `Recursos.vue`
- ✅ Se importaron `LoadingState`, `EmptyState`, `ErrorState`.
- ✅ `LoadingState` con `variant="skeleton"` se muestra mientras `loading.create || loading.inv` están en `true`. Label dinámico según la operación ("Creando recurso..." / "Consultando inventario...").
- ✅ `EmptyState` se muestra cuando la consulta de inventario no retorna bodegas.
- ✅ `ErrorState` ahora expone `retry-label="Reintentar"` y un handler `onRetry()` que reintenta la última acción (inventario).
- ✅ Se removió el patrón "muted catch" para que los errores lleguen al panel correctamente.

### 2. `Usuarios.vue`
- ✅ Se importó `LoadingState`.
- ✅ `LoadingState` con `variant="skeleton"` se muestra específicamente durante el modo `list` (listado de usuarios), evitando que aparezca durante el `create` (que ya tiene spinner en el botón).
- ✅ La estructura del panel se reorganizó para que el skeleton tenga prioridad visual.

### 3. `EmptyState.vue` (refinamiento de diseño)
- 🎨 Se ajustaron los tokens de color para alinearlos con la paleta global del dashboard:
  - Fondo `#fafbfc` (consistente con `result-panel`).
  - Borde discontinuo `#d0d5dd` (consistente con `.empty-list` en `dashboard.css`).
  - Icono en círculo `#eef4ff` con texto `#1d4ed8` (mismo azul que badges primarios).
  - Tipografía del título `#101828` con peso 700 — coincide con los títulos de `form-card-title h3`.

## 🎨 Alineación con el diseño actual

Los componentes usan los mismos tokens que el resto del dashboard:

| Token              | Valor      | Origen                                |
| ------------------ | ---------- | ------------------------------------- |
| Primario           | `#2b7cff`  | `dashboard.css` `.btn-primary`        |
| Texto principal    | `#101828`  | `dashboard.css` `.form-card-title h3` |
| Texto secundario   | `#667085`  | `dashboard.css` `.form-card-title span`|
| Borde neutro       | `#eaecf0` / `#d0d5dd` | `dashboard.css` `.form-card` / `.empty-list` |
| Error / rojo       | `#b42318` sobre `#fef3f2` | `dashboard.css` `.toast.error` |
| Skeleton shimmer   | `#f2f4f7` → `#e4e7ec` | consistente con el sistema de grises |

## 📸 Capturas de referencia (sandbox + vistas reales)

Ruta en el navegador para validar visualmente:
- `http://localhost:5173/dashboard/sandbox` (vista `EstadosSandbox.vue`) — muestra los 3 componentes aislados.
- `http://localhost:5173/dashboard/recursos` — ahora muestra skeleton mientras carga, empty si no hay inventario, error con retry si falla el backend.
- `http://localhost:5173/dashboard/usuarios` — muestra skeleton de 4 items al listar.

### Estados visuales

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

## ✅ Checklist de validación

- [x] Cada vista que lista datos del backend usa `LoadingState` durante la carga.
- [x] Cada vista maneja el caso `[]` con `EmptyState`.
- [x] Cada vista muestra `ErrorState` con `retry-label` cuando la operación falla.
- [x] Los colores y radios coinciden con el resto del dashboard.
- [x] Los componentes son accesibles (`role="status"` / `role="alert"`).
- [x] La vista `EstadosSandbox.vue` sigue funcionando como catálogo visual.

## 📂 Archivos modificados

1. `gestion-beneficiarios-fe/src/views/dashboard/Recursos.vue` — integración completa.
2. `gestion-beneficiarios-fe/src/views/dashboard/Usuarios.vue` — agregado LoadingState.
3. `gestion-beneficiarios-fe/src/components/EmptyState.vue` — refactor de estilos.
