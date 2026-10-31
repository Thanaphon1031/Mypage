import { articles, projects, skills, timeline } from '../data'
import type { Article, ContactMessage, Project, RepositoryResult, Skill, TimelineItem } from '../types'
import { isSupabaseConfigured, supabase, turnstileFunctionUrl } from './supabase'

const toProject = (row: Record<string, unknown>): Project => ({
  id: String(row.id), title: row.title as Project['title'], summary: row.summary as Project['summary'],
  description: row.description as Project['description'], tags: (row.tags as string[]) ?? [], year: String(row.year),
  url: row.demo_url as string | undefined, repoUrl: row.repo_url as string | undefined,
  coverImage: row.cover_image as string | undefined, demoUrl: row.demo_url as string | undefined,
  evidence: row.evidence as Project['evidence'], problem: row.problem as Project['problem'],
  role: row.role as Project['role'], process: row.process as Project['process'],
  decisions: row.decisions as Project['decisions'], results: row.results as Project['results'],
  learnings: row.learnings as Project['learnings'], status: row.status as Project['status'],
})

export const repository = {
  async projects(): Promise<RepositoryResult<Project[]>> {
    if (!supabase) return { data: projects, error: null, demo: true }
    const { data, error } = await supabase.from('projects').select('*').eq('status', 'published').order('year', { ascending: false })
    if (error) return { data: null, error: new Error(error.message), demo: false }
    return { data: (data ?? []).map(toProject), error: null, demo: false }
  },
  async content(): Promise<RepositoryResult<{ articles: Article[]; skills: Skill[]; timeline: TimelineItem[] }>> {
    if (!supabase) return { data: { articles, skills, timeline }, error: null, demo: true }
    const [articleResult, skillResult, timelineResult] = await Promise.all([
      supabase.from('articles').select('*').eq('status', 'published').order('date', { ascending: false }),
      supabase.from('skills').select('*'),
      supabase.from('timeline').select('*').order('year', { ascending: false }),
    ])
    const failure = articleResult.error ?? skillResult.error ?? timelineResult.error
    if (failure) return { data: null, error: new Error(failure.message), demo: false }
    const liveArticles: Article[] = ((articleResult.data ?? []) as unknown as Record<string, unknown>[]).map(row => ({
      id: String(row.id), title: row.title as Article['title'], excerpt: (row.excerpt as Article['excerpt']) ?? { th: '', en: '' }, date: String(row.date ?? ''), readTime: Number(row.read_time ?? 0), tags: (row.tags as string[]) ?? [],
    }))
    const liveSkills: Skill[] = ((skillResult.data ?? []) as unknown as Record<string, unknown>[]).map(row => ({
      id: String(row.id), name: row.name as Skill['name'], level: Number(row.level ?? 0), group: String(row.group_name ?? 'build'), capability: (row.capability as Skill['capability']) ?? { th: '', en: '' },
      workflow: (row.workflow as Skill['workflow']) ?? { th: '', en: '' }, evidence: (row.evidence as Skill['evidence']) ?? { th: '', en: '' }, tools: (row.tools as string[]) ?? [],
    }))
    const liveTimeline: TimelineItem[] = ((timelineResult.data ?? []) as unknown as Record<string, unknown>[]).map(row => ({
      id: String(row.id), year: String(row.year), title: row.title as TimelineItem['title'], body: (row.body as TimelineItem['body']) ?? { th: '', en: '' }, type: row.type as TimelineItem['type'],
    }))
    return { data: { articles: liveArticles, skills: liveSkills, timeline: liveTimeline }, error: null, demo: false }
  },
  async verifyTurnstile(token: string): Promise<RepositoryResult<boolean>> {
    if (!isSupabaseConfigured || !turnstileFunctionUrl) return { data: null, error: new Error('Turnstile verification is not configured.'), demo: true }
    const response = await fetch(turnstileFunctionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
    const result = await response.json() as { success?: boolean }
    if (!response.ok || !result.success) return { data: null, error: new Error('Turnstile verification failed.'), demo: false }
    return { data: true, error: null, demo: false }
  },
  async sendMessage(message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>, turnstileToken?: string): Promise<RepositoryResult<boolean>> {
    if (!supabase) return { data: true, error: null, demo: true }
    if (!turnstileToken) return { data: null, error: new Error('Please complete the anti-spam check.'), demo: false }
    const verification = await this.verifyTurnstile(turnstileToken)
    if (verification.error) return { data: null, error: verification.error, demo: false }
    const { error } = await supabase.from('contact_messages').insert(message as never)
    if (error) return { data: null, error: new Error(error.message), demo: false }
    return { data: true, error: null, demo: false }
  }
}
