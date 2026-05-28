<script setup lang="ts">
import IconSearch from '../icons/icons/IconSearch.vue'
import IconBell from '../icons/icons/IconBell.vue'

interface Props {
  title: string
  subtitle?: string
  routeNote?: string
  showSearch?: boolean
  showBell?: boolean
}

withDefaults(defineProps<Props>(), {
  showSearch: true,
  showBell: true
})

const emit = defineEmits<{
  search: []
  bell: []
}>()
</script>

<template>
  <header class="nc-page-header">
    <span v-if="$slots.icon" class="nc-page-header__icon">
      <slot name="icon" />
    </span>
    <div class="nc-page-header__title-group">
      <h1 class="nc-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="nc-page-header__subtitle">{{ subtitle }}</p>
    </div>
    <span v-if="routeNote" class="nc-page-header__route">{{ routeNote }}</span>
    <button
      v-if="showSearch"
      class="nc-page-header__action"
      aria-label="搜索"
      @click="emit('search')"
    >
      <IconSearch :size="18" />
    </button>
    <button
      v-if="showBell"
      class="nc-page-header__action"
      aria-label="通知"
      @click="emit('bell')"
    >
      <IconBell :size="18" />
    </button>
  </header>
</template>

<style scoped>
.nc-page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--radius-panel);
  background: var(--color-paper-soft);
  border: 1px solid var(--color-border);
  min-height: 72px;
}

.nc-page-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.nc-page-header__title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.nc-page-header__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

.nc-page-header__subtitle {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 12px;
  line-height: 1.45;
}

.nc-page-header__route {
  color: var(--color-ink-faint);
  font-size: 11px;
  font-family: monospace;
  opacity: 0.6;
}

.nc-page-header__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-small);
  background: transparent;
  color: var(--color-ink-muted);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nc-page-header__action:hover {
  background: var(--color-paper);
  color: var(--color-ink);
}
</style>
