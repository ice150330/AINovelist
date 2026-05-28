<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="nc-empty-state">
    <div v-if="icon || $slots.icon" class="nc-empty-state__icon">
      <slot name="icon">
        <span>{{ icon }}</span>
      </slot>
    </div>
    <h3 v-if="title" class="nc-empty-state__title">{{ title }}</h3>
    <p v-if="description" class="nc-empty-state__desc">{{ description }}</p>
    <div class="nc-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.nc-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 32px;
  text-align: center;
}

.nc-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-medium);
  background: var(--color-paper-soft);
  color: var(--color-ink-faint);
  font-size: 28px;
}

.nc-empty-state__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 700;
}

.nc-empty-state__desc {
  margin: 0;
  color: var(--color-ink-faint);
  font-size: 13px;
  line-height: 1.6;
  max-width: 320px;
}

.nc-empty-state__action {
  margin-top: 8px;
}
</style>
