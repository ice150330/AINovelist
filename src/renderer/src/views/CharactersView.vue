<script setup lang="ts">
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcStatusPill from '../components/ui/NcStatusPill.vue'
import IconUsersRound from '../components/icons/icons/IconUsersRound.vue'
import IconUserPlus from '../components/icons/icons/IconUserPlus.vue'
import IconNetwork from '../components/icons/icons/IconNetwork.vue'

const demoCharacters = [
  { id: '1', name: '林轩', role: '主角', tags: ['冷静', '剑修'], relations: 4 },
  { id: '2', name: '苏婉儿', role: '女主', tags: ['温柔', '医仙'], relations: 3 },
  { id: '3', name: '楚天行', role: '反派', tags: ['野心', '魔道'], relations: 2 }
]
</script>

<template>
  <section class="characters-page">
    <NcPaperPanel padding="28px">
      <div class="page-hero">
        <IconUsersRound :size="28" color="var(--color-accent)" />
        <div>
          <h2>人物与关系</h2>
          <p>管理角色档案、关系线与出场约束，让每个人物都有完整的弧光。</p>
        </div>
      </div>
    </NcPaperPanel>

    <div class="characters-layout">
      <NcPaperPanel padding="18px" class="characters-list">
        <div class="list-header">
          <strong>角色列表</strong>
          <NcButton variant="ghost" size="sm">
            <IconUserPlus :size="14" /> 新建角色
          </NcButton>
        </div>

        <div class="character-items stagger-children">
          <div
            v-for="c in demoCharacters"
            :key="c.id"
            class="character-card"
          >
            <div class="character-card__head">
              <span class="character-card__name">{{ c.name }}</span>
              <NcStatusPill status="info">{{ c.role }}</NcStatusPill>
            </div>
            <div class="character-card__tags">
              <NcStatusPill v-for="tag in c.tags" :key="tag" status="pending">{{ tag }}</NcStatusPill>
            </div>
            <div class="character-card__meta">关系线 {{ c.relations }} 条</div>
          </div>
        </div>
      </NcPaperPanel>

      <NcPaperPanel padding="22px" class="relation-panel">
        <div class="list-header">
          <strong>关系图谱</strong>
          <NcStatusPill status="pending">Beta</NcStatusPill>
        </div>
        <NcEmptyState
          description="关系可视化将在后续版本上线，当前可维护角色与关系数据"
        >
          <template #icon>
            <IconNetwork :size="24" />
          </template>
        </NcEmptyState>
      </NcPaperPanel>
    </div>
  </section>
</template>

<style scoped>
.characters-page {
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

.characters-layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.6fr) minmax(360px, 1fr);
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

.character-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.character-card {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow var(--duration-normal) var(--easing-standard);
}

.character-card:hover {
  box-shadow: var(--shadow-raised);
}

.character-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.character-card__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink);
}

.character-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.character-card__meta {
  font-size: 12px;
  color: var(--color-ink-faint);
}

@media (max-width: 980px) {
  .characters-layout {
    grid-template-columns: 1fr;
  }
}
</style>
