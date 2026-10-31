import { Moon, Sun, Menu, X, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { copy } from '../i18n'
import { usePreferences } from '../store'
import { supabase } from '../lib/supabase'

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, theme, setLang, toggleTheme } = usePreferences()
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const location = useLocation()
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.classList.toggle('dark', theme === 'dark') }, [lang, theme])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)))
    return () => listener.subscription.unsubscribe()
  }, [])
  const nav = copy[lang].nav as string[]
  const paths = ['/', '/about', '/skills', '/projects', '/articles', '/timeline', '/contact']
  return <div className="min-h-screen bg-mist text-ink transition-colors dark:bg-[#211718] dark:text-[#fffaf2]">
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-burgundy/20 bg-mist/95 backdrop-blur dark:border-gold/20 dark:bg-[#211718]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="group flex items-center gap-2 font-semibold tracking-tight"><span className="grid h-8 w-8 rotate-[-6deg] place-items-center border-2 border-ink bg-gold text-sm shadow-[3px_3px_0_#7f2438] dark:border-[#fffaf2]">T</span><span>thanaphon<span className="text-burgundy dark:text-gold">.me</span></span></Link>
        <nav id="primary-navigation" aria-label="Primary navigation" className={`${open ? 'absolute left-4 right-4 top-16 flex' : 'hidden'} flex-col gap-1 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:border-white/10 dark:bg-slate-900/95 dark:md:bg-transparent`}>
          {nav.map((label, i) => <Link onClick={() => setOpen(false)} key={label} to={paths[i]} className={`rounded-full px-3 py-2 text-sm transition hover:bg-gold/20 hover:text-burgundy dark:hover:text-gold ${location.pathname === paths[i] ? 'bg-burgundy/10 font-semibold text-burgundy dark:bg-gold/15 dark:text-gold' : 'text-slate-600 dark:text-[#f3dfc5]'}`}>{label}</Link>)}
        </nav>
        <div className="flex items-center gap-1"><button aria-label="Toggle language" onClick={() => setLang(lang === 'th' ? 'en' : 'th')} className="rounded-full px-3 py-2 text-xs font-bold uppercase hover:bg-slate-200 dark:hover:bg-white/10">{lang === 'th' ? 'EN' : 'TH'}</button><button aria-label="Toggle theme" onClick={toggleTheme} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-white/10">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)} className="rounded-full p-2 md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8">{children}</main>
    <footer className="border-t-2 border-burgundy/15 px-5 py-8 dark:border-gold/20"><div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center text-sm text-slate-500"><span>© {new Date().getFullYear()} Thanaphon Kam-or · All rights reserved</span>{signedIn && <Link to="/admin" className="inline-flex items-center gap-1 hover:text-burgundy dark:hover:text-gold">{copy[lang].admin as string}<ArrowUpRight size={14} /></Link>}</div></footer>
  </div>
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="mb-10 flex items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-violet-600 dark:text-violet-300">{eyebrow}</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2></div>{action}</div> }
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`animate-fade-up ${className}`}>{children}</div> }
