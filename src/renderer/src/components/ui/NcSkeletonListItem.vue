<template>
  <div class="nc-skeleton-list-item">
    <div class="nc-skeleton-list-item__icon" />
    <div class="nc-skeleton-list-item__content">
      <div class="nc-skeleton-list-item__line" style="width: 140px" />
      <div class="nc-skeleton-list-item__line" style="width: 100px" />
    </div>
    <div class="nc-skeleton-list-item__action" />
  </div>
</template>

<style scoped>
.nc-skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.nc-skeleton-list-item__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-small);
  background: var(--color-paper-strong);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

.nc-skeleton-list-item__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nc-skeleton-list-item__line {
  height: 10px;
  border-radius: 5px;
  background: var(--color-paper-strong);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.nc-skeleton-list-item__action {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--color-paper-strong);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
</style>
