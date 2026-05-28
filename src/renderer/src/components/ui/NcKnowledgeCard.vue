<script setup lang="ts">
import NcStatusPill from './NcStatusPill.vue'
import IconTags from '../icons/icons/IconTags.vue'

interface Props {
  title: string
  excerpt?: string
  tags?: string[]
  category?: string
}

withDefaults(defineProps<Props>(), {
  excerpt: '',
  tags: () => [],
  category: '未分类'
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <article class="nc-knowledge-card" @click="emit('click')">
    <div class="nc-knowledge-card__header">
      <NcStatusPill status="info">{{ category }}</NcStatusPill>
      <IconTags :size="14" />
    </div>
    <strong class="nc-knowledge-card__title">{{ title }}</strong>
    <p v-if="excerpt" class="nc-knowledge-card__excerpt">{{ excerpt }}</p>
    <div v-if="tags.length" class="nc-knowledge-card__tags">
      <NcStatusPill v-for="tag in tags" :key="tag" status="pending">{{ tag }}</NcStatusPill>
    </div>
  </article>
</template>

<style scoped>
.nc-knowledge-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: rgba(255, 248, 232, 0.74);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard);
}

.nc-knowledge-card:hover {
  background: var(--color-paper);
  box-shadow: var(--shadow-panel);
  transform: translateY(-2px);
}

.nc-knowledge-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-ink-faint);
}

.nc-knowledge-card__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink);
}

.nc-knowledge-card__excerpt {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nc-knowledge-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
