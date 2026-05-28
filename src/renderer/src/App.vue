<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NcSidebarNav from './components/ui/NcSidebarNav.vue'
import NcPageHeader from './components/ui/NcPageHeader.vue'
import NcToastContainer from './components/ui/NcToastContainer.vue'
import IconHouse from './components/icons/icons/IconHouse.vue'
import IconSquarePen from './components/icons/icons/IconSquarePen.vue'
import IconBookOpen from './components/icons/icons/IconBookOpen.vue'
import IconUsersRound from './components/icons/icons/IconUsersRound.vue'
import IconBrain from './components/icons/icons/IconBrain.vue'
import IconWandSparkles from './components/icons/icons/IconWandSparkles.vue'
import IconFileDown from './components/icons/icons/IconFileDown.vue'
import IconSettings from './components/icons/icons/IconSettings.vue'

const route = useRoute()

const iconMap: Record<string, typeof IconHouse> = {
  house: IconHouse,
  'square-pen': IconSquarePen,
  'book-open': IconBookOpen,
  'users-round': IconUsersRound,
  brain: IconBrain,
  'wand-sparkles': IconWandSparkles,
  'file-down': IconFileDown,
  settings: IconSettings
}

const pageMeta = computed(() => {
  const map: Record<string, { iconKey: string; title: string; subtitle: string }> = {
    '/': { iconKey: 'house', title: '首页', subtitle: '同一导航下的不同视图纵向排列' },
    '/workspace': { iconKey: 'square-pen', title: '创作工作台', subtitle: '当前作品：《星辰大海》' },
    '/knowledge': { iconKey: 'book-open', title: '知识库', subtitle: '同一导航下的不同视图纵向排列' },
    '/characters': { iconKey: 'users-round', title: '人物与关系', subtitle: '同一导航下的不同视图纵向排列' },
    '/memory': { iconKey: 'brain', title: '记忆与一致性', subtitle: '同一导航下的不同视图纵向排列' },
    '/ai': { iconKey: 'wand-sparkles', title: 'AI 导演', subtitle: '同一导航下的不同视图纵向排列' },
    '/export': { iconKey: 'file-down', title: '导出', subtitle: '同一导航下的不同视图纵向排列' },
    '/settings': { iconKey: 'settings', title: '设置', subtitle: '同一导航下的不同视图纵向排列' }
  }
  return map[route.path] || { iconKey: 'house', title: '页面标题', subtitle: '' }
})

const currentIcon = computed(() => iconMap[pageMeta.value.iconKey] ?? IconHouse)
</script>

<template>
  <div class="app-shell">
    <NcSidebarNav />

    <section class="app-content">
      <NcPageHeader
        :title="pageMeta.title"
        :subtitle="pageMeta.subtitle"
      >
        <template #icon>
          <component :is="currentIcon" :size="22" color="var(--color-accent)" />
        </template>
      </NcPageHeader>
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </section>

    <NcToastContainer />
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
  color: var(--color-ink);
  background: var(--color-app-bg);
}

.app-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  padding: 28px;
}

.app-main {
  flex: 1;
  min-height: 0;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
}
</style>
