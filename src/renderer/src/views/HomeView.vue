<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NcPaperPanel from '../components/ui/NcPaperPanel.vue'
import NcLoadingState from '../components/ui/NcLoadingState.vue'
import NcProgressCard from '../components/ui/NcProgressCard.vue'

const environment = ref<Awaited<ReturnType<typeof window.novelcraft.app.getEnvironment>> | null>(null)

onMounted(async () => {
  environment.value = await window.novelcraft.app.getEnvironment()
})
</script>

<template>
  <section class="home-page">
    <div class="hero-card">
      <NcPaperPanel padding="34px">
        <p class="eyebrow">写作从这里继续</p>
        <h2>把章节、设定和 AI 灵感放在同一张温暖的书桌上。</h2>
        <p class="hero-copy">
          AINovelist 面向长篇小说创作，优先保证本地作品数据可靠保存，再逐步接入知识库、记忆与 AI 生成流程。
        </p>
        <router-link class="hero-action" to="/workspace">进入创作工作台</router-link>
      </NcPaperPanel>
    </div>

    <div class="home-sidebar">
      <NcProgressCard
        title="进度概览"
        :total-chapters="12"
        :completed-chapters="5"
        :word-count="12847"
      />
      <NcPaperPanel class="environment-card">
        <template #default>
          <div class="environment-card__header">本机创作目录</div>
          <div v-if="environment" class="path-list">
            <div>
              <span>作品空间</span>
              <strong>{{ environment.workspacePath }}</strong>
            </div>
            <div>
              <span>知识库</span>
              <strong>{{ environment.knowledgeBasePath }}</strong>
            </div>
            <div>
              <span>模型目录</span>
              <strong>{{ environment.modelsPath }}</strong>
            </div>
            <div>
              <span>缓存目录</span>
              <strong>{{ environment.cachePath }}</strong>
            </div>
          </div>
          <NcLoadingState v-else message="正在读取本机环境信息..." />
        </template>
      </NcPaperPanel>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 24px;
  align-items: stretch;
}

.hero-card :deep(.nc-paper-panel) {
  height: 100%;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-card h2 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.hero-copy {
  max-width: 680px;
  margin: 22px 0 0;
  color: var(--color-ink-muted);
  font-size: 16px;
  line-height: 1.8;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  margin-top: 28px;
  padding: 12px 18px;
  border-radius: var(--radius-medium);
  background: linear-gradient(180deg, #b97e35 0%, var(--color-accent) 100%);
  color: #fff8e8;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 12px 26px rgba(168, 111, 42, 0.22);
  transition:
    transform var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard);
}

.hero-action:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-floating);
}

.home-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.environment-card {
  flex: 1;
}

.environment-card__header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
}

.path-list {
  display: grid;
  gap: 12px;
}

.path-list div {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.62);
}

.path-list span {
  color: var(--color-ink-muted);
  font-size: 12px;
}

.path-list strong {
  overflow-wrap: anywhere;
  color: var(--color-ink);
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1080px) {
  .home-page {
    grid-template-columns: 1fr;
  }
}
</style>
