import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, Edit2, ExternalLink, BookOpen, Upload, X, Save, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { getKnowledge, saveKnowledgeEntry, deleteKnowledgeEntry } from '@/lib/storage'
import { KnowledgeEntry } from '@/types'
import { generateId, formatRelative, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const CATEGORIES = ['all', 'macro', 'ahk', 'roblox', 'troubleshoot', 'general', 'link'] as const
const categoryColors: Record<string, string> = {
  macro: 'bg-cyber-purple/10 text-cyber-purple border-cyber-purple/20',
  ahk: 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20',
  roblox: 'bg-cyber-green/10 text-cyber-green border-cyber-green/20',
  troubleshoot: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/20',
  general: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
  link: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const blank = (): KnowledgeEntry => ({
  id: generateId(),
  title: '',
  category: 'general',
  content: '',
  url: '',
  tags: [],
  createdBy: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function KnowledgeBasePage() {
  const user = useAuthStore((s) => s.user)
  const [entries, setEntries] = useState<KnowledgeEntry[]>(() => getKnowledge())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null)
  const [tagInput, setTagInput] = useState('')
  const canEdit = user?.role === 'admin' || user?.role === 'moderator'

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchCat = category === 'all' || e.category === category
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [entries, search, category])

  function openNew() {
    setEditing({ ...blank(), createdBy: user?.username || 'unknown' })
    setTagInput('')
  }

  function openEdit(entry: KnowledgeEntry) {
    setEditing({ ...entry })
    setTagInput('')
  }

  function handleSave() {
    if (!editing) return
    if (!editing.title.trim()) { toast.error('Title is required'); return }
    if (!editing.content.trim()) { toast.error('Content is required'); return }
    const updated = { ...editing, updatedAt: new Date().toISOString() }
    saveKnowledgeEntry(updated)
    setEntries(getKnowledge())
    setEditing(null)
    toast.success('Knowledge entry saved!')
  }

  function handleDelete(id: string) {
    deleteKnowledgeEntry(id)
    setEntries(getKnowledge())
    toast.success('Entry deleted')
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim() && editing) {
      const tag = tagInput.trim().toLowerCase()
      if (!editing.tags.includes(tag)) {
        setEditing({ ...editing, tags: [...editing.tags, tag] })
      }
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-0.5">{entries.length} entries · AI training data, macros, docs, and links</p>
        </div>
        {canEdit && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, content, or tag..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1a] border border-cyber-border/40 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-2 text-xs font-mono uppercase rounded-lg border transition-all',
                category === cat
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40'
                  : 'bg-transparent text-slate-500 border-cyber-border/30 hover:border-cyber-cyan/20 hover:text-slate-300'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((entry) => (
          <div key={entry.id} className="p-4 rounded-xl bg-[#0d0d1a] border border-cyber-border/40 hover:border-cyber-cyan/20 transition-all group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase', categoryColors[entry.category])}>
                    {entry.category}
                  </span>
                  <h3 className="text-sm font-semibold text-white truncate">{entry.title}</h3>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(entry)} className="w-7 h-7 rounded border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="w-7 h-7 rounded border border-cyber-red/20 flex items-center justify-center text-cyber-red/60 hover:text-cyber-red hover:border-cyber-red/40 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line">
              {entry.content}
            </p>

            {entry.url && (
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink className="w-3 h-3" />
                {entry.url.length > 50 ? entry.url.substring(0, 50) + '...' : entry.url}
              </a>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] bg-black/30 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                    #{tag}
                  </span>
                ))}
                {entry.tags.length > 4 && <span className="text-[10px] text-slate-600">+{entry.tags.length - 4}</span>}
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">{formatRelative(entry.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">No entries found. Try a different search or category.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d1a] border border-cyber-cyan/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-cyber-cyan">
            <div className="sticky top-0 bg-[#0d0d1a] border-b border-cyber-border/40 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-sm font-bold text-white">{editing.id ? 'Edit Entry' : 'New Knowledge Entry'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Title *</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  placeholder="Entry title..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as KnowledgeEntry['category'] })}
                    className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  >
                    {['macro', 'ahk', 'roblox', 'troubleshoot', 'general', 'link'].map((c) => (
                      <option key={c} value={c} className="bg-[#0d0d1a]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">URL (optional)</label>
                  <input
                    value={editing.url || ''}
                    onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Content *</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all resize-none font-mono"
                  placeholder="Enter knowledge content, instructions, or documentation..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tags (press Enter to add)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-black/30 border border-cyber-border/40 rounded-lg min-h-[2.5rem]">
                  {editing.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-[11px] bg-cyber-cyan/10 text-cyber-cyan px-2 py-0.5 rounded border border-cyber-cyan/20">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    className="flex-1 min-w-[100px] bg-transparent outline-none text-xs text-white placeholder-slate-600"
                    placeholder="add-tag..."
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#0d0d1a] border-t border-cyber-border/40 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
                <Save className="w-4 h-4" />
                Save Entry
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-transparent border border-cyber-border/40 text-slate-400 text-sm rounded-lg hover:border-cyber-border/60 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
