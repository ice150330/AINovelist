<script setup lang="ts">
import { ref } from 'vue'
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcStatusPill from '../components/ui/NcStatusPill.vue'
import NcAiDirectorControl from '../components/ui/NcAiDirectorControl.vue'
import IconWandSparkles from '../components/icons/icons/IconWandSparkles.vue'
import IconSparkles from '../components/icons/icons/IconSparkles.vue'
import IconRefreshCw from '../components/icons/icons/IconRefreshCw.vue'

const generating = ref(false)

const history = [
  { id: '1', prompt: '续写林轩与苏婉儿在药王谷的对话', result: '生成成功', time: '10分钟前' },
  { id: '2', prompt: '描写玄天剑觉醒的场景', result: '生成成功', time: '1小时前' }
]

async function handleGenerate(_prompt: string) {
  if (!_prompt.trim()) return
  generating.value = true
  await new Promise(r => setTimeout(r, 1500))
  generating.value = false
}
</script>

<template>
  <section class="ai-page">
    <NcPaperPanel padding="28px">
      <div class="page-hero">
        <IconWandSparkles :size="28" color="var(--color-accent)" />
        <div>
          <h2>AI 导演</h2>
          <p>通过结构化 Prompt 控制 AI 生成方向，把灵感变成可续写的章节片段。</p>
        </div>
      </div>
    </NcPaperPanel>

    <div class="ai-layout">
      <NcPaperPanel padding="18px" class="director-panel">
        <div class="list-header">
          <strong>导演控制台</strong>
          <NcStatusPill status="pending">Beta</NcStatusPill>
        </div>

        <NcAiDirectorControl @generate="handleGenerate" />

        <NcEmptyState
          v-if="!generating && history.length === 0"
          description="输入指令后，AI 将生成可续写的章节片段"
        >
          <template #icon>
            <IconSparkles :size="24" />
          </template>
        </NcEmptyState>
      </NcPaperPanel>

      <NcPaperPanel padding="18px" class="history-panel">
        <div class="list-header">
          <strong>生成历史</strong>
          <NcButton variant="ghost" size="sm">
            <IconRefreshCw :size="14" /> 刷新
          </NcButton>
        </div>

        <div class="history-items stagger-children">
          <div
            v-for="h in history"
            :key="h.id"
            class="history-card"
          >
            <div class="history-card__prompt">{{ h.prompt }}</div>
            <div class="history-card__meta">
              <NcStatusPill status="success">{{ h.result }}</NcStatusPill>
              <span>{{ h.time }}</span>
            </div>
          </div>
        </div>
      </NcPaperPanel>
    </div>
  </section>
</template>

<style scoped>
.ai-page {
  display: grid;
  gap: 20px;
}

.page-hero {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.page-hero h2 {
  margin: 0 0 6px;
  font-size: 20px;
  letter-spacing: -0.03em;
}

.page-hero p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 13px;
  line-height: 1.6;
}

.ai-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(280px, 0.75fr);
  gap: 18px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.list-header strong {
  font-size: 14px;
  color: var(--color-ink);
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-card {
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow var(--duration-normal) var(--easing-standard);
}

.history-card:hover {
  box-shadow: var(--shadow-raised);
}

.history-card__prompt {
  font-size: 13px;
  color: var(--color-ink);
  line-height: 1.5;
}

.history-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-ink-faint);
}

@media (max-width: 980px) {
  .ai-layout {
    grid-template-columns: 1fr;
  }
}
</style>
