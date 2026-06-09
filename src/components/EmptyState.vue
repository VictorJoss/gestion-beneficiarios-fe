<template>
  <div class="empty-state" role="status">
    <div class="icon">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h4>{{ title }}</h4>
    <p v-if="message">{{ message }}</p>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EmptyState',
  props: {
    title: {
      type: String,
      default: 'Sin resultados'
    },
    message: {
      type: String,
      default: 'Aún no hay datos para mostrar.'
    }
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 20px;
  text-align: center;
  background: rgba(249, 250, 251, 0.6);
  border: 1px dashed #d0d5dd;
  border-radius: 14px;
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(43, 124, 255, 0.08), rgba(93, 140, 255, 0.04));
  color: #2b5fd9;
  margin-bottom: 4px;
}

.empty-state h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #101828;
  letter-spacing: -0.01em;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  color: #667085;
  line-height: 1.5;
  max-width: 360px;
}
</style>
