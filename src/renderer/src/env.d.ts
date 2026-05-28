/// <reference types="vite/client" />

import type { NovelCraftApi } from '../../preload/api'

declare global {
  interface Window {
    novelcraft: NovelCraftApi
  }
}
