<script setup lang="ts">
interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[]
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function select(value: string) {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="nc-segmented-control">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="['nc-segmented-control__item', { 'nc-segmented-control__item--active': modelValue === opt.value }]"
      @click="select(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.nc-segmented-control {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.5);
}

.nc-segmented-control__item {
  padding: 6px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}

.nc-segmented-control__item:hover {
  color: var(--color-ink);
}

.nc-segmented-control__item--active {
  background: var(--color-paper);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(80, 55, 20, 0.08);
}
</style>
