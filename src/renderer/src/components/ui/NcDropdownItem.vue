<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="nc-dropdown-item"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.nc-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-small);
  background: transparent;
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nc-dropdown-item:hover:not(:disabled) {
  background: var(--color-paper-soft);
  color: var(--color-ink);
}

.nc-dropdown-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
