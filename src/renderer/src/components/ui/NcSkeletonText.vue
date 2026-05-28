<script setup lang="ts">
interface Props {
  lines?: number
  width?: string
}

withDefaults(defineProps<Props>(), {
  lines: 1,
  width: '100%'
})
</script>

<template>
  <div class="nc-skeleton-text" :style="{ width }">
    <div
      v-for="i in lines"
      :key="i"
      class="nc-skeleton-text__line"
      :style="{ width: i === lines && lines > 1 ? '60%' : '100%' }"
    />
  </div>
</template>

<style scoped>
.nc-skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nc-skeleton-text__line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-paper-strong) 25%, var(--color-paper-soft) 50%, var(--color-paper-strong) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}
</style>
