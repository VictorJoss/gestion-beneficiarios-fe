<template>
  <div class="signature-pad">
    <div class="signature-pad__head">
      <label v-if="label" class="signature-pad__label">{{ label }}</label>
      <button type="button" class="btn btn-ghost btn-sm" :disabled="!hasStroke" @click="clear">
        Limpiar firma
      </button>
    </div>
    <div class="signature-pad__canvas-wrap" :class="{ empty: !hasStroke }">
      <canvas
        ref="canvasRef"
        class="signature-pad__canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @pointerdown="startDraw"
        @pointermove="draw"
        @pointerup="endDraw"
        @pointerleave="endDraw"
        @pointercancel="endDraw"
      />
      <span v-if="!hasStroke" class="signature-pad__placeholder">Firma aquí con el dedo o el mouse</span>
    </div>
    <span v-if="helper" class="helper">{{ helper }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  helper?: string
  height?: number
}>(), {
  modelValue: '',
  height: 160
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(600)
const canvasHeight = props.height
const hasStroke = ref(false)
const isDrawing = ref(false)

let ctx: CanvasRenderingContext2D | null = null

const syncCanvasSize = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  const wrap = canvas.parentElement
  if (!wrap) return
  const width = Math.max(wrap.clientWidth, 280)
  canvasWidth.value = width
  canvas.width = width
  canvas.height = canvasHeight
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = '#101828'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (props.modelValue) {
    restoreFromDataUrl(props.modelValue)
  }
}

const restoreFromDataUrl = (dataUrl: string): void => {
  const canvas = canvasRef.value
  if (!canvas || !ctx || !dataUrl) return
  const img = new Image()
  img.onload = () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
    hasStroke.value = true
  }
  img.src = dataUrl
}

const getPoint = (event: PointerEvent): { x: number; y: number } => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  }
}

const startDraw = (event: PointerEvent): void => {
  if (!ctx || !canvasRef.value) return
  isDrawing.value = true
  canvasRef.value.setPointerCapture(event.pointerId)
  const { x, y } = getPoint(event)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (event: PointerEvent): void => {
  if (!isDrawing.value || !ctx) return
  const { x, y } = getPoint(event)
  ctx.lineTo(x, y)
  ctx.stroke()
  hasStroke.value = true
}

const endDraw = (event: PointerEvent): void => {
  if (!isDrawing.value || !canvasRef.value) return
  isDrawing.value = false
  if (canvasRef.value.hasPointerCapture(event.pointerId)) {
    canvasRef.value.releasePointerCapture(event.pointerId)
  }
  emitValue()
}

const emitValue = (): void => {
  const canvas = canvasRef.value
  if (!canvas || !hasStroke.value) {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', canvas.toDataURL('image/png'))
}

const clear = (): void => {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  hasStroke.value = false
  emit('update:modelValue', '')
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  syncCanvasSize()
  const wrap = canvasRef.value?.parentElement
  if (wrap && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => syncCanvasSize())
    resizeObserver.observe(wrap)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.modelValue, (value) => {
  if (!value && hasStroke.value) clear()
})
</script>

<style scoped>
.signature-pad {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 0.25rem);
}

.signature-pad__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm, 0.5rem);
}

.signature-pad__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary, #344054);
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
}

.signature-pad__canvas-wrap {
  position: relative;
  border: 1px dashed var(--color-border, #d0d5dd);
  border-radius: var(--radius-md, 0.5rem);
  background: #fff;
  overflow: hidden;
}

.signature-pad__canvas-wrap.empty {
  background: #fafbfc;
}

.signature-pad__canvas {
  display: block;
  width: 100%;
  height: 160px;
  touch-action: none;
  cursor: crosshair;
}

.signature-pad__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #667085);
  pointer-events: none;
  padding: var(--spacing-md, 1rem);
  text-align: center;
}
</style>
