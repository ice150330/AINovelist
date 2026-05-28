<template>
  <div class="nc-skeleton-card">
    <div class="nc-skeleton-card__header">
      <div class="nc-skeleton-card__avatar" />
      <div class="nc-skeleton-card__meta">
        <div class="nc-skeleton-card__line" style="width: 120px" />
        <div class="nc-skeleton-card__line" style="width: 80px" />
      </div>
    </div>
    <div class="nc-skeleton-card__body">
      <div class="nc-skeleton-card__line" />
      <div class="nc-skeleton-card__line" style="width: 80%" />
      <div class="nc-skeleton-card__line" style="width: 60%" />
    </div>
  </div>
</template>

<style scoped>
.nc-skeleton-card {
  padding: 16px;
  border-radius: var(--radius-medium);
  background: var(--color-paper-soft);
}

.nc-skeleton-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.nc-skeleton-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-paper-strong);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.nc-skeleton-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nc-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nc-skeleton-card__line {
  height: 10px;
  border-radius: 5px;
  background: var(--color-paper-strong);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}
</style>
