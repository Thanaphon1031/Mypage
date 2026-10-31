import { describe, expect, it } from 'vitest'
import { articles, profile, projects } from './data'

describe('portfolio content', () => {
  it('contains bilingual profile metadata', () => {
    expect(profile.name.th).toBeTruthy()
    expect(profile.name.en).toBeTruthy()
    expect(profile.studentId).toBe('69011211031')
  })
  it('has usable project and article records', () => {
    expect(projects.length).toBeGreaterThan(0)
    expect(articles.every(article => article.title.th && article.title.en)).toBe(true)
  })
})
