<script setup lang="ts">
import { ref } from 'vue'
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcStatusPill from '../components/ui/NcStatusPill.vue'
import NcExportCheckItem from '../components/ui/NcExportCheckItem.vue'
import IconFileDown from '../components/icons/icons/IconFileDown.vue'
import IconFileText from '../components/icons/icons/IconFileText.vue'
import IconFileType from '../components/icons/icons/IconFileType.vue'

const exporting = ref(false)
const format = ref('markdown')

const formats = [
  { id: 'markdown', label: 'Markdown', desc: '保留格式标记，适合二次编辑', icon: IconFileText },
  { id: 'txt', label: '纯文本', desc: '去除所有标记，最通用的格式', icon: IconFileType },
  { id: 'epub', label: 'EPUB', desc: '电子书标准格式', icon: IconFileDown }
]

const checklist = [
  { label: '章节顺序正确', checked: true },
  { label: '人物名称一致性', checked: true },
  { label: '知识库引用完整', checked: false },
  { label: '封面图与元数据', checked: false }
]

async function handleExport() {
  exporting.value = true
  await new Promise(r => setTimeout(r, 2000))
  exporting.value = false
}
</script>

<template>
  <section class="export-page">
    <NcPaperPanel padding="28px">
      <div class="page-hero">
        <IconFileDown :size="28" color="var(--color-accent)" />
        <div>
          <h2>导出作品</h2>
          <p>将完成的小说导出为多种格式，方便发布与存档。</p>
        </div>
      </div>
    </NcPaperPanel>

    <div class="export-layout">
      <NcPaperPanel padding="18px" class="format-panel">
        <div class="list-header">
          <strong>导出格式</strong>
        </div>

        <div class="format-options">
          <button
            v-for="f in formats"
            :key="f.id"
            :class="['format-option', { 'format-option--active': format === f.id }]"
            @click="format = f.id"
          >
            <component :is="f.icon" :size="20" />
            <div class="format-option__info">
              <strong>{{ f.label }}</strong>
              <span>{{ f.desc }}</span>
            </div>
          </button>
        </div>
      </NcPaperPanel>

      <NcPaperPanel padding="18px" class="check-panel">
        <div class="list-header">
          <strong>导出检查</strong>
          <NcStatusPill status="pending">Beta</NcStatusPill>
        </div>

        <div class="check-items stagger-children">
          <NcExportCheckItem
            v-for="item in checklist"
            :key="item.label"
            :label="item.label"
            :checked="item.checked"
          />
        </div>

        <NcButton
          variant="primary"
          :loading="exporting"
          style="margin-top: 16px; width: 100%"
          @click="handleExport"
        >
          <IconFileDown :size="16" /> 开始导出
        </NcButton>
      </NcPaperPanel>
    </div>
  </section>
</template>

<style scoped>
.export-page {
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

.export-layout {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(280px, 0.7fr);
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

.format-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.4);
  color: var(--color-ink-muted);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--easing-standard),
    border-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}

.format-option:hover {
  background: rgba(251, 239, 210, 0.7);
}

.format-option--active {
  border-color: rgba(168, 111, 42, 0.45);
  background: rgba(168, 111, 42, 0.08) !important;
  color: var(--color-accent);
}

.format-option__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.format-option__info strong {
  font-size: 14px;
  color: var(--color-ink);
}

.format-option__info span {
  font-size: 12px;
  color: var(--color-ink-faint);
}

.check-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}


@media (max-width: 980px) {
  .export-layout {
    grid-template-columns: 1fr;
  }
}
</style>
