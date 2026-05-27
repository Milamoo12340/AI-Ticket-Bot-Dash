import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, X, Save, Terminal, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { getCommands, saveCommand, deleteCommand } from '@/lib/storage'
import { SlashCommand } from '@/types'
import { generateId, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const blank = (): SlashCommand => ({
  id: generateId(),
  name: '',
  description: '',
  category: 'General',
  enabled: true,
  response: '',
  createdAt: new Date().toISOString(),
})

export default function SlashCommandsPage() {
  const user = useAuthStore((s) => s.user)
  const [commands, setCommands] = useState<SlashCommand[]>(() => getCommands())
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<SlashCommand | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const canEdit = user?.role === 'admin' || user?.role === 'moderator'

  const filtered = useMemo(
    () => commands.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())),
    [commands, search]
  )

  const categories = [...new Set(commands.map((c) => c.category))]

  function toggleEnabled(cmd: SlashCommand) {
    if (!canEdit) return
    const updated = { ...cmd, enabled: !cmd.enabled }
    saveCommand(updated)
    setCommands(getCommands())
    toast.success(`/${cmd.name} ${updated.enabled ? 'enabled' : 'disabled'}`)
  }

  function handleSave() {
    if (!editing) return
    if (!editing.name.match(/^[a-z0-9-]+$/)) { toast.error('Command name must be lowercase letters, numbers, or hyphens only'); return }
    if (!editing.description.trim()) { toast.error('Description required'); return }
    saveCommand(editing)
    setCommands(getCommands())
    setEditing(null)
    toast.success(`/${editing.name} saved!`)
  }

  function handleDelete(id: string, name: string) {
    deleteCommand(id)
    setCommands(getCommands())
    toast.success(`/${name} deleted`)
  }

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = filtered.filter((c) => c.category === cat)
    return acc
  }, {} as Record<string, SlashCommand[]>)

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Slash Commands</h1>
          <p className="text-xs text-slate-500 mt-0.5">{commands.length} commands · {commands.filter((c) => c.enabled).length} enabled</p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(blank())} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
            <Plus className="w-4 h-4" />
            New Command
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1a] border border-cyber-border/40 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
        />
      </div>

      {/* Command Groups */}
      {Object.entries(grouped).map(([cat, cmds]) => cmds.length === 0 ? null : (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">{cat}</span>
            <div className="flex-1 h-px bg-cyber-border/30" />
            <span className="text-[10px] text-slate-600">{cmds.length}</span>
          </div>
          <div className="space-y-2">
            {cmds.map((cmd) => (
              <div key={cmd.id} className="rounded-xl bg-[#0d0d1a] border border-cyber-border/40 overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => setExpanded(expanded === cmd.id ? null : cmd.id)}
                >
                  <Terminal className={cn('w-4 h-4 flex-shrink-0', cmd.enabled ? 'text-cyber-cyan' : 'text-slate-600')} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-mono font-semibold', cmd.enabled ? 'text-white' : 'text-slate-500')}>
                        /{cmd.name}
                      </span>
                      <span className="text-[10px] bg-black/30 text-slate-500 px-1.5 py-0.5 rounded font-mono">{cmd.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{cmd.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => toggleEnabled(cmd)}
                          className={cn('transition-colors', cmd.enabled ? 'text-cyber-cyan hover:text-cyber-cyan/70' : 'text-slate-600 hover:text-slate-400')}
                        >
                          {cmd.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setEditing({ ...cmd })} className="w-7 h-7 rounded border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(cmd.id, cmd.name)} className="w-7 h-7 rounded border border-cyber-red/20 flex items-center justify-center text-cyber-red/60 hover:text-cyber-red hover:border-cyber-red/40 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <ChevronDown className={cn('w-4 h-4 text-slate-600 transition-transform', expanded === cmd.id && 'rotate-180')} />
                  </div>
                </div>

                {expanded === cmd.id && cmd.response && (
                  <div className="px-4 pb-4 border-t border-cyber-border/20">
                    <div className="mt-3 p-3 rounded-lg bg-black/30 font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {cmd.response}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d1a] border border-cyber-cyan/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-cyber-cyan">
            <div className="sticky top-0 bg-[#0d0d1a] border-b border-cyber-border/40 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-sm font-bold text-white font-mono">
                {editing.name ? `Edit /${editing.name}` : 'New Slash Command'}
              </h2>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Command Name *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">/</span>
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full pl-6 pr-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-cyan/40 transition-all"
                      placeholder="command-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
                  <input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                    placeholder="General"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Description *</label>
                <input
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  placeholder="What does this command do?"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Response / Bot Reply</label>
                <textarea
                  value={editing.response || ''}
                  onChange={(e) => setEditing({ ...editing, response: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-cyan/40 transition-all resize-none"
                  placeholder="Bot response... (supports Discord markdown: **bold**, `code`, > blockquote)"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing({ ...editing, enabled: !editing.enabled })}
                  className={cn('flex items-center gap-2 text-sm transition-colors', editing.enabled ? 'text-cyber-cyan' : 'text-slate-500')}
                >
                  {editing.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {editing.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#0d0d1a] border-t border-cyber-border/40 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
                <Save className="w-4 h-4" />
                Save Command
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-cyber-border/40 text-slate-400 text-sm rounded-lg hover:border-cyber-border/60 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
