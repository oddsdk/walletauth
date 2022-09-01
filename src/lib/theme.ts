import { browser } from '$app/env'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export const loadTheme = (): Theme => {
  if (browser) {
    const browserTheme = localStorage.getItem(STORAGE_KEY) as Theme
    const osTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

    return browserTheme ?? (osTheme as Theme) ?? 'light'
  }
}

export const storeTheme = (theme: Theme): void => {
  if (browser) {
    localStorage.setItem(STORAGE_KEY, theme)
  }
}
