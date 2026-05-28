<script setup lang="ts">
interface Props {
  padding?: string | number
  gap?: string | number
  layout?: 'vertical' | 'horizontal'
  clip?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: '22px',
  gap: '10px',
  layout: 'vertical',
  clip: false
})
</script>

<template>
  <div
    class="nc-paper-panel"
    :class="{ 'nc-paper-panel--clip': clip }"
    :style="{
      padding: typeof padding === 'number' ? `${padding}px` : padding,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      flexDirection: layout === 'horizontal' ? 'row' : 'column'
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.nc-paper-panel {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: rgba(255, 248, 232, 0.88);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(14px);
}

.nc-paper-panel--clip {
  overflow: hidden;
}
</style>
