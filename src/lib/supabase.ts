import { createClient } from '@supabase/supabase-js'
import type { Bilingual, LocalizedList, TimelineItem } from '../types'

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string; title: Bilingual; summary: Bilingual | null; description: Bilingual; problem: Bilingual
          role: Bilingual; process: LocalizedList; decisions: LocalizedList; evidence: Bilingual | null
          results: Bilingual; learnings: Bilingual; tags: string[]; year: string; cover_image: string | null
          demo_url: string | null; repo_url: string | null; status: 'draft' | 'published'; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      contact_messages: {
        Row: { id: string; name: string; email: string; message: string; status: 'new' | 'read' | 'archived'; created_at: string }
        Insert: { name: string; email: string; message: string }
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']> & { status?: 'new' | 'read' | 'archived' }
      }
      skills: {
        Row: { id: string; name: Bilingual; capability: Bilingual | null; workflow: Bilingual | null; evidence: Bilingual | null; tools: string[]; group_name: string | null; level: number | null }
        Insert: Omit<Database['public']['Tables']['skills']['Row'], never>
        Update: Partial<Database['public']['Tables']['skills']['Insert']>
      }
      articles: {
        Row: { id: string; title: Bilingual; excerpt: Bilingual | null; date: string | null; read_time: number | null; tags: string[]; status: 'draft' | 'published' }
        Insert: Omit<Database['public']['Tables']['articles']['Row'], never>
        Update: Partial<Database['public']['Tables']['articles']['Insert']>
      }
      timeline: {
        Row: { id: string; year: string; title: Bilingual; body: Bilingual | null; type: TimelineItem['type'] }
        Insert: Omit<Database['public']['Tables']['timeline']['Row'], never>
        Update: Partial<Database['public']['Tables']['timeline']['Insert']>
      }
    }
  }
}
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase = url && key ? createClient<Database>(url, key) : null
export const isSupabaseConfigured = Boolean(supabase)
export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
export const turnstileFunctionUrl = supabase ? `${url}/functions/v1/verify-turnstile` : undefined
