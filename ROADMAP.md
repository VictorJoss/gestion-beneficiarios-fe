# Roadmap - Sistema de Gestión de Beneficiarios

> **Propósito**: Este documento cataloga TODO el trabajo pendiente para completar el frontend contra la API existente. Cada entrada especifica qué archivos crear/modificar, dependencias, permisos requeridos y el patrón a seguir.

---

## Convenciones del proyecto

- **Estilo de componentes**: Vue 3 Composition API via `defineComponent` + `setup()` (NO `<script setup>`)
- **Patrón**: Service → Composable → View (pero vistas simples pueden llamar services directo)
- **Servicios**: Ya existen en `src/services/` para casi todos los endpoints
- **Tipos**: Ya definidos en `src/types/index.ts`
- **Permisos**: `src/config/permissions.ts` (tipo `Accion`, función `puedeAccion()`)
- **Rutas**: `src/router/index.ts` (lazy-loaded, `meta.requiresAuth`)
- **Sidebar**: `src/components/Sidebar.vue` (filtra módulos por rol)
- **API base**: `BASE_URL = '/api'`, token JWT inyectado automáticamente

---

## FASE 0 — Prepel·la (tareas cortas de integración)

### 0.1 Conectar IndicadoresService en Inicio.vue
| Campo | Detalle |
|---|---|
| **Archivos** | `src/views/dashboard/Inicio.vue` |
| **Service** | `indicadoresService.obtenerPanel()` (ya existe) |
| **Endpoint** | `GET /indicadores/` |
| **Qué hacer** | Importar `indicadoresService`, llamar `obtenerPanel()` en `onMounted`, mostrar KPIs (total_familias, total_personas, entregas_mes, etc.) en tarjetas bajo el welcome. |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐ (~2h) |
| **Permisos** | No requiere nueva acción (visible para todos los autenticados) |

### 0.2 Botones de acción en Usuarios.vue (editar/desactivar/activar)
| Campo | Detalle |
|---|---|
| **Archivos** | `src/views/dashboard/Usuarios.vue` |
| **Services** | `userService.update`, `userService.deactivate`, `userService.activate` (ya existen) |
| **Endpoints** | `PUT /users/:id`, `DELETE /users/:id`, `POST /users/:id/activate` |
| **Qué hacer** | Agregar columna de acciones en la tabla: botón Editar (abre modal/form inline), botón Desactivar/Activar (toggle), con confirmación. |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐⭐ (~4h) |
| **Permisos** | `usuarios.crear` para editar/desactivar (solo ADMIN) |

### 0.3 Botones de acción en Personas.vue (editar/eliminar)
| Campo | Detalle |
|---|---|
| **Archivos** | `src/views/dashboard/Personas.vue` |
| **Services** | `personaService.update`, `personaService.delete` (ya existen) |
| **Endpoints** | `PUT /personas/:id`, `DELETE /personas/:id` |
| **Qué hacer** | Agregar columna de acciones: Editar (abre modal con formulario precargado), Eliminar (confirmación). |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐⭐ (~4h) |
| **Permisos** | `personas.crear` |

### 0.4 Botón "Calcular puntaje" en Familias.vue + detalle de familia
| Campo | Detalle |
|---|---|
| **Archivos** | `src/views/dashboard/Familias.vue` |
| **Services** | `familiaService.calcularPuntaje`, `familiaService.get`, `personaService.getByFamilia` (ya existen) |
| **Endpoints** | `POST /configuracion-puntaje/familias/:id/calcular-puntaje`, `GET /familias/:id`, `GET /personas/familias/:id/personas` |
| **Qué hacer** | Botón "Calcular puntaje" por fila; al hacer clic en una familia, mostrar detalle expandible con datos de la familia + lista de personas asociadas. |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐⭐ (~4h) |
| **Permisos** | `familias.listar` |

### 0.5 Configurar umbral de alerta en Recursos.vue
| Campo | Detalle |
|---|---|
| **Archivos** | `src/views/dashboard/Recursos.vue` |
| **Services** | `recursoService.updateUmbralAlerta` (ya existe) |
| **Endpoint** | `PATCH /recursos/:id/umbral-alerta` |
| **Qué hacer** | En la lista de recursos, agregar columna "Umbral" editable inline o botón "Configurar umbral". |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐ (~2h) |
| **Permisos** | `recursos.inventario` |

---

## FASE 1 — Módulos nuevos con service listo (sin nuevas dependencias externas)

### 1.1 Módulo: Entregas (registrar + listar + detalle)
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/Entregas.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services** | `entregaService.registrar`, `entregaService.get` (ya existen) |
| **Endpoints** | `POST /entregas/`, `GET /entregas/:id` |
| **Patrón** | Formulario de registro (familia + bodega + recursos + cantidades + firma digital + coordenadas) + listado de entregas + detalle expandible |
| **Dependencias** | FASE 0 completa (para consistencia) |
| **Esfuerzo** | ⭐⭐⭐⭐ (~16h) |
| **Permisos a agregar** | `entregas.registrar`, `entregas.listar` |
| **Roles** | OPERADOR_ENTREGAS (registrar), ADMIN/COORDINADOR_LOGISTICA (listar) |
| **Notas** | HU-12, HU-22, HU-23. Incluir selector de bodega, tabla dinámica de recursos con cantidad, campo de firma digital (texto/canvas) y coordenadas (geolocalización browser). |

### 1.2 Módulo: Alertas de Inventario
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/Alertas.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/components/Sidebar.vue` |
| **Services** | `inventarioService.obtenerAlertas` (ya existe) |
| **Endpoint** | `GET /inventario/alertas` |
| **Patrón** | Tabla/dashboard de alertas con filtro por bodega, código de color (rojo = crítica), badge de conteo en sidebar. |
| **Dependencias** | 0.5 (umbral de alerta configurable) |
| **Esfuerzo** | ⭐⭐ (~6h) |
| **Permisos a agregar** | `inventario.alertas` |
| **Roles** | COORDINADOR_LOGISTICA, ADMIN |

### 1.3 Módulo: Traslados de familias a refugios
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/Traslados.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services** | `trasladoService.trasladarFamilia` (ya existe) |
| **Endpoint** | `POST /traslados/` |
| **Patrón** | Formulario: selector de familia + selector de refugio destino (con capacidad actual vs máxima). Validación de capacidad. |
| **Dependencias** | 0.4 (detalle de familia) |
| **Esfuerzo** | ⭐⭐ (~6h) |
| **Permisos a agregar** | `traslados.realizar` |
| **Roles** | COORDINADOR_LOGISTICA, ADMIN |

### 1.4 Módulo: Planes de Distribución
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/PlanesDistribucion.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services** | `planDistribucionService.listar`, `planDistribucionService.get`, `planDistribucionService.generar` (ya existen) |
| **Endpoints** | `GET /planes-distribucion/`, `GET /planes-distribucion/:id`, `POST /planes-distribucion/generar` |
| **Patrón** | Lista de planes con estado, fecha y prioridad. Botón "Generar nuevo plan". Detalle expandible. |
| **Dependencias** | 1.1 (entregas) para entender el flujo completo distribución→entrega |
| **Esfuerzo** | ⭐⭐⭐ (~10h) |
| **Permisos a agregar** | `planes.listar`, `planes.generar` |
| **Roles** | COORDINADOR_LOGISTICA, ADMIN |

---

## FASE 2 — Módulos complejos (requieren librerías externas o lógica avanzada)

### 2.1 Módulo: Focos Sanitarios (CRUD + Mapa GeoJSON)
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/FocosSanitarios.vue`, opcional: `src/composables/useFocoSanitario.ts` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services** | `focoSanitarioService.*` (ya existe — crear, listar, get, actualizar, obtenerGeoJSON) |
| **Endpoints** | `GET/POST /focos-sanitarios/`, `GET/PATCH /focos-sanitarios/:id`, `GET /focos-sanitarios/mapa` |
| **Patrón** | Vista con pestañas o secciones: formulario de registro + tabla con filtros (estado, nivel_riesgo, zona) + mapa GeoJSON interactivo. |
| **Nueva dependencia** | Librería de mapas: `leaflet` + `@types/leaflet` (npm install) |
| **Dependencias** | FASE 1 completa |
| **Esfuerzo** | ⭐⭐⭐⭐ (~20h) |
| **Permisos a agregar** | `focos.crear`, `focos.listar`, `focos.actualizar` |
| **Roles** | ADMIN, CENSADOR (crear), FUNCIONARIO_CONTROL (listar/actualizar) |
| **Notas** | HU-25, HU-26. El mapa renderiza puntos con color según estado y permite filtrar. |

### 2.2 Módulo: Mapa geográfico unificado (Dashboard Visual)
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/Mapa.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services** | `mapaService.obtenerResumen` (ya existe) |
| **Endpoint** | `GET /mapa/resumen` |
| **Patrón** | Mapa interactivo con marcadores por tipo (refugio, bodega, entrega). Filtro por zona. Popups informativos. |
| **Nueva dependencia** | `leaflet` (compartida con 2.1) |
| **Dependencias** | 2.1 (infraestructura de mapas) |
| **Esfuerzo** | ⭐⭐⭐ (~12h) |
| **Permisos a agregar** | `mapa.ver` |
| **Roles** | Todos los roles autenticados |

### 2.3 Módulo: Reportes
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/Reportes.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/components/Sidebar.vue` |
| **Services** | `reportesService.zonasSinEntregas` (ya existe) |
| **Endpoint** | `GET /reportes/zonas-sin-entregas` |
| **Patrón** | Panel con cards de reporte (inicialmente solo "Zonas sin entregas"). Cada reporte muestra resultados en tabla con opción de exportar. |
| **Nuevas dependencias** | Opcional: librería para exportar CSV/PDF (`papaparse`, `jspdf`) |
| **Dependencias** | FASE 1 completa |
| **Esfuerzo** | ⭐⭐ (~6h) |
| **Permisos a agregar** | `reportes.ver` |
| **Roles** | ADMIN, COORDINADOR_LOGISTICA, FUNCIONARIO_CONTROL |

---

## FASE 3 — Funcionalidades administrativas

### 3.1 Configuración de Puntaje (admin)
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/ConfiguracionPuntaje.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services a crear** | `src/services/configuracion.ts` con clase `ConfiguracionPuntajeService` |
| **Endpoints** | `GET /configuracion-puntaje/`, `PUT /configuracion-puntaje/:clave` |
| **Qué hacer** | Tabla de configuraciones (clave, valor, descripción) con edición inline. |
| **Dependencias** | FASE 1, 0.4 |
| **Esfuerzo** | ⭐⭐ (~6h) |
| **Permisos a agregar** | `configuracion.ver`, `configuracion.editar` |
| **Roles** | Solo ADMIN |

### 3.2 Audit Logs (solo visualización)
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/views/dashboard/AuditLogs.vue` |
| **Archivos a modificar** | `src/router/index.ts`, `src/config/permissions.ts`, `src/components/Sidebar.vue` |
| **Services a crear** | `src/services/audit.ts` con clase `AuditService` |
| **Endpoint** | `GET /audit-logs/?method=&status_code=&limit=&offset=` |
| **Qué hacer** | Tabla paginada de logs con filtros por método HTTP, status code. |
| **Dependencias** | Ninguna |
| **Esfuerzo** | ⭐⭐ (~6h) |
| **Permisos a agregar** | `audit.ver` |
| **Roles** | Solo ADMIN |

---

## FASE 4 — Mejoras transversales (aplican a todas las vistas)

### 4.1 Paginación en listas
| Campo | Detalle |
|---|---|
| **Archivos** | Todas las vistas con listas: Usuarios, Familias, Personas, más las nuevas |
| **Qué hacer** | Agregar componente `Pagination.vue` reutilizable. Modificar services para aceptar `skip`/`limit` (ya existen en algunos). |
| **Dependencias** | FASE 0 |
| **Esfuerzo** | ⭐⭐⭐ (variable ~2h c/view) |
| **Notas** | Puede hacerse como componente compartido en `src/components/Pagination.vue` |

### 4.2 Búsqueda y filtros
| Campo | Detalle |
|---|---|
| **Archivos** | Todas las vistas con listas |
| **Qué hacer** | Input de búsqueda + selects de filtro arriba de cada tabla. Debounce en búsqueda. |
| **Dependencias** | FASE 0, 4.1 (idealmente después de paginación) |
| **Esfuerzo** | ⭐⭐ (~2h c/view) |

### 4.3 Estados consistentes (carga / error / vacío / éxito)
| Campo | Detalle |
|---|---|
| **Archivos** | Todas las vistas |
| **Qué hacer** | Crear componentes `LoadingState.vue`, `EmptyState.vue`, `ErrorState.vue`. Refactorizar todas las vistas para usarlos. |
| **Dependencias** | Transversal (se puede hacer en paralelo con FASE 1-3) |
| **Esfuerzo** | ⭐⭐ (~4h componente + ~1h c/view) |

### 4.4 Modal de confirmación genérico
| Campo | Detalle |
|---|---|
| **Archivos a crear** | `src/components/ConfirmDialog.vue` |
| **Qué hacer** | Modal reutilizable para confirmar eliminaciones/desactivaciones. Slots para título, descripción, botones. |
| **Dependencias** | Transversal |
| **Esfuerzo** | ⭐ (~2h) |

---

## Resumen de permisos nuevos a agregar en `permissions.ts`

| Acción | Módulo | ADMIN | CENSADOR | OP.ENTREGAS | COORD.LOG | FUNC.CONTROL | REG.DONACIONES |
|---|---|---|---|---|---|---|---|
| `entregas.registrar` | entregas | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `entregas.listar` | entregas | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `inventario.alertas` | alertas | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `traslados.realizar` | traslados | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `planes.listar` | planes | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `planes.generar` | planes | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `focos.crear` | focos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `focos.listar` | focos | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `focos.actualizar` | focos | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `mapa.ver` | mapa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `reportes.ver` | reportes | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `configuracion.ver` | config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `configuracion.editar` | config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit.ver` | audit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Mapa de dependencias entre fases

```
FASE 0 (Quick wins)
  │
  ├── 0.5 Umbral alerta ─────────┐
  │                              ▼
  ├── 0.4 Calcular puntaje ──► FASE 1
  │                              │
  │                              ├── 1.1 Entregas ◄────── 0.5
  │                              ├── 1.2 Alertas ◄────── 0.5
  │                              ├── 1.3 Traslados ◄──── 0.4
  │                              └── 1.4 Planes ◄─────── 1.1
  │                              │
  │                              ▼
  │                          FASE 2 (Complejos)
  │                              │
  │                              ├── 2.1 Focos Sanitarios (Leaflet)
  │                              ├── 2.2 Mapa Unificado ◄── 2.1
  │                              └── 2.3 Reportes
  │                              │
  │                              ▼
  │                          FASE 3 (Admin)
  │                              │
  │                              ├── 3.1 Config. Puntaje ◄── 0.4
  │                              └── 3.2 Audit Logs
  │
  └── FASE 4 (Transversal) ──► Puede empezar en paralelo desde FASE 0
```

## Plantilla para crear un nuevo módulo

Cada módulo nuevo sigue esta estructura:

```
src/
├── views/dashboard/NuevoModulo.vue    # Vista principal
├── services/                          # Service (existe o se crea)
├── types/index.ts                     # Tipos (existen o se agregan)
├── router/index.ts                    # +1 ruta hija en /dashboard
├── config/permissions.ts              # +N acciones
├── components/Sidebar.vue             # +1 entrada en sidebar
└── views/dashboard/Inicio.vue         # +1 shortcut (opcional)
```

**Flujo de implementación recomendado por módulo:**
1. Verificar/crear tipos en `types/index.ts`
2. Verificar/crear service en `services/`
3. Registrar ruta en `router/index.ts`
4. Agregar permisos en `config/permissions.ts`
5. Agregar entrada en `Sidebar.vue`
6. Crear vista en `views/dashboard/`
7. Opcional: crear composable si la lógica es compleja
8. Opcional: agregar shortcut en `Inicio.vue`
