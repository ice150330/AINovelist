export type UiDensity = 'compact' | 'comfortable' | 'spacious'
export type UiScale = 'small' | 'medium' | 'large'

export interface UiPreferences {
  density: UiDensity
  scale: UiScale
  sidebarCollapsed: boolean
}

export const uiPreferenceStorageKey = 'ainovelist.ui-preferences.v1'

export const densityOptions: { value: UiDensity; label: string; description: string }[] = [
  { value: 'compact', label: '紧凑', description: '压缩间距，适合小窗口和高信息密度。' },
  { value: 'comfortable', label: '标准', description: '默认桌面写作密度。' },
  { value: 'spacious', label: '宽松', description: '增加留白，适合长时间阅读和审稿。' }
]

export const scaleOptions: { value: UiScale; label: string; description: string }[] = [
  { value: 'small', label: '90%', description: '缩小组件和正文控制。' },
  { value: 'medium', label: '100%', description: '默认组件尺寸。' },
  { value: 'large', label: '110%', description: '放大组件和可点击区域。' }
]

export const defaultUiPreferences: UiPreferences = {
  density: 'comfortable',
  scale: 'medium',
  sidebarCollapsed: false
}

export function normalizeUiPreferences(value: Partial<UiPreferences> | null | undefined): UiPreferences {
  return {
    density: isUiDensity(value?.density) ? value.density : defaultUiPreferences.density,
    scale: isUiScale(value?.scale) ? value.scale : defaultUiPreferences.scale,
    sidebarCollapsed: typeof value?.sidebarCollapsed === 'boolean'
      ? value.sidebarCollapsed
      : defaultUiPreferences.sidebarCollapsed
  }
}

export function readUiPreferences(storage: Pick<Storage, 'getItem'> | null | undefined = getBrowserStorage()): UiPreferences {
  if (!storage) return defaultUiPreferences

  try {
    const raw = storage.getItem(uiPreferenceStorageKey)
    return normalizeUiPreferences(raw ? JSON.parse(raw) as Partial<UiPreferences> : null)
  } catch {
    return defaultUiPreferences
  }
}

export function writeUiPreferences(
  value: UiPreferences,
  storage: Pick<Storage, 'setItem'> | null | undefined = getBrowserStorage()
) {
  if (!storage) return
  storage.setItem(uiPreferenceStorageKey, JSON.stringify(normalizeUiPreferences(value)))
}

function isUiDensity(value: unknown): value is UiDensity {
  return value === 'compact' || value === 'comfortable' || value === 'spacious'
}

function isUiScale(value: unknown): value is UiScale {
  return value === 'small' || value === 'medium' || value === 'large'
}

function getBrowserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}
