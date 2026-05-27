import { useMemo } from 'react'
import {
  Users, MessageSquare, Ticket, CheckCircle, Terminal, Clock,
  Bot, TrendingUp, AlertTriangle, Activity,
} from 'lucide-react'
import { getBotStats, getTickets } from '@/lib/storage'
import { formatUptime, formatRelative } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'

const activityData = [
  { time: '00:00', msgs: 12, tickets: 1 },
  { time: '04:00', msgs: 5, tickets: 0 },
  { time: '08:00', msgs: 45, tickets: 3 },
  { time: '12:00', msgs: 89, tickets: 7 },
  { time: '16:00', msgs: 134, tickets: 12 },
  { time: '20:00', msgs: 98, tickets: 8 },
  { time: 'Now', msgs: 67, tickets: 5 },
]

export default function DashboardPage() {
  const stats = useMemo(() => getBotStats(), [])
  const tickets = useMemo(() => getTickets(), [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'cyan', trend: '+12%' },
    { label: 'Messages Handled', value: stats.messagesHandled.toLocaleString(), icon: MessageSquare, color: 'green', trend: '+8%' },
    { label: 'Open Tickets', value: stats.ticketsOpen, icon: Ticket, color: 'yellow', trend: null },
    { label: 'Resolved Tickets', value: stats.ticketsResolved, icon: CheckCircle, color: 'green', trend: '+5%' },
    { label: 'Commands Used', value: stats.commandsUsed.toLocaleString(), icon: Terminal, color: 'cyan', trend: '+15%' },
    { label: 'Uptime', value: formatUptime(stats.uptime), icon: Clock, color: 'green', trend: null },
    { label: 'AI Responses Today', value: stats.aiResponsesToday, icon: Bot, color: 'purple', trend: '+22%' },
    { label: 'Avg Response Time', value: '1.2s', icon: Activity, color: 'cyan', trend: '-0.3s' },
  ]

  const colorMap: Record<string, string> = {
    cyan: 'text-cyber-cyan border-cyber-cyan/20 bg-cyber-cyan/5',
    green: 'text-cyber-green border-cyber-green/20 bg-cyber-green/5',
    yellow: 'text-cyber-yellow border-cyber-yellow/20 bg-cyber-yellow/5',
    purple: 'text-cyber-purple border-cyber-purple/20 bg-cyber-purple/5',
  }

  const recentTickets = tickets.slice(0, 5)

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-[#0d0d1a] border border-cyber-border/40 hover:border-cyber-cyan/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon className="w-4 h-4" />
              </div>
              {card.trend && (
                <span className="text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-1.5 py-0.5 rounded">
                  {card.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white font-mono">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Activity — Last 24h</h2>
              <p className="text-xs text-slate-500 mt-0.5">Messages & ticket volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan" />Messages
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyber-yellow" />Tickets
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={activityData}>
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="msgs" stroke="#00d4ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tickets" stroke="#ffaa00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Commands */}
        <div className="p-5 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Top Commands</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most used slash commands</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.topCommands} layout="vertical">
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#00d4ff" fillOpacity={0.7} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="p-5 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
            <a href="/tickets" className="text-xs text-cyber-cyan hover:text-cyber-cyan/80 transition-colors">View all →</a>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-cyber-border/20 hover:border-cyber-cyan/15 transition-all">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  ticket.status === 'open' ? 'bg-cyber-yellow' :
                  ticket.status === 'in-progress' ? 'bg-cyber-cyan' :
                  ticket.status === 'resolved' ? 'bg-cyber-green' : 'bg-slate-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate font-medium">#{ticket.ticketNumber} {ticket.subject}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{ticket.username} · {formatRelative(ticket.createdAt)}</div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                  ticket.priority === 'high' || ticket.priority === 'critical' ? 'bg-cyber-red/10 text-cyber-red' :
                  ticket.priority === 'medium' ? 'bg-cyber-yellow/10 text-cyber-yellow' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="p-5 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">System Status</h2>
            <span className="text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/20">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Discord Bot Connection', status: 'online', latency: '42ms' },
              { name: 'AI Engine', status: 'online', latency: '120ms' },
              { name: 'Knowledge Base', status: 'online', latency: '8ms' },
              { name: 'Webhook Relay', status: 'online', latency: '55ms' },
              { name: 'Ticket System', status: 'online', latency: '15ms' },
              { name: 'Staff Auth', status: 'online', latency: '5ms' },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-green shadow-cyber-green flex-shrink-0" />
                  <span className="text-sm text-slate-300">{svc.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">{svc.latency}</span>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div className="mt-4 p-3 rounded-lg bg-cyber-yellow/5 border border-cyber-yellow/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-cyber-yellow flex-shrink-0 mt-0.5" />
            <p className="text-xs text-cyber-yellow/80">
              Add your bot token in <strong>Bot Config</strong> to connect to Discord and go live.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
