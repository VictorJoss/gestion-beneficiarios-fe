<template>
  <nav v-if="totalPages > 1 || showAlways" class="pagination" role="navigation" :aria-label="ariaLabel">
    <div class="pagination-info" v-if="showInfo">
      <span class="pagination-range">
        Mostrando <strong>{{ rangeStart }}</strong>–<strong>{{ rangeEnd }}</strong>
        de <strong>{{ total }}</strong> {{ itemLabel }}{{ total === 1 ? '' : 's' }}
      </span>
    </div>

    <div class="pagination-controls">
      <button
        type="button"
        class="pg-btn pg-nav"
        :disabled="isFirst || loading"
        :aria-label="prevLabel"
        @click="goTo(currentPage - 1)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span v-if="!iconOnly" class="pg-label">{{ prevLabel }}</span>
      </button>

      <ul class="pg-pages">
        <li v-for="(item, idx) in pageItems" :key="idx">
          <span v-if="item === '…'" class="pg-ellipsis" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="pg-num"
            :class="{ active: item === currentPage }"
            :aria-current="item === currentPage ? 'page' : undefined"
            :aria-label="'Ir a la página ' + item"
            :disabled="loading"
            @click="goTo(item as number)"
          >
            {{ item }}
          </button>
        </li>
      </ul>

      <button
        type="button"
        class="pg-btn pg-nav"
        :disabled="isLast || loading"
        :aria-label="nextLabel"
        @click="goTo(currentPage + 1)"
      >
        <span v-if="!iconOnly" class="pg-label">{{ nextLabel }}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <div class="pagination-size" v-if="pageSizeOptions && pageSizeOptions.length">
      <label class="pg-size-label">
        {{ sizeLabel }}
        <select
          class="pg-size-select"
          :value="pageSize"
          :disabled="loading"
          @change="onSizeChange(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'

type PageItem = number | '…'

export default defineComponent({
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      validator: (v: number) => Number.isInteger(v) && v >= 1
    },
    pageSize: {
      type: Number,
      default: 10,
      validator: (v: number) => Number.isInteger(v) && v >= 1
    },
    total: {
      type: Number,
      required: true,
      validator: (v: number) => Number.isInteger(v) && v >= 0
    },
    siblingCount: {
      type: Number,
      default: 1,
      validator: (v: number) => v >= 0
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 50, 100]
    },
    showInfo: {
      type: Boolean,
      default: true
    },
    showAlways: {
      type: Boolean,
      default: false
    },
    iconOnly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    prevLabel: {
      type: String,
      default: 'Anterior'
    },
    nextLabel: {
      type: String,
      default: 'Siguiente'
    },
    sizeLabel: {
      type: String,
      default: 'Por página'
    },
    itemLabel: {
      type: String,
      default: 'registro'
    },
    ariaLabel: {
      type: String,
      default: 'Paginación'
    }
  },
  emits: {
    'update:currentPage': (_page: number) => true,
    'update:pageSize': (_size: number) => true,
    change: (_payload: { page: number; pageSize: number }) => true
  },
  setup(props, { emit }) {
    const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

    const isFirst = computed(() => props.currentPage <= 1)
    const isLast = computed(() => props.currentPage >= totalPages.value)

    const rangeStart = computed(() => {
      if (props.total === 0) return 0
      return (props.currentPage - 1) * props.pageSize + 1
    })

    const rangeEnd = computed(() => {
      if (props.total === 0) return 0
      return Math.min(props.currentPage * props.pageSize, props.total)
    })

    /**
     * Construye la lista de items a mostrar en la barra.
     * Estrategia: 1 … [vecinos] actual [vecinos] … N
     * Con colapsado inteligente si no se necesitan elipses.
     */
    const pageItems = computed<PageItem[]>(() => {
      const total = totalPages.value
      const current = props.currentPage
      const siblings = props.siblingCount

      // Si el total de páginas es pequeño, mostramos todas.
      const totalNumbers = siblings * 2 + 5 // first, last, current, 2*siblings
      if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }

      const leftSibling = Math.max(current - siblings, 1)
      const rightSibling = Math.min(current + siblings, total)

      const showLeftDots = leftSibling > 2
      const showRightDots = rightSibling < total - 1

      const items: PageItem[] = []

      // Siempre primera página
      items.push(1)

      if (showLeftDots) {
        items.push('…')
      } else {
        for (let i = 2; i < leftSibling; i++) items.push(i)
      }

      // Vecinos + actual
      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== total) items.push(i)
      }

      if (showRightDots) {
        items.push('…')
      } else {
        for (let i = rightSibling + 1; i < total; i++) items.push(i)
      }

      // Siempre última página
      if (total > 1) items.push(total)

      return items
    })

    const goTo = (page: number) => {
      const clamped = Math.min(Math.max(1, page), totalPages.value)
      if (clamped === props.currentPage) return
      emit('update:currentPage', clamped)
      emit('change', { page: clamped, pageSize: props.pageSize })
    }

    const onSizeChange = (raw: string) => {
      const size = parseInt(raw, 10)
      if (Number.isNaN(size) || size <= 0) return
      if (size === props.pageSize) return
      emit('update:pageSize', size)
      emit('change', { page: props.currentPage, pageSize: size })
    }

    return {
      totalPages,
      isFirst,
      isLast,
      rangeStart,
      rangeEnd,
      pageItems,
      goTo,
      onSizeChange
    }
  }
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #eaecf0;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  font-size: 13.5px;
  color: #344054;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #667085;
}

.pagination-range strong {
  color: #101828;
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-pages {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pg-btn,
.pg-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #eaecf0;
  background: #fff;
  color: #344054;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
  line-height: 1;
  user-select: none;
}

.pg-btn:hover:not(:disabled),
.pg-num:hover:not(:disabled) {
  border-color: #b2c8ff;
  color: #1d4ed8;
  background: #f5f8ff;
}

.pg-btn:active:not(:disabled),
.pg-num:active:not(:disabled) {
  transform: translateY(1px);
}

.pg-btn:disabled,
.pg-num:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pg-btn:focus-visible,
.pg-num:focus-visible {
  outline: none;
  border-color: #2b7cff;
  box-shadow: 0 0 0 4px rgba(43, 124, 255, 0.14);
}

.pg-num.active {
  background: linear-gradient(135deg, #2b7cff, #5d8cff);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 18px rgba(43, 124, 255, 0.22);
}

.pg-num.active:hover:not(:disabled) {
  color: #fff;
  background: linear-gradient(135deg, #1d6cf0, #4a7bf0);
  border-color: transparent;
}

.pg-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 34px;
  color: #98a2b3;
  font-weight: 600;
  letter-spacing: 0.08em;
  user-select: none;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-size-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #667085;
  font-weight: 500;
}

.pg-size-select {
  appearance: none;
  -webkit-appearance: none;
  height: 32px;
  padding: 0 30px 0 10px;
  border: 1px solid #eaecf0;
  border-radius: 10px;
  background: #fff
    url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 8px center / 14px;
  color: #101828;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pg-size-select:hover:not(:disabled) {
  border-color: #98a2b3;
}

.pg-size-select:focus-visible {
  outline: none;
  border-color: #2b7cff;
  box-shadow: 0 0 0 4px rgba(43, 124, 255, 0.14);
}

.pg-size-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .pagination {
    justify-content: center;
  }
  .pagination-info,
  .pagination-size {
    width: 100%;
    justify-content: center;
  }
  .pg-label {
    display: none;
  }
  .pg-btn.pg-nav {
    padding: 0 8px;
  }
}
</style>
