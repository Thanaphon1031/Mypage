export type Lang = 'th' | 'en'
export type Theme = 'light' | 'dark'
export type Bilingual = { th: string; en: string }
export type LocalizedList = { th: string[]; en: string[] }
export type Project = {
  id: string
  title: Bilingual
  summary?: Bilingual
  description: Bilingual
  tags: string[]
  year: string
  url?: string
  repoUrl?: string
  image?: string
  coverImage?: string
  demoUrl?: string
  evidence?: Bilingual
  problem: Bilingual
  role: Bilingual
  process: LocalizedList
  decisions: LocalizedList
  results: Bilingual
  learnings: Bilingual
  status: 'draft' | 'published'
}
export type Skill = { id: string; name: Bilingual; level: number; group: string; capability: Bilingual; workflow: Bilingual; evidence: Bilingual; tools: string[] }
export type Article = { id: string; title: Bilingual; excerpt: Bilingual; date: string; readTime: number; tags: string[] }
export type TimelineItem = { id: string; year: string; title: Bilingual; body: Bilingual; type: 'education' | 'work' | 'award' }
export type ContactMessage = { id: string; name: string; email: string; message: string; status: 'new' | 'read' | 'archived'; createdAt: string }
export type RepositoryResult<T> = { data: T; error: null; demo: boolean } | { data: null; error: Error; demo: boolean }
export type RepositoryState = 'loading' | 'demo' | 'live' | 'error'
