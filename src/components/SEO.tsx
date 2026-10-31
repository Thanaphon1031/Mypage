import { useEffect } from 'react'
import type { Lang } from '../types'

type Props = { title: string; description: string; path: string; lang: Lang; noindex?: boolean; type?: 'website' | 'article' }
export function SEO({ title, description, path, lang, noindex = false, type = 'website' }: Props) {
  useEffect(() => {
    const canonical = `${window.location.origin}${path}`
    document.title = title
    document.documentElement.lang = lang
    const set = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
      if (!el) { el = document.createElement(selector.startsWith('link') ? 'link' : 'meta') as HTMLMetaElement | HTMLLinkElement; document.head.appendChild(el) }
      Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
    }
    set('meta[name="description"]', { name: 'description', content: description })
    set('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow' })
    set('link[rel="canonical"]', { rel: 'canonical', href: canonical })
    set('meta[property="og:title"]', { property: 'og:title', content: title })
    set('meta[property="og:description"]', { property: 'og:description', content: description })
    set('meta[property="og:url"]', { property: 'og:url', content: canonical })
    set('meta[property="og:type"]', { property: 'og:type', content: type })
    set('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' })
    set('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    set('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    const id = 'page-jsonld'
    document.getElementById(id)?.remove()
    const script = document.createElement('script')
    script.id = id; script.type = 'application/ld+json'
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': type === 'article' ? 'Article' : 'Person', name: title, description, url: canonical })
    document.head.appendChild(script)
  }, [title, description, path, lang, noindex, type])
  return null
}
