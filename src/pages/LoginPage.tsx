import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Cpu, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import heroBanner from '@/assets/hero-banner.jpg'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user, initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const result = login(username, password)
      if (result) {
        toast.success(`Welcome back, ${result.username}!`)
        navigate('/')
      } else {
        toast.error('Invalid credentials. Check username and password.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex bg-[#080810]">
      {/* Left: Login Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 py-12 lg:px-16 relative z-10">
        {/* Glow bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/3 via-transparent to-cyber-green/3 pointer-events-none" />

        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center shadow-cyber-cyan">
              <Cpu className="w-6 h-6 text-cyber-cyan" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-wide">PsychoHatcher</div>
              <div className="text-xs font-mono text-cyber-cyan/60 uppercase tracking-widest">Bot Dashboard v2.0</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Login</h1>
          <p className="mt-1 text-sm text-slate-500">Access the bot management console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username or Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="PsychoAdmin"
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d1a] border border-cyber-border/60 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/50 focus:shadow-cyber-cyan transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[#0d0d1a] border border-cyber-border/60 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/50 focus:shadow-cyber-cyan transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/40 hover:border-cyber-cyan/60 text-cyber-cyan font-semibold rounded-lg transition-all duration-200 shadow-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 rounded-lg bg-[#0d0d1a] border border-cyber-border/40">
          <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wider">Demo Credentials</div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex gap-3">
              <span className="text-cyber-cyan w-20">Admin:</span>
              <span className="text-slate-300">PsychoAdmin / admin1234</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyber-green w-20">Mod:</span>
              <span className="text-slate-300">ModSupport / mod1234</span>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-400 w-20">Viewer:</span>
              <span className="text-slate-300">ViewerStaff / viewer1234</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src={heroBanner}
          alt="PsychoHatcher Bot"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#080810]/40 to-[#080810]" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 to-cyber-green/5" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <div className="text-3xl font-bold text-white mb-3">AHK Support Automation</div>
            <p className="text-slate-400 leading-relaxed">
              AI-powered Discord bot for PsychoHatcher & AHKVault — intelligent macro troubleshooting, 
              real-time debugging, and escalation management.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[['1.2K+', 'Users Served'], ['34K+', 'Messages'], ['98%', 'Resolution Rate']].map(([val, lab]) => (
                <div key={lab} className="p-3 rounded-lg bg-black/30 border border-cyber-cyan/10">
                  <div className="text-cyber-cyan font-bold text-lg">{val}</div>
                  <div className="text-slate-500 text-xs">{lab}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
