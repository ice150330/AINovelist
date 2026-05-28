<script setup lang="ts">
import NcStatusPill from './NcStatusPill.vue'
import IconBookOpen from '../icons/icons/IconBookOpen.vue'

interface Props {
  title?: string
  totalChapters?: number
  completedChapters?: number
  wordCount?: number
}

withDefaults(defineProps<Props>(), {
  title: '进度概览',
  totalChapters: 0,
  completedChapters: 0,
  wordCount: 0
})
</script>

<template>
  <div class="nc-progress-card">
    <div class="nc-progress-card__header">
      <IconBookOpen :size="18" />
      <strong>{{ title }}</strong>
    </div>
    <div class="nc-progress-card__bar">
      <div
        class="nc-progress-card__fill"
        :style="{ width: `${Math.min(100, (completedChapters / Math.max(1, totalChapters)) * 100)}%` }"
      />
    </div>
    <div class="nc-progress-card__meta">
      <NcStatusPill status="success">{{ completedChapters }}/{{ totalChapters }} 章</NcStatusPill>
      <span>{{ wordCount.toLocaleString() }} 字</span>
    </div>
  </div>
</template>

<style scoped>
.nc-progress-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: rgba(255, 248, 232, 0.74);
  box-shadow: var(--shadow-soft);
}

.nc-progress-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink);
  font-size: 14px;
}

.nc-progress-card__bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(217, 168, 93, 0.2);
  overflow: hidden;
}

.nc-progress-card__fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--color-accent-soft), var(--color-accent));
  transition: width var(--duration-slow) var(--easing-decelerate);
}

.nc-progress-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--color-ink-faint);
}
</style>
