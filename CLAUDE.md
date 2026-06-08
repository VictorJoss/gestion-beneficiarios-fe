# 🤖 Claude Code Agent Guidelines - gestion-beneficiarios-fe

Este documento establece las directrices para que los agentes de coding (como Claude Code) generen código consistente, mantenible y alineado con la arquitectura del proyecto. Seguir estas guidelines asegura reproducibilidad en el trabajo colaborativo.

## 🏗️ Principios Generales

1. **Consistencia sobre creatividad**: Prefiere patrones existentes antes de introducir nuevos enfoques
2. **Explícito sobre implícito**: El código debe ser auto-documentativo y evidente en su propósito
3. **Mantenibilidad primero**: Optimiza para lectura futura, no para escritura rápida
4. **Tipado estricto**: Nunca uses `any` sin justificación significativa y revisión

## 📁 Organización de Archivos

### Estructura de Directorios Obligatoria

```
src/
├── components/         # Componentes Vue reutilizables (PascalCase.vue)
├── composables/        # Funciones de composición (use*.ts)
├── services/           # Lógica de negocio y acceso a datos (*.ts)
├── types/              # Interfaces y tipos TypeScript (index.ts)
├── views/              # Páginas/vistas principales (*.vue)
├── router/             # Configuración de rutas (index.ts)
├── assets/             # Recursos estáticos
├── App.vue             # Componente raíz
├── main.ts             # Punto de entrada
└── config.ts           # Configuración global
```

### Reglas de Ubicación

- **Nunca** pongas lógica de negocio en componentes (`*.vue`)
- **Nunca** accedas directamente a `localStorage` fuera de servicios
- **Siempre** coloca tipos en `src/types/index.ts`
- **Siempre** exporta servicios como singleton: `export const serviceName = new ServiceClass()`
- **Siempre** nombra composables con prefix `use` (ej: `useAuth.ts`, `usePermissions.ts`)

## 🏷️ Convenciones de Nomenclatura

### Archivos
- Componentes: `PascalCase.vue` (ej: `UserProfile.vue`)
- Composables: `useCamelCase.ts` (ej: `useAuth.ts`)
- Servicios: `camelCase.ts` (ej: `auth.ts`, `familia.ts`)
- Tipos: Siempre en `src/types/index.ts`
- Configuración: `config.ts`, `constants.ts`

### Variables y Funciones
- Variables: `camelCase`
- Funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE` (ej: `API_URL`, `TOKEN_KEY`)
- Clases: `PascalCase` (ej: `AuthService`, `FamiliaService`)
- Interfaces: `PascalCase` (sin prefix `I`)

### Eventos y Props Vue
- Props: `camelCase` en JS, `kebab-case` en template
- Eventos: `kebab-case` emitidos, `camelCase` escuchados (`@update-model` → `updateModel`)
- Emits: Siempre declarar en `defineProps` y `defineEmits`

## 🔧 Patrones Obligatorios

### 1. Servicio + Composable (Pattern Principal)
Siempre sigue esta estructura para lógica que involucre estado reactivo y llamadas API:

```vue
<!-- Componente.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { someService } from '@/services/someService'
import { useSomeComposable } from '@/composables/useSomeComposable'

const { data, loading, error } = useSomeComposable()
</script>
```

```typescript
// composables/useSomeComposable.ts
import { ref } from 'vue'
import { someService } from '@/services/someService'

export function useSomeComposable() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref('')

  const loadData = async () => {
    loading.value = true
    try {
      data.value = await someService.getData()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, loadData }
}
```

```typescript
// services/someService.ts
import api from './api'
import type { SomeResponse } from '@/types'

export class SomeService {
  async getData(): Promise<SomeResponse> {
    const response = await api.get<SomeResponse>('/endpoint')
    return response.data
  }
}

export const someService = new SomeService()
```

### 2. Manejo de Errores
- **Servicios**: Lanza errores con mensajes descriptivos, nunca los silencies
- **Composables**: Mantén estado `error: ref<string>` y `isLoading: ref<boolean>`
- **Componentes**: Muestra errores en UI, nunca solo en consola (excepto en desarrollo)

### 3. Tipado TypeScript
- **Siempre** especifica tipos de retorno en funciones
- **Nunca** uses `: any` sin comentario de justificación
- **Siempre** define interfaces para objetos complejos
- **Usa** tipos de unión para estados limitados (roles, estados)

```typescript
// ✅ Correcto
async function fetchData(): Promise<User[]> {
  const response = await api.get<User[]>('/users')
  return response.data
}

// ❌ Incorrecto
async function fetchData() {
  const response = await api.get('/users')
  return response.data // any
}
```

### 4. Rutas y Protección
- **Siempre** define `meta: { requiresAuth: boolean }` en rutas protegidas
- **Nunca** dupliques lógica de autenticación en componentes
- **Usa** el composable `useAuth()` para verificar estado de autenticación

## 🧪 Calidad de Código

### Requisitos Mínimos
1. **Ninguna** variable sin usar
2. **Ninguna** función vacía sin comentario `// TODO`
3. **Siempre** maneja casos de error en promesas
4. **Nunca** dejar `console.log` en código de producción (usar logger si se implementa)
5. **Siempre** exportar lo que se importa en archivos de tipo barrel

### Revisiones Requeridas Antes de Commit
- [ ] ¿El código sigue la estructura de carpetas correcta?
- [ ] ¿Se usan los patrones establecidos (Service+Composable)?
- [ ] ¿Todo está tipado correctamente?
- [ ] ¿Los nombres siguen las convenciones?
- [ ] ¿Se maneja el estado de carga y error apropiadamente?
- [ ] ¿Se evita la duplicación de lógica?

## 📝 Commits y Documentación

### Mensajes de Commit
Usa formato convencional:
```
tipo(alcance): descripción

[cuerpo opcional]

[pie opcional]
```

Tipos permitidos:
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, espacios, etc.
- `refactor`: Refactorización de código
- `test`: Agregando pruebas
- `chore`: Tareas de mantenimiento

Ejemplo bueno:
```
feat(auth): agregar refresh token automático

- Implementar lógica de refresco silencioso en useAuth
- Actualizar interceptor de API para manejar 401
- Añadir tests unitarios para el flujo de refresh
```

### Documentación en Código
- **Siempre** documenta lógica no-obvia con comentarios
- **Nunca** documenta lo evidente (`// incrementa contador` sobre `counter++`)
- Usa JSDoc para funciones públicas complejas
- Mantén actualizado `README.md` y `ARQUITECTURA.md` con cambios significativos

## 🚫 Prohibiciones Estrictas

1. **Nunca** modificar `localStorage` fuera de servicios de autenticación
2. **Nunca** duplicar tipos que ya existen en `src/types/index.ts`
3. **Nunca** llamar directamente a `api.get/post` desde componentes
4. **Nunca** usar `!` (non-null assertion) sin justificación crítica
5. **Nunca** dejar código comentado en commits finales
6. **Nunca** introducir nuevas capas de abstracción sin discutir primero

## 🎨 Estilos y Diseño Guidelines

Dado que múltiples desarrolladores no especializados en frontend usarán agentes de coding, estas reglas evitan que el CSS se vuelva inconsistente, difícil de mantener o que rompa el diseño.

### 📋 Principios Básicos de CSS

1. **Scoped CSS obligatorio**: Todos los componentes `.vue` **deben** usar `<style scoped>` excepto para variables globales o temas
2. **Utility-first sobre CSS custom**: Preferir clases de utilidad existentes antes de escribir CSS custom
3. **BEM Lite para componentes**: Usar bloque__elemento--modificador cuando se necesite CSS custom significativo
4. **Nunca estilos en línea**: Excepto para valores dinámicos calculados (ej: `:style="{ width: width+'px' }"`)

### 🏗️ Estructura de Archivos de Estilos

```
/src/
├── assets/
│   └── styles.css          # Solo: variables globales, resets, utilities basicas
├── components/
│   ├── UserCard.vue        # Cada componente tiene su propio <style scoped>
│   └── Button.vue
└── App.vue                 # Estilos globales mínimos si son absolutamente necesarios
```

### ✅ Qué Hacer (Do's)

#### Variables y Temas
- **Definir** variables CSS en `:root` dentro de `assets/styles.css` para:
  ```css
  :root {
    --color-primary: #2563eb;
    --color-secondary: #64748b;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
  }
  ```
- **Usar** `var(--variable-name)` en lugar de valores hardcodeados
- **Mantener** una paleta de colores limitada (máximo 5 colores primarios + neutros)

#### Componentes Vue
- **Siempre** usar `<style scoped>` en componentes `.vue`
- **Organizar** el estilo de esta manera:
  ```vue
  <template>
    <!-- template content -->
  </template>

  <script setup>
    <!-- logic -->
  </script>

  <style scoped>
    /* 1. Variables locales del componente (si es necesario) */
    :scope {
      --card-hover-bg: #f8fafc;
    }

    /* 2. Estructura base del componente */
    .component-name {
      /* estilos estructurales */
    }

    /* 3. Estados y variantes */
    .component-name--variant {
      /* modificadores */
    }

    /* 4. Responsivo básico */
    @media (max-width: 640px) {
      .component-name {
        /* ajustes móviles */
      }
    }
  </style>
  ```

#### Nombramiento de Clases
- **Usar** kebab-case para todas las clases CSS: `user-profile-card`, `btn-primary`
- **Para componentes complejos**: `nombre-componente__elemento--estado`
  Ejemplo: `user-card__avatar--loading`
- **Nunca** usar IDs en CSS (`#id` es prohibido)
- **Evitar** selectores de tipo (`button`, `div`) dentro de componentes scoped

#### Utilidades y Espaciado
- **Usar** el sistema de espaciado basado en variables:
  ```css
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  ```
- **Definir** un máximo de 4 tamaños de espaciado en variables:
  --spacing-xs: 0.25rem
  --spacing-sm: 0.5rem
  --spacing-md: 1rem
  --spacing-lg: 1.5rem
- **Para tipografía**: Usar `rem` o unidades relativas, nunca `px` para fuentes

#### Animaciones y Transiciones
- **Limitar** duración de transiciones a 150ms-300ms
- **Usar** curvas de easing estándar: `ease-in-out`, `linear`
- **Nunca** animar propiedades que déclenen layout (width, height, top, left) - usar transform/opacity
- **Definir** animaciones comunes en `assets/styles.css` si se reutilizan

### ❌ Qué NO Hacer (Don'ts)

#### Selectores y Especificidad
- **NO** usar selectores anidados profundos: `.container .row .col .btn` → máximo 2 niveles
- **NO** usar `!important` excepto para utilidades de ayuda (ej: `.text-center!` se evita, mejor usar clases específicas)
- **NO** sobrescribir estilos de componentes hijos desde padres (rompe el encapsulamiento)
- **NO** usar selectores de atributo complejos como `[class*="btn"]`

#### Valores Hardcodeados
- **NO** usar valores mágicos de color: `color: #3b82f6;` → usar `var(--color-primary)`
- **NO** usar pixeles para espaciado cuando se puede usar variables: `margin: 16px;` → `margin: var(--spacing-md)`
- **NO** duplicar definiciones de color/tamaño en múltiples componentes

#### Responsive Design
- **NO** escribir media queries más de 2 veces por componente
- **NO** usar puntos de ruptura arbitrarios - usar los definidos globalmente:
  ```css
  /* En assets/styles.css */
  :root {
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
  }
  ```
- **Siempre** probar en móvil primero (mobile-first approach)

#### Antipatrones Comunes
- **NO** copiar CSS de internet sin adaptarlo al sistema de variables
- **NO** crear clases genéricas como `.big-text`, `.red-button` - ser específico: `.user-card__title`, `.submit-button--primary`
- **NO** dejar estilos sin usar - eliminar regularmente
- **NO** usar `!important` para resolver problemas de especificidad - reestructurar el CSS en su lugar

### 🔍 Verificación de Estilos Antes de Commit

Antes de considerar un cambio de estilo completo, verificar:

- [ ] ¿Todos los componentes usan `<style scoped>` correctamente?
- [ ] ¿Se están usando variables CSS para colores, espaciado y radios?
- [ ] ¿Hay algún valor hardcodeado que debería ser una variable?
- [ ] ¿Se sigue la convención de nombramiento kebab-case?
- [ ] ¿Hay selectores con especificidad excesiva (> 3 niveles)?
- [ ] ¿Se están usando utilidades existentes antes de crear CSS custom?
- [ ] ¿Las animaciones respetan las duraciones límites?
- [ ] ¿El componente se ve razonable en móviles sin media query explícita?
- [ ] ¿Hay algún `!important` que no esté justificado?

### 💡 Ejemplos Prácticos

#### ✅ Bueno - Componente con estilos consistentes
```vue
<template>
  <div class="user-card">
    <div class="user-card__header">
      <h2 class="user-card__title">{{ user.nombre }}</h2>
      <span class="user-card__status status--active">Activo</span>
    </div>
    <div class="user-card__content">
      <p>{{ user.descripcion }}</p>
    </div>
  </div>
</template>

<script setup>
// lógica
</script>

<style scoped>
.user-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow var(--duration-fast) ease-in-out;
}

.user-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.user-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status--active {
  background: var(--color-success-light);
  color: var(--color-success);
}

/* Responsive mínimo */
@media (max-width: 640px) {
  .user-card {
    padding: var(--spacing-sm);
  }
  
  .user-card__title {
    font-size: 1rem;
  }
}
</style>
```

#### ❌ Malo - Estilos que rompen las guidelines
```vue
<template>
  <div>
    <h2 style="color: #3b82f6; font-size: 24px;">Título</h2>
    <div class="custom-container">
      <p style="margin-top: 20px; line-height: 1.5;">Contenido</p>
    </div>
  </div>
</template>

<style scoped>
/* Error: No está scoped, afecta globalmente */
.custom-container {
  background: #f0f0f0; /* Error: valor hardcodeado */
  padding: 20px !important; /* Error: !important innecesario */
  /* Error: selector demasiado específico */
  div.custom-container p:nth-child(2) {
    color: red;
  }
}
</style>
```

---

*Estas guidelines de estilo están diseñadas para ser seguidas por desarrolladores no especializados en frontend cuando usan agentes de coding. El objetivo es mantener un CSS predecible, mantenible y consistente sin requerir conocimiento profundo de CSS.*

## 🔍 Verificación Automática

Antes de considerar una tarea completa, el agente debe verificar:
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run type-check` no muestra errores de TypeScript
- [ ] El código sigue los patrones del proyecto existentes
- [ ] Se han actualizado los documentos relevantes si es necesario

## 💡 Preguntas que el Agente debe Hacerse

1. ¿Este cambio encaja en la capa correcta (vista, composable, servicio, tipo)?
2. ¿Existe ya un patrón similar que deba seguir?
3. ¿He considerado todos los casos de error?
4. ¿Mi código agrega complejidad innecesaria?
5. ¿Otro miembro del equipo podrá entender esto rápidamente?
6. ¿He seguido la Guía de Estructura existente en ARQUITECTURA.md?

---

*Estas guidelines evolucionarán con el proyecto. Antes de hacer cambios significativos a estas directrices, consultar con el equipo.*