import { useEffect, useState, type FormEvent } from 'react'
import { LogOut, Plus, Save, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { usePreferences } from '../store'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { SEO } from '../components/SEO'
import type { Project } from '../types'
import type { Session } from '@supabase/supabase-js'

const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens'),
  titleTh: z.string().min(2), titleEn: z.string().min(2), summaryTh: z.string().min(2), summaryEn: z.string().min(2),
  descriptionTh: z.string().min(2), descriptionEn: z.string().min(2), year: z.string().regex(/^\d{4}$/),
  tags: z.string(), problemTh: z.string().min(2), problemEn: z.string().min(2), roleTh: z.string().min(2), roleEn: z.string().min(2),
  processTh: z.string(), processEn: z.string(), decisionsTh: z.string(), decisionsEn: z.string(),
  evidenceTh: z.string(), evidenceEn: z.string(), resultsTh: z.string().min(2), resultsEn: z.string().min(2),
  learningsTh: z.string().min(2), learningsEn: z.string().min(2), coverImage: z.string(), demoUrl: z.string().url().or(z.literal('')),
  repoUrl: z.string().url().or(z.literal('')), status: z.enum(['draft', 'published']),
})
type FormValues = z.infer<typeof projectSchema>

const blank: FormValues = {
  id: '', titleTh: '', titleEn: '', summaryTh: '', summaryEn: '', descriptionTh: '', descriptionEn: '', year: String(new Date().getFullYear()),
  tags: '', problemTh: '', problemEn: '', roleTh: '', roleEn: '', processTh: '', processEn: '', decisionsTh: '', decisionsEn: '',
  evidenceTh: '', evidenceEn: '', resultsTh: '', resultsEn: '', learningsTh: '', learningsEn: '', coverImage: '', demoUrl: '', repoUrl: '', status: 'draft',
}
const projectToForm = (p: Project): FormValues => ({
  ...blank, id: p.id, titleTh: p.title.th, titleEn: p.title.en, summaryTh: p.summary?.th ?? p.description.th, summaryEn: p.summary?.en ?? p.description.en,
  descriptionTh: p.description.th, descriptionEn: p.description.en, year: p.year, tags: p.tags.join(', '), problemTh: p.problem.th, problemEn: p.problem.en,
  roleTh: p.role.th, roleEn: p.role.en, processTh: p.process.th.join('\n'), processEn: p.process.en.join('\n'), decisionsTh: p.decisions.th.join('\n'),
  decisionsEn: p.decisions.en.join('\n'), evidenceTh: p.evidence?.th ?? '', evidenceEn: p.evidence?.en ?? '', resultsTh: p.results.th, resultsEn: p.results.en,
  learningsTh: p.learnings.th, learningsEn: p.learnings.en, coverImage: p.coverImage ?? '', demoUrl: p.demoUrl ?? '', repoUrl: p.repoUrl ?? '', status: p.status,
})
const rowToProject = (row: unknown): Project => {
  const value = row as Record<string, unknown>
  return {
    ...(value as unknown as Project),
    summary: value.summary as Project['summary'] ?? undefined,
    evidence: value.evidence as Project['evidence'] ?? undefined,
    coverImage: value.cover_image as string | undefined,
    demoUrl: value.demo_url as string | undefined,
    repoUrl: value.repo_url as string | undefined,
  }
}

export default function Admin() {
  const { lang } = usePreferences()
  const [session, setSession] = useState<Session | null>(null)
  const [items, setItems] = useState<Project[]>([])
  const [editing, setEditing] = useState<FormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session || !supabase) return
    setLoading(true); setError('')
    supabase.from('projects').select('*').order('year', { ascending: false }).then(({ data, error: resultError }) => {
      if (resultError) setError(resultError.message)
      else setItems((data ?? []).map(rowToProject))
      setLoading(false)
    })
  }, [session])

  if (!isSupabaseConfigured || !session) return <SignIn lang={lang} />
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editing || !supabase) return
    setBusy(true); setError(''); setMessage('')
    const parsed = projectSchema.safeParse(editing)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Please check the form.'); setBusy(false); return }
    const v = parsed.data
    const row = {
      id: v.id, title: { th: v.titleTh, en: v.titleEn }, summary: { th: v.summaryTh, en: v.summaryEn }, description: { th: v.descriptionTh, en: v.descriptionEn },
      problem: { th: v.problemTh, en: v.problemEn }, role: { th: v.roleTh, en: v.roleEn }, process: { th: lines(v.processTh), en: lines(v.processEn) },
      decisions: { th: lines(v.decisionsTh), en: lines(v.decisionsEn) }, evidence: { th: v.evidenceTh, en: v.evidenceEn }, results: { th: v.resultsTh, en: v.resultsEn },
      learnings: { th: v.learningsTh, en: v.learningsEn }, tags: v.tags.split(',').map(s => s.trim()).filter(Boolean), year: v.year,
      cover_image: v.coverImage || null, demo_url: v.demoUrl || null, repo_url: v.repoUrl || null, status: v.status,
    }
    const { data, error: resultError } = await supabase.from('projects').upsert(row as never).select('*').single()
    if (resultError) setError(resultError.message)
    else { setItems(current => [rowToProject(data), ...current.filter(item => item.id !== v.id)]); setEditing(null); setMessage('Saved successfully.') }
    setBusy(false)
  }
  const remove = async (id: string) => {
    if (!supabase) return
    setBusy(true); setError(''); const { error: resultError } = await supabase.from('projects').delete().eq('id', id)
    if (resultError) setError(resultError.message); else { setItems(current => current.filter(item => item.id !== id)); setMessage('Deleted successfully.') }
    setBusy(false)
  }
  return <div className="py-8"><SEO title="Admin workspace" description="Private admin area." path="/admin" lang={lang} noindex />
    <div className="mb-8 flex items-center justify-between"><div><p className="text-sm text-violet-600">Admin workspace</p><h1 className="text-3xl font-bold">{lang === 'th' ? 'จัดการกรณีศึกษา' : 'Case-study manager'}</h1></div><button onClick={() => supabase?.auth.signOut()} className="inline-flex items-center gap-2 text-sm text-slate-500"><LogOut size={16} />Sign out</button></div>
    <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Editing the live <code>projects</code> schema. IDs are stable and required for public links.</p>
    {loading ? <p role="status">Loading projects…</p> : <><div className="mb-4 flex justify-end"><button onClick={() => { setEditing(blank); setError(''); setMessage('') }} className="ink-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"><Plus size={16} /> Add project</button></div>
      {editing && <ProjectForm value={editing} busy={busy} onChange={setEditing} onCancel={() => setEditing(null)} onSubmit={save} />}
      <div className="space-y-3">{items.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[.04]"><div><p className="font-semibold">{item.title.en} <span className="text-xs text-slate-400">#{item.id}</span></p><p className="text-sm text-slate-500">{item.year} · {item.status}</p></div><div className="flex gap-2"><button onClick={() => setEditing(projectToForm(item))} className="paper-button px-3 py-1.5 text-xs">Edit</button><button disabled={busy} onClick={() => remove(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button></div></div>)}</div></>}
    {message && <p role="status" className="mt-4 text-sm text-emerald-600">{message}</p>}{error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}
  </div>
}
const lines = (value: string) => value.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
function ProjectForm({ value, onChange, onCancel, onSubmit, busy }: { value: FormValues; onChange: (value: FormValues) => void; onCancel: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean }) {
  const field = (key: keyof FormValues, label: string, area = false) => <label className="text-sm font-medium">{label}{area ? <textarea value={value[key] as string} onChange={e => onChange({ ...value, [key]: e.target.value })} rows={3} /> : <input value={value[key] as string} onChange={e => onChange({ ...value, [key]: e.target.value })} />}</label>
  return <form onSubmit={onSubmit} className="mb-6 grid gap-4 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-5 dark:border-violet-400/20 dark:bg-violet-400/5 sm:grid-cols-2">{field('id', 'Stable ID')} {field('year', 'Year')} {field('titleTh', 'Title (ไทย)')} {field('titleEn', 'Title (English)')} {field('summaryTh', 'Summary (ไทย)', true)} {field('summaryEn', 'Summary (English)', true)} {field('descriptionTh', 'Description (ไทย)', true)} {field('descriptionEn', 'Description (English)', true)} {field('problemTh', 'Problem (ไทย)', true)} {field('problemEn', 'Problem (English)', true)} {field('roleTh', 'Role (ไทย)', true)} {field('roleEn', 'Role (English)', true)} {field('processTh', 'Process (ไทย, one per line)', true)} {field('processEn', 'Process (English, one per line)', true)} {field('decisionsTh', 'Decisions (ไทย, one per line)', true)} {field('decisionsEn', 'Decisions (English, one per line)', true)} {field('evidenceTh', 'Evidence (ไทย)', true)} {field('evidenceEn', 'Evidence (English)', true)} {field('resultsTh', 'Results (ไทย)', true)} {field('resultsEn', 'Results (English)', true)} {field('learningsTh', 'Learnings (ไทย)', true)} {field('learningsEn', 'Learnings (English)', true)} {field('tags', 'Tags (comma separated)')} {field('coverImage', 'Cover image path')} {field('demoUrl', 'Demo URL')} {field('repoUrl', 'Repository URL')}<label className="text-sm font-medium">Status<select value={value.status} onChange={e => onChange({ ...value, status: e.target.value as FormValues['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></label><div className="flex items-end gap-2"><button disabled={busy} className="ink-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"><Save size={16} />{busy ? 'Saving…' : 'Save'}</button><button type="button" onClick={onCancel} className="paper-button px-4 py-2 text-sm">Cancel</button></div></form>
}
function SignIn({ lang }: { lang: 'th' | 'en' }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  return <div className="mx-auto max-w-md py-24"><SEO title="Admin sign in" description="Private admin area." path="/admin" lang={lang} noindex /><h1 className="text-3xl font-bold">{lang === 'th' ? 'เข้าสู่ระบบผู้ดูแล' : 'Admin sign in'}</h1><p className="mt-3 text-sm text-slate-500">{!isSupabaseConfigured ? 'Preview/setup state: Supabase is not configured.' : 'Authorized editors only.'}</p>{isSupabaseConfigured && <form className="mt-8 space-y-4" onSubmit={async event => { event.preventDefault(); setError(''); const result = await supabase!.auth.signInWithPassword({ email, password }); if (result.error) setError(result.error.message) }}><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 dark:border-white/10 dark:bg-white/[.04]" /></label><label className="block text-sm font-medium">Password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 dark:border-white/10 dark:bg-white/[.04]" /></label>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<button className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-white dark:bg-white dark:text-ink">Sign in</button></form>}</div>
}
