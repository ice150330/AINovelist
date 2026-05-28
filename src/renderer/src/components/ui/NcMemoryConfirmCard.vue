<script setup lang="ts">
import NcButton from './NcButton.vue'
import NcStatusPill from './NcStatusPill.vue'
import IconShieldCheck from '../icons/icons/IconShieldCheck.vue'
import IconX from '../icons/icons/IconX.vue'

interface Props {
  content: string
  type?: string
  chapter?: string
}

withDefaults(defineProps<Props>(), {
  type: '设定',
  chapter: '未知章节'
})

const emit = defineEmits<{
  confirm: []
  reject: []
}>()
</script>

<template>
  <div class="nc-memory-confirm-card">
    <div class="nc-memory-confirm-card__header">
      <div class="nc-memory-confirm-card__badge">
        <IconShieldCheck :size="14" />
        <span>记忆确认</span>
      </div>
      <NcStatusPill status="info">{{ type }}</NcStatusPill>
    </div>
    <p class="nc-memory-confirm-card__content">{{ content }}</p>
    <div class="nc-memory-confirm-card__meta">
      <span>{{ chapter }}</span>
    </div>
    <div class="nc-memory-confirm-card__actions">
      <NcButton variant="ghost" size="sm" @click="emit('reject')">
        <IconX :size="14" /> 不一致
      </NcButton>
      <NcButton variant="primary" size="sm" @click="emit('confirm')">确认</NcButton>
    </div>
  </div>
</template>

<style scoped>
.nc-memory-confirm-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.5);
  transition: box-shadow var(--duration-normal) var(--easing-standard);
}

.nc-memory-confirm-card:hover {
  box-shadow: var(--shadow-raised);
}

.nc-memory-confirm-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.nc-memory-confirm-card__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 18px;
  background: rgba(95, 127, 79, 0.13);
  color: var(--color-success);
  font-size: 11px;
  font-weight: 700;
}

.nc-memory-confirm-card__content {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink);
  line-height: 1.5;
}

.nc-memory-confirm-card__meta {
  font-size: 12px;
  color: var(--color-ink-faint);
}

.nc-memory-confirm-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
