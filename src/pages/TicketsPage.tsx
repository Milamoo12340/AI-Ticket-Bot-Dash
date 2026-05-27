import { useState, useMemo } from 'react'
import { Search, MessageSquare, Clock, ChevronRight, Send, X, User, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { getTickets, saveTicket, addTicketMessage } from '@/lib/storage'
import { Ticket, TicketMessage } from '@/types'
import { generateId, formatRelative, formatDate, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const STATUS_COLORS: Record<string, string> = {
  'open': 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/20',
  'in-progress': 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20',
  'resolved': 'bg-cyber-green/10 text-cyber-green border-cyber-green/20',
  'closed': 'bg-slate-700/50 text-slate-400 border-slate-600/30',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-cyber-yellow',
  high: 'text-cyber-red',
  critical: 'text-cyber-red font-bold',
}

export default function TicketsPage() {
  const user = useAuthStore((s) => s.user)
  const [tickets, setTickets] = useState<Ticket[]>(() => getTickets())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const canEdit = user?.role === 'admin' || user?.role === 'moderator'

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = filterStatus === 'all' || t.status === filterStatus
      const matchSearch = !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.username.toLowerCase().includes(search.toLowerCase()) ||
        String(t.ticketNumber).includes(search)
      return matchStatus && matchSearch
    })
  }, [tickets, search, filterStatus])

  function updateStatus(ticket: Ticket, status: Ticket['status']) {
    if (!canEdit) return
    const updated = { ...ticket, status, updatedAt: new Date().toISOString() }
    saveTicket(updated)
    const all = getTickets()
    setTickets(all)
    if (selected?.id === ticket.id) setSelected(updated)
    toast.success(`Ticket #${ticket.ticketNumber} marked as ${status}`)
  }

  function sendReply() {
    if (!reply.trim() || !selected || !canEdit) return
    const msg: TicketMessage = {
      id: generateId(),
      author: user?.username || 'Staff',
      isStaff: true,
      content: reply.trim(),
      timestamp: new Date().toISOString(),
    }
    addTicketMessage(selected.id, msg)
    const all = getTickets()
    setTickets(all)
    const updatedTicket = all.find((t) => t.id === selected.id)
    if (updatedTicket) setSelected(updatedTicket)
    setReply('')
    toast.success('Reply sent')
  }

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    'in-progress': tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)] animate-fadeUp">
      {/* Left: Ticket List */}
      <div className={cn('flex flex-col', selected ? 'w-96 flex-shrink-0' : 'flex-1')}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">Support Tickets</h1>
            <p className="text-xs text-slate-500 mt-0.5">{counts.open} open · {counts['in-progress']} in progress</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1a] border border-cyber-border/40 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-3 py-1.5 text-xs font-mono rounded-lg border transition-all',
                  filterStatus === status
                    ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40'
                    : 'text-slate-500 border-cyber-border/30 hover:border-cyber-cyan/20'
                )}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelected(ticket)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                selected?.id === ticket.id
                  ? 'bg-cyber-cyan/5 border-cyber-cyan/30'
                  : 'bg-[#0d0d1a] border-cyber-border/40 hover:border-cyber-cyan/15'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">#{ticket.ticketNumber}</span>
                  <span className="text-sm font-medium text-white truncate">{ticket.subject}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border', STATUS_COLORS[ticket.status])}>
                  {ticket.status}
                </span>
                <span className={cn('text-[10px] font-mono', PRIORITY_COLORS[ticket.priority])}>
                  {ticket.priority}
                </span>
                <span className="text-[10px] text-slate-600">{ticket.username}</span>
                <span className="text-[10px] text-slate-700 ml-auto">{formatRelative(ticket.updatedAt)}</span>
              </div>
              {ticket.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {ticket.tags.map((tag) => (
                    <span key={tag} className="text-[9px] bg-black/30 text-slate-600 px-1.5 py-0.5 rounded font-mono">#{tag}</span>
                  ))}
                </div>
              )}
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Ticket Detail */}
      {selected && (
        <div className="flex-1 flex flex-col bg-[#0d0d1a] rounded-xl border border-cyber-border/40 overflow-hidden">
          {/* Ticket Header */}
          <div className="p-5 border-b border-cyber-border/40 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500">#{selected.ticketNumber}</span>
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border', STATUS_COLORS[selected.status])}>
                    {selected.status}
                  </span>
                  <span className={cn('text-[10px] font-mono', PRIORITY_COLORS[selected.priority])}>
                    ⬆ {selected.priority}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-white">{selected.subject}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selected.username}#{selected.discriminator} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Actions */}
            {canEdit && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {(['open', 'in-progress', 'resolved', 'closed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected, s)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-mono rounded border transition-all',
                      selected.status === s
                        ? STATUS_COLORS[s]
                        : 'border-cyber-border/30 text-slate-600 hover:border-cyber-border/50 hover:text-slate-400'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected.messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.isStaff ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                  msg.isStaff
                    ? 'bg-cyber-cyan/10 border border-cyber-cyan/20'
                    : 'bg-slate-700/50 border border-slate-600/30'
                )}>
                  {msg.isStaff
                    ? (msg.author === 'PsychoBot' ? <Bot className="w-4 h-4 text-cyber-cyan" /> : <span className="text-cyber-cyan text-[10px]">{msg.author[0]}</span>)
                    : <User className="w-4 h-4 text-slate-400" />
                  }
                </div>
                <div className={cn('flex-1 max-w-[75%]', msg.isStaff && 'flex flex-col items-end')}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-mono', msg.isStaff ? 'text-cyber-cyan/70' : 'text-slate-500')}>{msg.author}</span>
                    <span className="text-[10px] text-slate-700">{formatRelative(msg.timestamp)}</span>
                  </div>
                  <div className={cn(
                    'px-4 py-3 rounded-xl text-sm leading-relaxed',
                    msg.isStaff
                      ? 'bg-cyber-cyan/5 border border-cyber-cyan/15 text-slate-200 rounded-tr-sm'
                      : 'bg-black/30 border border-cyber-border/30 text-slate-300 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          {canEdit && (
            <div className="p-4 border-t border-cyber-border/40 flex gap-3 flex-shrink-0">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="Reply to this ticket..."
                className="flex-1 px-4 py-2.5 bg-black/30 border border-cyber-border/40 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
              />
              <button
                onClick={sendReply}
                disabled={!reply.trim()}
                className="w-10 h-10 rounded-xl bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
