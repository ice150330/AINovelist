export const IPC_CHANNELS = {
  app: {
    getEnvironment: 'app:get-environment'
  },
  project: {
    list: 'project:list',
    create: 'project:create',
    open: 'project:open'
  },
  chapter: {
    create: 'chapter:create',
    read: 'chapter:read',
    save: 'chapter:save'
  },
  knowledge: {
    search: 'knowledge:search'
  },
  ai: {
    generate: 'ai:generate'
  }
} as const
