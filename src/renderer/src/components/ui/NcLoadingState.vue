<script setup lang="ts">
import IconLoaderCircle from '../icons/icons/IconLoaderCircle.vue'

interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  message: '加载中...',
  size: 'md'
})
</script>

<template>
  <div :class="['nc-loading-state', `nc-loading-state--${size}`]">
    <IconLoaderCircle :size="size === 'sm' ? 18 : size === 'lg' ? 32 : 24" class="nc-loading-state__spinner" />
    <span v-if="message" class="nc-loading-state__text">{{ message }}</span>
  </div>
</template>

<style scoped>
.nc-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-ink-faint);
}

.nc-loading-state__spinner {
  animation: spin 0.9s linear infinite;
}

.nc-loading-state__text {
  font-size: 13px;
  line-height: 1.5;
}

.nc-loading-state--sm {
  gap: 6px;
}

.nc-loading-state--sm .nc-loading-state__text {
  font-size: 12px;
}

.nc-loading-state--lg {
  gap: 14px;
}

.nc-loading-state--lg .nc-loading-state__text {
  font-size: 15px;
}
</style>
