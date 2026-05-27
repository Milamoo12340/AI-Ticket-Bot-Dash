import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, ShieldCheck, Shield, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getUsers, saveUsers } from '@/lib/auth'
import { StaffUser, StaffRole } from '@/types'
import { generateId, formatDate, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const ROLES: { value: StaffRole; label: string; icon: typeof ShieldCheck; color: string; desc: string }[] = [
  { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-cyber-cyan', desc: 'Full access — config, staff, knowledge, commands' },
  { value: 'moderator', label: 'Moderator', icon: Shield, color: 'text-cyber-green', desc: 'Tickets, knowledge base, slash commands (no config)' },
  { value: 'viewer', label: 'Viewer', icon: Eye, color: 'text-slate-400', desc: 'Read-only dashboard access' },
]

const blank = (): Omit<StaffUser, 'id' | 'createdAt'> => ({
  username: '',
  email: '',
  password: '',
  role: 'viewer',
  active: true,
})

export default function StaffPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<StaffUser[]>(() => getUsers())
  const [editing, setEditing] = useState<(Omit<StaffUser, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) | null>(null)
  const [showPass, setShowPass] = useState(false)

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 text-cyber-red/40 mx-auto mb-3" />
          <h2 className="text-white font-semibold">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">Admin role required to manage staff.</p>
        </div>
      </div>
    )
  }

  function handleSave() {
    if (!editing) return
    if (!editing.username.trim()) { toast.error('Username required'); return }
    if (!editing.email.trim()) { toast.error('Email required'); return }
    if (!editing.password.trim()) { toast.error('Password required'); return }

    const all = getUsers()
    if (editing.id) {
      const idx = all.findIndex((u) => u.id === editing.id)
      if (idx >= 0) all[idx] = { ...all[idx], ...editing } as StaffUser
    } else {
      all.push({ ...editing, id: generateId(), createdAt: new Date().toISOString() } as StaffUser)
    }
    saveUsers(all)
    setUsers(getUsers())
    setEditing(null)
    toast.success(editing.id ? 'Staff member updated!' : 'Staff member added!')
  }

  function toggleActive(id: string) {
    const all = getUsers()
    const user = all.find((u) => u.id === id)
    if (user) {
      if (user.id === currentUser?.id) { toast.error("Can't deactivate your own account"); return }
      user.active = !user.active
      saveUsers(all)
      setUsers(getUsers())
      toast.success(`Account ${user.active ? 'activated' : 'deactivated'}`)
    }
  }

  function handleDelete(id: string) {
    if (id === currentUser?.id) { toast.error("Can't delete your own account"); return }
    const all = getUsers().filter((u) => u.id !== id)
    saveUsers(all)
    setUsers(getUsers())
    toast.success('Staff member removed')
  }

  const roleInfo = (role: StaffRole) => ROLES.find((r) => r.value === role)!

  return (
    <div className="space-y-5 animate-fadeUp max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">{users.length} staff members · {users.filter((u) => u.active).length} active</p>
        </div>
        <button onClick={() => setEditing(blank())} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role.value).length
          return (
            <div key={role.value} className="p-4 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
              <div className="flex items-center gap-2 mb-2">
                <role.icon className={cn('w-4 h-4', role.color)} />
                <span className={cn('text-sm font-semibold', role.color)}>{role.label}</span>
                <span className="ml-auto font-mono text-lg font-bold text-white">{count}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{role.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Staff Table */}
      <div className="rounded-xl bg-[#0d0d1a] border border-cyber-border/40 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyber-border/40">
              {['User', 'Email', 'Role', 'Last Login', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/20">
            {users.map((u) => {
              const role = roleInfo(u.role)
              return (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', `bg-${u.role === 'admin' ? 'cyber-cyan' : u.role === 'moderator' ? 'cyber-green' : 'slate-600'}/10 border border-${u.role === 'admin' ? 'cyber-cyan' : u.role === 'moderator' ? 'cyber-green' : 'slate-600'}/20`)}>
                        <span className={role.color}>{u.username[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{u.username}</div>
                        {u.id === currentUser?.id && <div className="text-[10px] text-cyber-cyan/60 font-mono">YOU</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <role.icon className={cn('w-3.5 h-3.5', role.color)} />
                      <span className={cn('text-xs font-mono', role.color)}>{role.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u.id)}
                      className={cn(
                        'text-[10px] font-mono px-2 py-0.5 rounded border transition-all',
                        u.active
                          ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/20 hover:bg-cyber-green/5'
                          : 'bg-cyber-red/10 text-cyber-red border-cyber-red/20 hover:bg-cyber-red/5'
                      )}
                    >
                      {u.active ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => { setEditing({ ...u }); setShowPass(false) }} className="w-7 h-7 rounded border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded border border-cyber-red/20 flex items-center justify-center text-cyber-red/60 hover:text-cyber-red hover:border-cyber-red/40 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d1a] border border-cyber-cyan/20 rounded-2xl w-full max-w-md shadow-cyber-cyan">
            <div className="border-b border-cyber-border/40 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">{editing.id ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Username</label>
                <input value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all" placeholder="JohnDoe" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all" placeholder="staff@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={editing.password}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
                    {showPass ? 'hide' : 'show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Role</label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setEditing({ ...editing, role: role.value })}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                        editing.role === role.value
                          ? 'border-cyber-cyan/30 bg-cyber-cyan/5'
                          : 'border-cyber-border/30 hover:border-cyber-border/50'
                      )}
                    >
                      <role.icon className={cn('w-4 h-4 flex-shrink-0', role.color)} />
                      <div>
                        <div className={cn('text-sm font-medium', role.color)}>{role.label}</div>
                        <div className="text-[11px] text-slate-500">{role.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-cyber-border/40 px-6 py-4 flex gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
                <Save className="w-4 h-4" />
                Save
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
