<script setup lang="ts">
import IconBookOpen from '../icons/icons/IconBookOpen.vue'

interface Props {
  title: string
  active?: boolean
  level?: number
  wordCount?: number
}

withDefaults(defineProps<Props>(), {
  active: false,
  level: 0
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="['nc-chapter-tree-item', { 'nc-chapter-tree-item--active': active }]"
    :style="{ paddingLeft: `${12 + level * 16}px` }"
    @click="emit('click')"
  >
    <IconBookOpen :size="14" />
    <span class="nc-chapter-tree-item__title">{{ title }}</span>
    <span v-if="wordCount" class="nc-chapter-tree-item__count">{{ wordCount.toLocaleString() }}</span>
  </button>
</template>

<style scoped>
.nc-chapter-tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: var(--radius-small);
  background: transparent;
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nc-chapter-tree-item:hover {
  background: rgba(217, 168, 93, 0.12);
  color: var(--color-ink);
}

.nc-chapter-tree-item--active {
  background: rgba(168, 111, 42, 0.12) !important;
  color: var(--color-accent) !important;
  font-weight: 600;
}

.nc-chapter-tree-item__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nc-chapter-tree-item__count {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-ink-faint);
}

.nc-chapter-tree-item--active .nc-chapter-tree-item__count {
  color: var(--color-accent-soft);
}
</style>
