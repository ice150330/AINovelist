<script setup lang="ts">
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcStatusPill from '../components/ui/NcStatusPill.vue'
import NcMemoryConfirmCard from '../components/ui/NcMemoryConfirmCard.vue'
import NcExportCheckItem from '../components/ui/NcExportCheckItem.vue'
import IconBrain from '../components/icons/icons/IconBrain.vue'

const memoryItems = [
  { id: '1', content: '林轩在第三章获得了玄天剑', type: '道具', chapter: '第3章', confidence: 0.92 },
  { id: '2', content: '苏婉儿的医术来自药王谷', type: '背景', chapter: '第1章', confidence: 0.88 }
]

const checks = [
  { id: '1', desc: '林轩的武器名称一致性', status: 'pass' as const },
  { id: '2', desc: '苏婉儿出场时间线', status: 'warning' as const },
  { id: '3', desc: '楚天行势力范围', status: 'pending' as const }
]
</script>

<template>
  <section class="memory-page">
    <NcPaperPanel padding="28px">
      <div class="page-hero">
        <IconBrain :size="28" color="var(--color-accent)" />
        <div>
          <h2>记忆与一致性</h2>
          <p>追踪关键设定、人物属性与剧情线索，自动审查前后一致性。</p>
        </div>
      </div>
    </NcPaperPanel>

    <div class="memory-layout">
      <NcPaperPanel padding="18px" class="memory-list">
        <div class="list-header">
          <strong>记忆片段</strong>
          <NcButton variant="ghost" size="sm">手动添加</NcButton>
        </div>

        <div class="memory-items stagger-children">
          <NcMemoryConfirmCard
            v-for="m in memoryItems"
            :key="m.id"
            :content="m.content"
            :type="m.type"
            :chapter="m.chapter"
            @confirm="console.log('confirm', m.id)"
            @reject="console.log('reject', m.id)"
          />
        </div>
      </NcPaperPanel>

      <NcPaperPanel padding="18px" class="check-panel">
        <div class="list-header">
          <strong>一致性审查</strong>
          <NcStatusPill status="pending">Beta</NcStatusPill>
        </div>

        <div class="check-items stagger-children">
          <NcExportCheckItem
            v-for="c in checks"
            :key="c.id"
            :label="c.desc"
            :checked="c.status === 'pass'"
            :warning="c.status === 'warning' ? '存在冲突，需人工确认' : undefined"
          />
        </div>
      </NcPaperPanel>
    </div>
  </section>
</template>

<style scoped>
.memory-page {
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

.memory-layout {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(280px, 0.8fr);
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

.memory-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.check-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 980px) {
  .memory-layout {
    grid-template-columns: 1fr;
  }
}
</style>
