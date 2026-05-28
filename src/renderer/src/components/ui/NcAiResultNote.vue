<script setup lang="ts">
import NcButton from './NcButton.vue'
import IconSparkles from '../icons/icons/IconSparkles.vue'
import IconFileOutput from '../icons/icons/IconFileOutput.vue'

interface Props {
  text: string
  intent?: string
  sceneType?: string
}

withDefaults(defineProps<Props>(), {
  intent: '续写',
  sceneType: '对话'
})

const emit = defineEmits<{
  apply: []
  discard: []
}>()
</script>

<template>
  <div class="nc-ai-result-note">
    <div class="nc-ai-result-note__header">
      <div class="nc-ai-result-note__badge">
        <IconSparkles :size="14" />
        <span>AI 生成</span>
      </div>
      <span class="nc-ai-result-note__meta">{{ intent }} · {{ sceneType }}</span>
    </div>
    <pre class="nc-ai-result-note__text">{{ text }}</pre>
    <div class="nc-ai-result-note__actions">
      <NcButton variant="ghost" size="sm" @click="emit('discard')">弃用</NcButton>
      <NcButton variant="primary" size="sm" @click="emit('apply')">
        <IconFileOutput :size="14" /> 插入正文
      </NcButton>
    </div>
  </div>
</template>

<style scoped>
.nc-ai-result-note {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(168, 111, 42, 0.22);
  border-radius: var(--radius-panel);
  background: linear-gradient(180deg, rgba(255, 248, 232, 0.96), rgba(251, 239, 210, 0.86));
  box-shadow: var(--shadow-soft);
  animation: fade-up var(--duration-slow) var(--easing-decelerate) both;
}

.nc-ai-result-note__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.nc-ai-result-note__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 18px;
  background: rgba(168, 111, 42, 0.12);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 700;
}

.nc-ai-result-note__meta {
  font-size: 11px;
  color: var(--color-ink-faint);
}

.nc-ai-result-note__text {
  margin: 0;
  font-family: "Songti SC", "SimSun", "Noto Serif CJK SC", serif;
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-ink);
  white-space: pre-wrap;
}

.nc-ai-result-note__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
