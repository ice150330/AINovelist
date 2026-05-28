import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WorkspaceView from '../views/WorkspaceView.vue'
import KnowledgeView from '../views/KnowledgeView.vue'
import CharactersView from '../views/CharactersView.vue'
import MemoryView from '../views/MemoryView.vue'
import AiDirectorView from '../views/AiDirectorView.vue'
import ExportView from '../views/ExportView.vue'
import SettingsView from '../views/SettingsView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/workspace', name: 'workspace', component: WorkspaceView },
    { path: '/knowledge', name: 'knowledge', component: KnowledgeView },
    { path: '/characters', name: 'characters', component: CharactersView },
    { path: '/memory', name: 'memory', component: MemoryView },
    { path: '/ai', name: 'ai', component: AiDirectorView },
    { path: '/export', name: 'export', component: ExportView },
    { path: '/settings', name: 'settings', component: SettingsView }
  ]
})
