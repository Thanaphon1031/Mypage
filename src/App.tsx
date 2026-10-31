import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import Home from './pages/Home'
const About = lazy(() => import('./pages/Pages').then(m => ({ default: m.About })))
const Skills = lazy(() => import('./pages/Pages').then(m => ({ default: m.Skills })))
const Projects = lazy(() => import('./pages/Pages').then(m => ({ default: m.Projects })))
const ProjectDetail = lazy(() => import('./pages/Pages').then(m => ({ default: m.ProjectDetail })))
const Articles = lazy(() => import('./pages/Pages').then(m => ({ default: m.Articles })))
const ArticleDetail = lazy(() => import('./pages/Pages').then(m => ({ default: m.ArticleDetail })))
const Timeline = lazy(() => import('./pages/Pages').then(m => ({ default: m.Timeline })))
const Contact = lazy(() => import('./pages/Pages').then(m => ({ default: m.Contact })))
const NotFound = lazy(() => import('./pages/Pages').then(m => ({ default: m.NotFound })))
const Admin = lazy(() => import('./pages/Admin'))
export default function App() { return <ErrorBoundary><Layout><Suspense fallback={<div className="grid min-h-[50vh] place-items-center text-slate-400" role="status">Loading…</div>}><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/skills" element={<Skills />} /><Route path="/projects" element={<Projects />} /><Route path="/projects/:id" element={<ProjectDetail />} /><Route path="/articles" element={<Articles />} /><Route path="/articles/:id" element={<ArticleDetail />} /><Route path="/timeline" element={<Timeline />} /><Route path="/contact" element={<Contact />} /><Route path="/admin" element={<Admin />} /><Route path="*" element={<NotFound />} /></Routes></Suspense></Layout></ErrorBoundary> }
