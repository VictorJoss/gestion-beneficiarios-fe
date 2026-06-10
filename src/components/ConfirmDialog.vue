<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="show" class="dialog-overlay" @click.self="handleCancel">
        <div class="dialog-content" role="dialog" aria-modal="true" :aria-labelledby="'dialog-title-' + instanceId" :aria-describedby="'dialog-desc-' + instanceId">
          <div class="dialog-header">
            <h3 :id="'dialog-title-' + instanceId" class="dialog-title">{{ title }}</h3>
            <button class="btn-close" @click="handleCancel" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div :id="'dialog-desc-' + instanceId" class="dialog-body">
            <p>{{ message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="handleCancel" :disabled="loading">
              {{ cancelText }}
            </button>
            <button class="btn" :class="'btn-' + type" @click="handleConfirm" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'danger', 'secondary', 'ghost'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const instanceId = Math.random().toString(36).substring(2, 9)

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:show', false)
  emit('cancel')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.dialog-content {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.dialog-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.dialog-body {
  padding: 1.5rem;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.dialog-body p {
  margin: 0;
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: #f8fafc;
}

/* Transiciones */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .dialog-content {
  animation: dialog-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dialog-fade-leave-active .dialog-content {
  animation: dialog-slide-down 0.2s ease-in forwards;
}

@keyframes dialog-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dialog-slide-down {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-right-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .dialog-content {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    position: absolute;
    bottom: 0;
    max-width: 100%;
  }
  .dialog-overlay {
    align-items: flex-end;
    padding: 0;
  }
}
</style>