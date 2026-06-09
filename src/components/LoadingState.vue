<template>
  <div class="loading-state" role="status" :aria-label="label">
    <div v-if="variant === 'skeleton'" class="skeleton-list">
      <div v-for="n in count" :key="n" class="skeleton-item">
        <div class="skeleton-avatar" />
        <div class="skeleton-body">
          <div class="skeleton-line w-60" />
          <div class="skeleton-line w-40" />
          <div class="skeleton-line w-80" />
        </div>
      </div>
    </div>

    <div v-else class="spinner-wrap">
      <span class="spinner" />
      <span v-if="label" class="loading-label">{{ label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingState',
  props: {
    variant: {
      type: String as () => 'skeleton' | 'spinner',
      default: 'skeleton',
      validator: (v: string) => ['skeleton', 'spinner'].includes(v)
    },
    count: {
      type: Number,
      default: 4
    },
    label: {
      type: String,
      default: 'Cargando...'
    }
  }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  width: 100%;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 14px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f4f7 0%, #e4e7ec 50%, #f2f4f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.skeleton-line {
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f2f4f7 0%, #e4e7ec 50%, #f2f4f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.skeleton-line.w-40 { width: 40%; }
.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-80 { width: 80%; }

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  width: 100%;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #e4e7ec;
  border-top-color: #2b7cff;
  animation: spinner-rotate 0.8s linear infinite;
}

.loading-label {
  font-size: 13.5px;
  color: #667085;
  font-weight: 500;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}
</style>
