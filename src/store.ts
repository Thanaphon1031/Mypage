import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang, Theme } from './types'
type State = { lang: Lang; theme: Theme; setLang: (lang: Lang) => void; toggleTheme: () => void }
export const usePreferences = create<State>()(persist((set) => ({
  lang: 'th', theme: 'light', setLang: (lang) => set({ lang }), toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }))
}), { name: 'thanaphon-preferences' }))
