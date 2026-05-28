<script setup lang="ts">
import NcStatusPill from './NcStatusPill.vue'
import IconFolderOpen from '../icons/icons/IconFolderOpen.vue'

interface Props {
  name: string
  chapterCount?: number
  updatedAt?: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  chapterCount: 0
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="nc-project-card"
    :class="{ 'nc-project-card--active': active }"
    @click="emit('click')"
  >
    <div class="nc-project-card__icon">
      <IconFolderOpen :size="20" />
    </div>
    <div class="nc-project-card__info">
      <strong class="nc-project-card__name">{{ name }}</strong>
      <span class="nc-project-card__meta">{{ chapterCount }} 章节</span>
    </div>
    <NcStatusPill v-if="active" status="success">当前</NcStatusPill>
  </button>
</template>

<style scoped>
.nc-project-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.5);
  color: var(--color-ink-muted);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    border-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}

.nc-project-card:hover {
  background: rgba(251, 239, 210, 0.8);
  box-shadow: var(--shadow-raised);
}

.nc-project-card--active {
  border-color: rgba(168, 111, 42, 0.35);
  background: rgba(168, 111, 42, 0.08);
  color: var(--color-accent);
}

.nc-project-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-small);
  background: var(--color-paper-soft);
  flex-shrink: 0;
}

.nc-project-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.nc-project-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink);
}

.nc-project-card__meta {
  font-size: 12px;
  color: var(--color-ink-faint);
}
</style>
