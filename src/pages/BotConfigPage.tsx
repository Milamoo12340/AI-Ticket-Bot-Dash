import { useState } from 'react'
import { Save, Eye, EyeOff, AlertTriangle, CheckCircle, Info, Webhook, Hash, Key, Bot, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { getBotConfig, saveBotConfig } from '@/lib/storage'
import { BotConfig } from '@/types'
import { maskToken, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const sections = [
  { id: 'connection', label: 'Connection', icon: Key },
  { id: 'channels', label: 'Channels & Roles', icon: Hash },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'behavior', label: 'Bot Behavior', icon: Settings },
]

export default function BotConfigPage() {
  const user = useAuthStore((s) => s.user)
  const [config, setConfig] = useState<BotConfig>(() => getBotConfig())
  const [showToken, setShowToken] = useState(false)
  const [activeSection, setActiveSection] = useState('connection')
  const isAdmin = user?.role === 'admin'

  function handleSave() {
    if (!isAdmin) { toast.error('Only admins can save bot configuration'); return }
    saveBotConfig(config)
    toast.success('Bot configuration saved!')
  }

  function set(key: keyof BotConfig, value: string | number | boolean) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass = "w-full px-3 py-2.5 bg-black/30 border border-cyber-border/40 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
  const labelClass = "text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block"
  const fieldGroup = "space-y-1.5"

  return (
    <div className="space-y-5 animate-fadeUp max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Bot Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">Discord token, webhooks, channels, AI settings, and behavior</p>
        </div>
        {isAdmin && (
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium rounded-lg transition-all">
            <Save className="w-4 h-4" />
            Save Config
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-cyber-yellow/5 border border-cyber-yellow/20">
          <AlertTriangle className="w-4 h-4 text-cyber-yellow flex-shrink-0" />
          <p className="text-xs text-cyber-yellow/80">You have read-only access. Admin role required to modify bot configuration.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Section Nav */}
        <div className="space-y-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left',
                activeSection === sec.id
                  ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <sec.icon className="w-4 h-4 flex-shrink-0" />
              {sec.label}
            </button>
          ))}
        </div>

        {/* Config Form */}
        <div className="lg:col-span-3 p-6 rounded-xl bg-[#0d0d1a] border border-cyber-border/40">
          {/* Connection */}
          {activeSection === 'connection' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <Key className="w-4 h-4 text-cyber-cyan" />
                <h2 className="text-sm font-semibold text-white">Discord Connection</h2>
              </div>

              <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/15 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Get your bot token from <strong className="text-cyan-400">discord.com/developers/applications</strong> → Your App → Bot → Reset Token.
                  Never share your token publicly.
                </p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Bot Token *</label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.token}
                    onChange={(e) => set('token', e.target.value)}
                    disabled={!isAdmin}
                    placeholder="MTxxxxxxx.Gxxxxx.xxxxxxxxxxxx"
                    className={inputClass + ' pr-10 font-mono text-xs'}
                  />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {config.token && <p className="text-[10px] text-slate-600 font-mono">Saved: {maskToken(config.token)}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={fieldGroup}>
                  <label className={labelClass}>Client / Application ID</label>
                  <input value={config.clientId} onChange={(e) => set('clientId', e.target.value)} disabled={!isAdmin} placeholder="123456789012345678" className={inputClass + ' font-mono text-xs'} />
                </div>
                <div className={fieldGroup}>
                  <label className={labelClass}>Guild / Server ID</label>
                  <input value={config.guildId} onChange={(e) => set('guildId', e.target.value)} disabled={!isAdmin} placeholder="123456789012345678" className={inputClass + ' font-mono text-xs'} />
                </div>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Webhook URL</label>
                <input
                  value={config.webhookUrl}
                  onChange={(e) => set('webhookUrl', e.target.value)}
                  disabled={!isAdmin}
                  placeholder="https://discord.com/api/webhooks/..."
                  className={inputClass}
                />
                <p className="text-[10px] text-slate-600">Used for internal notifications and bot events logging</p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Command Prefix</label>
                <input value={config.prefix} onChange={(e) => set('prefix', e.target.value)} disabled={!isAdmin} placeholder="/" className={cn(inputClass, 'w-24')} />
              </div>
            </div>
          )}

          {/* Channels */}
          {activeSection === 'channels' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <Hash className="w-4 h-4 text-cyber-cyan" />
                <h2 className="text-sm font-semibold text-white">Channels & Roles</h2>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Ticket Channel ID</label>
                <input value={config.ticketChannelId} onChange={(e) => set('ticketChannelId', e.target.value)} disabled={!isAdmin} placeholder="123456789012345678" className={inputClass + ' font-mono text-xs'} />
                <p className="text-[10px] text-slate-600">Channel where new ticket threads are created</p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Log Channel ID</label>
                <input value={config.logChannelId} onChange={(e) => set('logChannelId', e.target.value)} disabled={!isAdmin} placeholder="123456789012345678" className={inputClass + ' font-mono text-xs'} />
                <p className="text-[10px] text-slate-600">Channel for bot activity and error logging</p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Support Role ID</label>
                <input value={config.supportRoleId} onChange={(e) => set('supportRoleId', e.target.value)} disabled={!isAdmin} placeholder="123456789012345678" className={inputClass + ' font-mono text-xs'} />
                <p className="text-[10px] text-slate-600">Role that can be pinged on ticket escalation</p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Welcome Message</label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => set('welcomeMessage', e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeSection === 'ai' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <Bot className="w-4 h-4 text-cyber-cyan" />
                <h2 className="text-sm font-semibold text-white">AI Configuration</h2>
              </div>

              <div className="p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/15 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  This bot uses its own integrated AI engine — it does NOT depend on user OnSpace tokens, ensuring the bot always responds to users.
                </p>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>AI Model</label>
                <select value={config.aiModel} onChange={(e) => set('aiModel', e.target.value)} disabled={!isAdmin} className={inputClass}>
                  {['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'claude-3-5-sonnet', 'gemini-2.5-pro'].map((m) => (
                    <option key={m} value={m} className="bg-[#0d0d1a]">{m}</option>
                  ))}
                </select>
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>Max Tokens Per Message</label>
                <input
                  type="number"
                  value={config.maxTokensPerMessage}
                  onChange={(e) => set('maxTokensPerMessage', parseInt(e.target.value))}
                  disabled={!isAdmin}
                  min={256}
                  max={8192}
                  className={cn(inputClass, 'w-40')}
                />
              </div>

              <div className={fieldGroup}>
                <label className={labelClass}>AI System Prompt</label>
                <textarea
                  value={config.aiSystemPrompt}
                  onChange={(e) => set('aiSystemPrompt', e.target.value)}
                  disabled={!isAdmin}
                  rows={12}
                  className={inputClass + ' resize-none font-mono text-xs'}
                />
                <p className="text-[10px] text-slate-600">This is the base personality and instruction set for PsychoBot. Use AI Instructor tab for live additions.</p>
              </div>
            </div>
          )}

          {/* Behavior */}
          {activeSection === 'behavior' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-4 h-4 text-cyber-cyan" />
                <h2 className="text-sm font-semibold text-white">Bot Behavior</h2>
              </div>

              {[
                { key: 'escalationEnabled' as const, label: 'Ticket Escalation', desc: 'Allow users to escalate to human support via /ticket' },
                { key: 'autoTagEnabled' as const, label: 'Auto-Tag Issues', desc: 'Automatically tag tickets based on AI-detected issue type' },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-cyber-border/30">
                  <div>
                    <div className="text-sm font-medium text-white">{toggle.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{toggle.desc}</div>
                  </div>
                  <button
                    onClick={() => isAdmin && set(toggle.key, !config[toggle.key])}
                    disabled={!isAdmin}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-all duration-200 disabled:cursor-not-allowed',
                      config[toggle.key] ? 'bg-cyber-cyan/60' : 'bg-slate-700'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200',
                      config[toggle.key] && 'translate-x-5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
