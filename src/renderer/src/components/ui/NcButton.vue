<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="nc-button"
    :class="[`nc-button--${variant}`, `nc-button--${size}`]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="nc-button__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.nc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition:
    background var(--duration-normal) var(--easing-standard),
    border-color var(--duration-normal) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard);
}

.nc-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.nc-button--sm {
  padding: 6px 12px;
  font-size: 12px;
  line-height: 1.5;
}

.nc-button--md {
  padding: 10px 18px;
  font-size: 14px;
  line-height: 1.5;
}

.nc-button--lg {
  padding: 14px 24px;
  font-size: 15px;
  line-height: 1.5;
}

/* Primary */
.nc-button--primary {
  background: linear-gradient(180deg, #b97e35 0%, var(--color-accent) 100%);
  color: #fff8e8;
  box-shadow: 0 10px 24px rgba(168, 111, 42, 0.22);
}

.nc-button--primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #c88b3f 0%, #996020 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-floating);
}

.nc-button--primary:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 4px 12px rgba(168, 111, 42, 0.18);
}

/* Secondary */
.nc-button--secondary {
  background: var(--color-paper-soft);
  border-color: rgba(99, 71, 36, 0.18);
  color: var(--color-ink);
}

.nc-button--secondary:hover:not(:disabled) {
  background: #fff2d4;
  border-color: rgba(168, 111, 42, 0.42);
  transform: translateY(-1px);
  box-shadow: var(--shadow-raised);
}

.nc-button--secondary:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

/* Ghost */
.nc-button--ghost {
  background: transparent;
  color: var(--color-ink-muted);
}

.nc-button--ghost:hover:not(:disabled) {
  background: rgba(255, 248, 232, 0.62);
  color: var(--color-ink);
}

.nc-button--ghost:active:not(:disabled) {
  transform: scale(0.98);
}

/* Spinner */
.nc-button__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
