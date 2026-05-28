<script setup lang="ts">
interface Props {
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'loading'
}

withDefaults(defineProps<Props>(), {
  status: 'info'
})

const statusMap: Record<string, { bg: string; border: string; color: string }> = {
  success: {
    bg: 'rgba(95, 127, 79, 0.13)',
    border: 'rgba(95, 127, 79, 0.25)',
    color: '#405c34'
  },
  warning: {
    bg: 'rgba(196, 154, 60, 0.15)',
    border: 'rgba(196, 154, 60, 0.3)',
    color: '#8a6a1f'
  },
  error: {
    bg: 'rgba(180, 83, 60, 0.12)',
    border: 'rgba(180, 83, 60, 0.25)',
    color: 'var(--color-danger)'
  },
  info: {
    bg: 'rgba(217, 168, 93, 0.16)',
    border: 'rgba(217, 168, 93, 0.3)',
    color: 'var(--color-ink-muted)'
  },
  pending: {
    bg: 'rgba(168, 111, 42, 0.13)',
    border: 'rgba(168, 111, 42, 0.25)',
    color: 'var(--color-accent)'
  },
  loading: {
    bg: 'rgba(217, 168, 93, 0.1)',
    border: 'rgba(217, 168, 93, 0.2)',
    color: 'var(--color-accent-soft)'
  }
}
</script>

<template>
  <span
    class="nc-status-pill"
    :style="{
      background: statusMap[status].bg,
      borderColor: statusMap[status].border,
      color: statusMap[status].color
    }"
  >
    <slot />
  </span>
</template>

<style scoped>
.nc-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: 18px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}
</style>
