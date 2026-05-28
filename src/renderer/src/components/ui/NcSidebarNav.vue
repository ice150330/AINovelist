<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NcSidebarNavItem from './NcSidebarNavItem.vue'
import IconHouse from '../icons/icons/IconHouse.vue'
import IconSquarePen from '../icons/icons/IconSquarePen.vue'
import IconBookOpen from '../icons/icons/IconBookOpen.vue'
import IconUsersRound from '../icons/icons/IconUsersRound.vue'
import IconBrain from '../icons/icons/IconBrain.vue'
import IconWandSparkles from '../icons/icons/IconWandSparkles.vue'
import IconFileDown from '../icons/icons/IconFileDown.vue'
import IconSettings from '../icons/icons/IconSettings.vue'

const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: string
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

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

const navGroups: NavGroup[] = [
  {
    label: '创作',
    items: [
      { label: '首页', to: '/', icon: 'house' },
      { label: '创作工作台', to: '/workspace', icon: 'square-pen' },
      { label: '知识库', to: '/knowledge', icon: 'book-open' }
    ]
  },
  {
    label: '辅助',
    items: [
      { label: '人物与关系', to: '/characters', icon: 'users-round', badge: 'Beta' },
      { label: '记忆与一致性', to: '/memory', icon: 'brain', badge: 'Beta' },
      { label: 'AI 导演', to: '/ai', icon: 'wand-sparkles', badge: 'Beta' },
      { label: '导出', to: '/export', icon: 'file-down', badge: 'Beta' }
    ]
  },
  {
    label: '系统',
    items: [
      { label: '设置', to: '/settings', icon: 'settings', badge: 'Beta' }
    ]
  }
]

const currentRoute = computed(() => route.path)
</script>

<template>
  <nav class="nc-sidebar-nav">
    <!-- Brand -->
    <div class="nc-sidebar-nav__brand">
      <div class="nc-sidebar-nav__mark" />
      <div class="nc-sidebar-nav__brand-text">
        <span class="nc-sidebar-nav__brand-title">AINovelist</span>
        <span class="nc-sidebar-nav__brand-subtitle">温暖的 AI 小说创作台</span>
        <span class="nc-sidebar-nav__brand-version">v0.3 MVP</span>
      </div>
      <div class="nc-sidebar-nav__avatar" />
    </div>

    <!-- Nav Groups -->
    <div class="nc-sidebar-nav__groups">
      <div
        v-for="group in navGroups"
        :key="group.label"
        class="nc-sidebar-nav__group"
      >
        <span class="nc-sidebar-nav__group-label">{{ group.label }}</span>
        <NcSidebarNavItem
          v-for="item in group.items"
          :key="item.to"
          :label="item.label"
          :to="item.to"
          :badge="item.badge"
          :active="currentRoute === item.to"
        >
          <template #icon>
            <component :is="iconMap[item.icon]" :size="16" />
          </template>
        </NcSidebarNavItem>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nc-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  width: 248px;
  height: 100%;
}

.nc-sidebar-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 14px;
}

.nc-sidebar-nav__mark {
  width: 40px;
  height: 40px;
  border-radius: 15px;
  background: linear-gradient(145deg, var(--color-accent-soft), var(--color-accent));
  flex-shrink: 0;
}

.nc-sidebar-nav__brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.nc-sidebar-nav__brand-title {
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.nc-sidebar-nav__brand-subtitle {
  color: var(--color-ink-faint);
  font-size: 11px;
  line-height: 1.4;
}

.nc-sidebar-nav__brand-version {
  color: var(--color-ink-faint);
  font-size: 9px;
  line-height: 1.4;
}

.nc-sidebar-nav__avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(217, 168, 93, 0.4);
  flex-shrink: 0;
}

.nc-sidebar-nav__groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nc-sidebar-nav__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nc-sidebar-nav__group-label {
  padding: 6px 11px;
  color: var(--color-ink-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
