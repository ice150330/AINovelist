<script setup lang="ts">
import IconCheck from '../icons/icons/IconCheck.vue'
import IconCircleAlert from '../icons/icons/IconCircleAlert.vue'

interface Props {
  label: string
  checked?: boolean
  warning?: string
}

withDefaults(defineProps<Props>(), {
  checked: false
})
</script>

<template>
  <div :class="['nc-export-check-item', { 'nc-export-check-item--checked': checked }]">
    <div class="nc-export-check-item__icon">
      <IconCheck v-if="checked" :size="14" color="#fff" />
      <IconCircleAlert v-else :size="14" color="var(--color-warning)" />
    </div>
    <div class="nc-export-check-item__info">
      <span class="nc-export-check-item__label">{{ label }}</span>
      <span v-if="warning" class="nc-export-check-item__warning">{{ warning }}</span>
    </div>
  </div>
</template>

<style scoped>
.nc-export-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.4);
  transition: box-shadow var(--duration-normal) var(--easing-standard);
}

.nc-export-check-item:hover {
  box-shadow: var(--shadow-raised);
}

.nc-export-check-item--checked {
  border-color: rgba(95, 127, 79, 0.25);
  background: rgba(95, 127, 79, 0.08);
}

.nc-export-check-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--easing-standard);
}

.nc-export-check-item--checked .nc-export-check-item__icon {
  background: var(--color-success);
  border-color: var(--color-success);
}

.nc-export-check-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.nc-export-check-item__label {
  font-size: 13px;
  color: var(--color-ink-muted);
}

.nc-export-check-item--checked .nc-export-check-item__label {
  color: var(--color-ink);
}

.nc-export-check-item__warning {
  font-size: 12px;
  color: var(--color-warning);
}
</style>
