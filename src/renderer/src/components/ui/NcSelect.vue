<script setup lang="ts">
import { computed } from 'vue'
import NcDropdown from './NcDropdown.vue'
import NcDropdownItem from './NcDropdownItem.vue'
import IconCheck from '../icons/icons/IconCheck.vue'

interface Option {
  label: string
  value: string
}

interface Props {
  modelValue?: string
  options?: Option[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder ?? '请选择'
})

function select(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <NcDropdown class="nc-select">
    <template #trigger>
      <div class="nc-select__trigger">
        <span class="nc-select__value">{{ selectedLabel }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </template>
    <NcDropdownItem
      v-for="opt in options"
      :key="opt.value"
      @click="select(opt.value)"
    >
      <IconCheck v-if="modelValue === opt.value" :size="14" style="opacity: 1" />
      <span v-else style="width: 14px" />
      {{ opt.label }}
    </NcDropdownItem>
  </NcDropdown>
</template>

<style scoped>
.nc-select {
  width: 100%;
}

.nc-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  border: none;
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.86);
  box-shadow: inset 0 0 0 1px var(--color-border);
  color: var(--color-ink);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition:
    background var(--duration-normal) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard);
}

.nc-select__trigger:hover {
  box-shadow: inset 0 0 0 1px rgba(168, 111, 42, 0.28);
}

.nc-select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
