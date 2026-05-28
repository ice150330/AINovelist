<template>
  <section class="knowledge-page">
    <div class="knowledge-hero">
      <NcPaperPanel padding="28px">
        <p>知识库</p>
        <h2>把世界观、素材和文风样例整理成可引用的创作纸夹。</h2>
        <span>下一阶段将接入 Markdown 扫描、Frontmatter 解析与搜索。</span>
      </NcPaperPanel>
    </div>

    <div class="knowledge-grid">
      <NcKnowledgeCard
        title="世界观设定"
        excerpt="地理、势力、历史、规则与禁忌。"
        category="设定"
        :tags="['地理', '势力', '历史']"
      />
      <NcKnowledgeCard
        title="人物素材"
        excerpt="角色弧光、关系线与出场约束。"
        category="人物"
        :tags="['主角', '反派', '关系线']"
      />
      <NcKnowledgeCard
        title="文风样例"
        excerpt="可注入 AI 上下文的叙事片段。"
        category="样例"
        :tags="['对话', '描写', '转场']"
      />
    </div>

    <NcPaperPanel padding="22px">
      <div class="knowledge-entry__header">素材入口</div>
      <NcEmptyState
        description="Markdown 知识库扫描、Frontmatter 解析与搜索将在后续接入"
      />
    </NcPaperPanel>
  </section>
</template>

<script setup lang="ts">
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcKnowledgeCard from '../components/ui/NcKnowledgeCard.vue'
</script>

<style scoped>
.knowledge-page {
  display: grid;
  gap: 20px;
}

.knowledge-hero p {
  margin: 0 0 10px;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.knowledge-hero h2 {
  max-width: 820px;
  margin: 0;
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.knowledge-hero span {
  display: block;
  margin-top: 14px;
  color: var(--color-ink-muted);
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.knowledge-entry__header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 980px) {
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>
