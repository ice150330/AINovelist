<script setup lang="ts">
import { computed } from 'vue'
import IconCircleCheck from '../icons/icons/IconCircleCheck.vue'
import IconTriangleAlert from '../icons/icons/IconTriangleAlert.vue'
import IconInfo from '../icons/icons/IconInfo.vue'
import IconX from '../icons/icons/IconX.vue'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'info'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  closable: false
})

const emit = defineEmits<{
  close: []
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

const currentIcon = computed(() => iconMap[props.type])
const currentStyle = computed(() => styleMap[props.type])
</script>

<template>
  <div
    class="nc-alert"
    :style="{
      background: currentStyle.bg,
      borderColor: currentStyle.border
    }"
  >
    <component
      :is="currentIcon"
      :size="18"
      :color="currentStyle.iconColor"
      class="nc-alert__icon"
    />
    <div class="nc-alert__content">
      <slot />
    </div>
    <button
      v-if="closable"
      class="nc-alert__close"
      aria-label="关闭"
      @click="emit('close')"
    >
      <IconX :size="14" />
    </button>
  </div>
</template>

<style scoped>
.nc-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid;
  border-radius: var(--radius-medium);
  color: var(--color-ink-muted);
  font-size: 13px;
  line-height: 1.5;
}

.nc-alert__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.nc-alert__content {
  flex: 1;
  min-width: 0;
}

.nc-alert__close {
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

.nc-alert__close:hover {
  background: rgba(47, 36, 24, 0.06);
  color: var(--color-ink);
}
</style>
