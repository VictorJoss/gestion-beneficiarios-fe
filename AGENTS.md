# Project Guidelines — gestion-beneficiarios-fe

Agent-agnostic guidelines for AI coding assistants. Works with Claude Code, opencode, Cursor, GitHub Copilot, or any LLM-based coding tool.

---

## Principles

1. Prefer existing patterns over new approaches
2. Code must be self-documenting in purpose
3. Optimize for future reading, not fast writing
4. Strict typing — no `any` without justification
5. Service + Composable pattern for reactive logic + API calls

---

## Directory Structure

```
src/
├── components/         # Reusable Vue components (PascalCase.vue)
├── composables/        # Composition functions (use*.ts)
├── services/           # Business logic + data access (*.ts)
├── types/              # Interfaces and types (index.ts)
├── views/              # Page-level views (*.vue)
│   └── dashboard/      # Dashboard sub-views
├── router/             # Route config (index.ts)
├── assets/             # Static resources, global styles
├── App.vue             # Root component
├── main.ts             # Entry point
└── config/             # Global config (permissions.ts, etc.)
```

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase.vue | `UserProfile.vue` |
| Composables | useCamelCase.ts | `useAuth.ts` |
| Services | camelCase.ts | `auth.ts`, `familia.ts` |
| Types | index.ts (barrel) | `src/types/index.ts` |
| Variables | camelCase | `userName` |
| Functions | camelCase | `fetchData()` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_KEY` |
| Classes | PascalCase | `AuthService` |
| Interfaces | PascalCase (no I prefix) | `UserResponse` |
| CSS classes | kebab-case | `user-card`, `btn-primary` |
| Vue emits | kebab-case in template | `@update-model` |

---

## Patterns

### Service + Composable (Primary Pattern)

```
View (*.vue)  -->  Composable (use*.ts)  -->  Service (*.ts)  -->  API
```

**Service** — class with methods, exported as singleton:
```typescript
// services/familia.ts
import api from './api'
import type { Familia } from '@/types'

export class FamiliaService {
  async list(): Promise<Familia[]> {
    const r = await api.get<Familia[]>('/familias')
    return r.data
  }
  async create(data: Partial<Familia>): Promise<Familia> {
    const r = await api.post<Familia>('/familias', data)
    return r.data
  }
}
export const familiaService = new FamiliaService()
```

**Composable** (optional, for shared reactive state):
```typescript
// composables/useFamilias.ts
import { ref } from 'vue'
import { familiaService } from '@/services/familia'

export function useFamilias() {
  const list = ref<Familia[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() { /* ... */ }
  async function create(data: Partial<Familia>) { /* ... */ }

  return { list, loading, error, load, create }
}
```

**View** — either `<script setup>` or `defineComponent() + setup()`:
```vue
<script setup>
import { onMounted } from 'vue'
import { familiaService } from '@/services/familia'
import { usePermissions } from '@/composables/usePermissions'
const { puedeAccion } = usePermissions()
</script>
```

### Auto-load Lists with Skeleton

Every list view should auto-load on mount. No manual "Listar" buttons.

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { donanteService } from '@/services/ubicaciones'

const items = ref<any[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    items.value = await donanteService.list()
  } catch { /* silent */ }
  finally { isLoading.value = false }
})
</script>

<template>
  <div v-if="isLoading" class="item-list">
    <div v-for="n in 4" :key="n" class="skeleton-item">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-line w-40"></div>
      </div>
    </div>
  </div>
  <ul v-else-if="items.length" class="item-list">...</ul>
  <div v-else class="empty-list">...</div>
</template>
```

### Picker Selects over Raw IDs

Replace number inputs for foreign keys with `<select>` loading from the API:

```vue
<script setup>
import { ref, onMounted } from 'vue'
const zonas = ref([])
onMounted(async () => {
  zonas.value = await zonaService.list()
})
</script>

<template>
  <select v-model="form.zona_id" class="select">
    <option :value="null">Sin zona</option>
    <option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">
      {{ z.nombre }}
    </option>
  </select>
</template>
```

### View Layout Structure

```
.dash-page
  .cards-grid           # Create/action forms (auto-fit grid)
    .form-card          # Each form in its own card
  .result-panel         # List / result display
    .result-head        # Title + count + close/reload
      .result-head-info
    .item-list          # Card-based item list
      .item-card        # Each item
        .item-avatar    # Icon with color variant
        .item-content   # Name, subtitle, badges
        .item-actions   # ID badge, actions
    .empty-list         # No-data state
    .toast.error        # Error display
```

---

## Error Handling

- **Services**: Throw descriptive errors, never silence
- **Composables**: Maintain `error: ref<string>` and `isLoading: ref<boolean>`
- **Views**: Show errors in UI (not console), using `.toast.error` class
- **Don't** catch errors silently in views (use catch-and-show pattern)

```typescript
// Standard extractError helper
const extractError = (err: any): string => {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
  return err?.message || 'Error desconocido'
}
```

---

## Permissions

Use `usePermissions()` composable:
```typescript
const { puedeAccion } = usePermissions()
// Guard sections:
v-if="puedeAccion('familias.crear')"
// Available actions defined in src/config/permissions.ts
```

---

## CSS / Styling

- **Always** `<style scoped>` on components
- Use CSS variables from `assets/dashboard.css` (--color-primary, --spacing-md, --radius-md, etc.)
- kebab-case class names
- **Never** inline styles except dynamic computed values
- **Never** use `!important`
- **Never** use IDs as selectors
- Max 2 levels of selector nesting
- Transitions: 150-300ms, ease-in-out
- Prefer `transform`/`opacity` for animations (not layout properties)
- Mobile-first: test on small screens

---

## TypeScript

- Always specify return types on functions
- No `any` without a comment justifying it
- Define interfaces in `src/types/index.ts`
- Use union types for limited states (roles, statuses)
- Use `type` imports:

```typescript
import type { Familia, Zona } from '@/types'
```

---

## Prohibitions

1. No direct `localStorage` access outside auth services
2. No duplicate types (define once in `src/types/index.ts`)
3. No direct `api.get/post` from components (use services)
4. No `!` non-null assertion without critical justification
5. No commented-out code in commits
6. No new abstraction layers without discussion
7. No `console.log` in committed code
8. No `any` without justification comment

---

## Verification Before Completion

Run these and confirm no errors:

```
pnpm run build
```

Type checking (if available):
```
npx vue-tsc --noEmit
```

Linting (if available):
```
pnpm run lint
```

---

## Commit Messages

```
tipo(alcance): descripción en español

Tipos: feat, fix, docs, style, refactor, test, chore
```

Example:
```
feat(ubicaciones): auto-load zonas/refugios/bodegas with skeleton
```

---

## Project Context Summary

- **Framework**: Vue 3 Composition API + TypeScript
- **Build**: Vite + pnpm
- **Auth**: JWT via axios interceptor (src/services/api.ts)
- **API base**: `/api`
- **Services path**: `src/services/` (familia, personas, ubicaciones, users, operaciones, auth)
- **Types**: `src/types/index.ts`
- **Auth model**: Login → dashboard, JWT stored in localStorage by auth service
- **Permissions**: `src/config/permissions.ts` — action-based (`Accion` type)
- **Global styles**: `src/assets/dashboard.css` (includes skeleton classes, card styles, form styles)

### Views implemented

| View | Route | Key features |
|------|-------|-------------|
| Familias | /dashboard/familias | CRUD, zone picker, auto-list + skeleton |
| Personas | /dashboard/personas | CRUD, family picker, auto-list + skeleton |
| Ubicaciones | /dashboard/ubicaciones | Zonas + Refugios + Bodegas CRUD, auto-list sections + skeleton |
| Usuarios | /dashboard/usuarios | User CRUD with admin toggle |
| Recursos | /dashboard/recursos | Resource CRUD, inventory query with bodega picker |
| Donantes | /dashboard/donantes | Donor CRUD, auto-list + skeleton |

### API endpoints mapped (~40)

See ROADMAP.md for full endpoint-to-view mapping.
