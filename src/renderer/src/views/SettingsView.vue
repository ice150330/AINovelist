<script setup lang="ts">
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcInput from '../components/ui/NcInput.vue'
import IconSettings from '../components/icons/icons/IconSettings.vue'
import IconMonitor from '../components/icons/icons/IconMonitor.vue'
import IconSlidersHorizontal from '../components/icons/icons/IconSlidersHorizontal.vue'
import IconPlug from '../components/icons/icons/IconPlug.vue'
import IconPalette from '../components/icons/icons/IconPalette.vue'

const settingGroups = [
  {
    label: 'AI 提供商',
    icon: IconPlug,
    items: [
      { label: 'Provider', value: 'Mock Provider', desc: '当前使用本地 Mock 生成' },
      { label: 'API Key', value: '', desc: '第三方服务密钥', type: 'password' }
    ]
  },
  {
    label: '编辑器',
    icon: IconSlidersHorizontal,
    items: [
      { label: '字体大小', value: '16px', desc: '编辑器正文字号' },
      { label: '行高', value: '1.9', desc: '编辑器行间距' }
    ]
  },
  {
    label: '界面',
    icon: IconPalette,
    items: [
      { label: '主题', value: '暖黄羊皮纸', desc: '当前仅支持默认主题' },
      { label: '侧边栏宽度', value: '248px', desc: '导航栏固定宽度' }
    ]
  },
  {
    label: '系统',
    icon: IconMonitor,
    items: [
      { label: '自动保存', value: '开启', desc: '每 30 秒自动保存草稿' },
      { label: '备份保留', value: '30 天', desc: '本地备份文件保留时长' }
    ]
  }
]
</script>

<template>
  <section class="settings-page">
    <NcPaperPanel padding="28px">
      <div class="page-hero">
        <IconSettings :size="28" color="var(--color-accent)" />
        <div>
          <h2>设置</h2>
          <p>管理 AI 提供商、编辑器偏好与系统选项。</p>
        </div>
      </div>
    </NcPaperPanel>

    <div class="settings-groups">
      <NcPaperPanel
        v-for="group in settingGroups"
        :key="group.label"
        padding="18px"
      >
        <div class="settings-group__header">
          <component :is="group.icon" :size="18" color="var(--color-accent)" />
          <strong>{{ group.label }}</strong>
        </div>

        <div class="settings-items stagger-children">
          <div
            v-for="item in group.items"
            :key="item.label"
            class="settings-item"
          >
            <div class="settings-item__info">
              <span class="settings-item__label">{{ item.label }}</span>
              <span class="settings-item__desc">{{ item.desc }}</span>
            </div>
            <NcInput
              v-if="item.type === 'password'"
              :model-value="item.value"
              type="password"
              placeholder="未配置"
              style="width: 200px"
              readonly
            />
            <span v-else class="settings-item__value">{{ item.value }}</span>
          </div>
        </div>
      </NcPaperPanel>
    </div>

    <NcPaperPanel padding="18px" class="settings-actions">
      <NcButton variant="secondary">恢复默认设置</NcButton>
      <NcButton variant="primary">保存更改</NcButton>
    </NcPaperPanel>
  </section>
</template>

<style scoped>
.settings-page {
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

.settings-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.settings-group__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.settings-group__header strong {
  font-size: 14px;
  color: var(--color-ink);
}

.settings-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.4);
  transition: box-shadow var(--duration-normal) var(--easing-standard);
}

.settings-item:hover {
  box-shadow: var(--shadow-raised);
}

.settings-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.settings-item__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.settings-item__desc {
  font-size: 12px;
  color: var(--color-ink-faint);
}

.settings-item__value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink-muted);
  flex-shrink: 0;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 980px) {
  .settings-groups {
    grid-template-columns: 1fr;
  }
}
</style>
