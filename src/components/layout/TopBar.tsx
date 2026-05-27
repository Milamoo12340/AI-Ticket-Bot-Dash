import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Bell, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Overview & live stats' },
  '/knowledge': { title: 'Knowledge Base', sub: 'Manage AI training content & docs' },
  '/commands': { title: 'Slash Commands', sub: 'Edit bot commands & responses' },
  '/ai-instruct': { title: 'AI Instructor', sub: 'Direct instructions & behavior tuning' },
  '/tickets': { title: 'Support Tickets', sub: 'Manage user escalations' },
  '/config': { title: 'Bot Configuration', sub: 'Token, webhooks, channels & settings' },
  '/staff': { title: 'Staff Management', sub: 'Manage dashboard users & roles' },
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const page = pageTitles[location.pathname] || { title: 'Dashboard', sub: '' }

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-cyber-border/40 bg-[#0a0a14]/80 backdrop-blur-sm flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-mono">PsychoBot</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-sm font-semibold text-white">{page.title}</span>
        {page.sub && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500 hidden sm:block">{page.sub}</span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-8 h-8 rounded-lg border border-cyber-border/40 flex items-center justify-center hover:border-cyber-cyan/30 hover:bg-cyber-cyan/5 transition-all">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-red rounded-full border border-[#080810] text-[8px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyber-border/40 bg-white/3">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            user?.role === 'admin' ? 'bg-cyber-cyan' :
            user?.role === 'moderator' ? 'bg-cyber-green' : 'bg-slate-500'
          )} />
          <span className="text-xs text-slate-300 font-medium">{user?.username}</span>
          <span className={cn(
            'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded',
            user?.role === 'admin' ? 'bg-cyber-cyan/10 text-cyber-cyan' :
            user?.role === 'moderator' ? 'bg-cyber-green/10 text-cyber-green' :
            'bg-slate-500/10 text-slate-400'
          )}>
            {user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg border border-cyber-border/40 flex items-center justify-center hover:border-cyber-red/40 hover:bg-cyber-red/5 hover:text-cyber-red text-slate-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
