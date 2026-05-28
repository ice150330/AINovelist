<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="nc-section-header">
    <div class="nc-section-header__text">
      <h3 class="nc-section-header__title">{{ title }}</h3>
      <p v-if="subtitle" class="nc-section-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" class="nc-section-header__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.nc-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.nc-section-header__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nc-section-header__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
}

.nc-section-header__subtitle {
  margin: 0;
  color: var(--color-ink-faint);
  font-size: 12px;
}

.nc-section-header__action {
  flex-shrink: 0;
}
</style>
