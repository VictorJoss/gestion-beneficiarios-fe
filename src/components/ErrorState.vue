<template>
  <div class="toast error" role="alert">
    <span class="toast-icon">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
    <div class="toast-content">
      <strong>{{ title }}</strong>
      <div v-if="message">{{ message }}</div>
    </div>
    <button v-if="retryLabel" type="button" class="toast-action" @click="$emit('retry')">
      {{ retryLabel }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorState',
  emits: ['retry'],
  props: {
    title: {
      type: String,
      default: 'No se pudo completar la operación.'
    },
    message: {
      type: String,
      default: ''
    },
    retryLabel: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.toast.error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: 14px;
  color: #b42318;
}

.toast-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(180, 35, 24, 0.08);
  color: #b42318;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 13.5px;
  line-height: 1.45;
}

.toast-content strong {
  font-size: 13.5px;
  font-weight: 700;
  color: #b42318;
}

.toast-content div {
  color: #b42318;
  opacity: 0.9;
  word-break: break-word;
}

.toast-action {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.toast-action:hover {
  background: #fecdca;
  color: #7a1f12;
}
</style>
