<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import IconX from '../icons/icons/IconX.vue'

interface Props {
  visible?: boolean
  title?: string
  width?: string
  closable?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  width: '480px',
  closable: true,
  closeOnOverlay: true
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function onOverlayClick() {
  if (props.closeOnOverlay) {
    emit('close')
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="nc-modal" role="dialog" aria-modal="true">
      <div class="nc-modal__overlay" @click="onOverlayClick" />
      <div class="nc-modal__card" :style="{ width }">
        <div v-if="title || closable" class="nc-modal__header">
          <h3 v-if="title" class="nc-modal__title">{{ title }}</h3>
          <button
            v-if="closable"
            class="nc-modal__close"
            aria-label="关闭"
            @click="emit('close')"
          >
            <IconX :size="18" />
          </button>
        </div>
        <div class="nc-modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="nc-modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nc-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.nc-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(47, 36, 24, 0.35);
  backdrop-filter: blur(4px);
}

.nc-modal__card {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: var(--color-paper);
  box-shadow: var(--shadow-floating);
  overflow: hidden;
}

.nc-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 0;
}

.nc-modal__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.nc-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-ink-faint);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nc-modal__close:hover {
  background: rgba(47, 36, 24, 0.06);
  color: var(--color-ink);
}

.nc-modal__body {
  flex: 1;
  overflow: auto;
  padding: 14px 22px 18px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-ink-muted);
}

.nc-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 22px 18px;
}
</style>
