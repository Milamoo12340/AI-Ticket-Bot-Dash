import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Terminal,
  Bot,
  Ticket,
  Users,
  Cpu,
  Circle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'KB' },
  { to: '/commands', label: 'Slash Commands', icon: Terminal },
  { to: '/ai-instruct', label: 'AI Instructor', icon: Bot },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/config', label: 'Bot Config', icon: Settings },
  { to: '/staff', label: 'Staff', icon: Users, adminOnly: true },
]

export default function Sidebar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0a0a14] border-r border-cyber-border/40 relative overflow-hidden">
      {/* Glow line */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyber-cyan/30 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="p-5 border-b border-cyber-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wide">PsychoHatcher</div>
            <div className="text-[10px] text-cyber-cyan/70 font-mono uppercase tracking-widest">Bot Dashboard</div>
          </div>
        </div>

        {/* Bot status indicator */}
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
          </span>
          <span className="text-xs text-cyber-green font-mono">BOT ONLINE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyber-cyan rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-mono bg-cyber-cyan/10 text-cyber-cyan/70 px-1.5 py-0.5 rounded border border-cyber-cyan/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-cyber-border/40">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/3">
          <div className="w-7 h-7 rounded-full bg-cyber-purple/30 border border-cyber-purple/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-cyber-purple uppercase">
              {user?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user?.username}</div>
            <div className={cn(
              'text-[10px] font-mono uppercase tracking-wider',
              user?.role === 'admin' ? 'text-cyber-cyan' :
              user?.role === 'moderator' ? 'text-cyber-green' : 'text-slate-500'
            )}>
              {user?.role}
            </div>
          </div>
          <Circle className="w-2 h-2 text-cyber-green fill-cyber-green flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
