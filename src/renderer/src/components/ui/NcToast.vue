<script setup lang="ts">
import { computed } from 'vue'
import IconCircleCheck from '../icons/icons/IconCircleCheck.vue'
import IconTriangleAlert from '../icons/icons/IconTriangleAlert.vue'
import IconInfo from '../icons/icons/IconInfo.vue'
import IconX from '../icons/icons/IconX.vue'
import type { ToastItem } from '../../composables/useToast'

interface Props {
  toast: ToastItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: [id: string]
}>()

const iconMap = {
  success: IconCircleCheck,
  warning: IconTriangleAlert,
  error: IconTriangleAlert,
  info: IconInfo
}

const styleMap = {
  success: {
    bg: 'rgba(95, 127, 79, 0.13)',
    border: 'rgba(95, 127, 79, 0.22)',
    iconColor: 'var(--color-success)'
  },
  warning: {
    bg: 'rgba(196, 154, 60, 0.13)',
    border: 'rgba(196, 154, 60, 0.22)',
    iconColor: 'var(--color-warning)'
  },
  error: {
    bg: 'rgba(180, 83, 60, 0.12)',
    border: 'rgba(180, 83, 60, 0.22)',
    iconColor: 'var(--color-danger)'
  },
  info: {
    bg: 'rgba(217, 168, 93, 0.12)',
    border: 'rgba(217, 168, 93, 0.22)',
    iconColor: 'var(--color-accent-soft)'
  }
}

const currentIcon = computed(() => iconMap[props.toast.type])
const currentStyle = computed(() => styleMap[props.toast.type])
</script>

<template>
  <Transition name="toast">
    <div
      class="nc-toast"
      :style="{
        background: currentStyle.bg,
        borderColor: currentStyle.border
      }"
    >
      <component
        :is="currentIcon"
        :size="18"
        :color="currentStyle.iconColor"
        class="nc-toast__icon"
      />
      <span class="nc-toast__message">{{ toast.message }}</span>
      <button
        class="nc-toast__close"
        aria-label="关闭"
        @click="emit('close', toast.id)"
      >
        <IconX :size="14" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.nc-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-floating);
  backdrop-filter: blur(14px);
  color: var(--color-ink-muted);
  font-size: 13px;
  line-height: 1.5;
  min-width: 260px;
  max-width: 400px;
}

.nc-toast__icon {
  flex-shrink: 0;
}

.nc-toast__message {
  flex: 1;
  min-width: 0;
}

.nc-toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-ink-faint);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nc-toast__close:hover {
  background: rgba(47, 36, 24, 0.06);
  color: var(--color-ink);
}

/* Transition */
.toast-enter-active {
  transition: all var(--duration-slow) var(--easing-decelerate);
}

.toast-leave-active {
  transition: all var(--duration-normal) var(--easing-accelerate);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.96);
}
</style>
