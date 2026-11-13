import { ref } from 'vue'

export const THEME_STORAGE_KEY = 'presenter_theme_v1'

export function getInitialTheme() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch (_) {}
  }
  return 'light'
}

export const currentTheme = ref(getInitialTheme())

export function applyTheme(theme) {
  currentTheme.value = theme
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (_) {}
}

export function toggleTheme() {
  const next = currentTheme.value === 'dark' ? 'light' : 'dark'
  applyTheme(next)
}

export function useTheme() {
  return {
    theme: currentTheme,
    toggleTheme,
    applyTheme
  }
}

