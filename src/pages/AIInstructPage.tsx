import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, AlertCircle, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getAIInstructions, saveAIInstruction } from '@/lib/storage'
import { AIInstruction } from '@/types'
import { generateId, formatDate, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const AI_PRESETS = [
  { label: 'More Verbose', msg: 'Be more verbose and detailed in your explanations. Provide step-by-step breakdowns and include relevant AHK code examples when applicable.' },
  { label: 'Strict Debugging', msg: 'When debugging, always ask these questions first: 1) Display scale (must be 100%) 2) Admin mode 3) Laptop or Desktop 4) Fn Lock status 5) Roblox window mode & size.' },
  { label: 'Add Humor', msg: 'Add a small touch of friendly humor to your responses, but keep it professional and focused on solving the problem.' },
  { label: 'Reset Tone', msg: 'Reset to professional, neutral, and concise tone. Prioritize accuracy over personality.' },
  { label: 'Focus Roblox', msg: 'Prioritize Roblox-specific advice: window sizing, graphics settings, and game-specific macro behavior. Always mention Roblox settings as the first suspect.' },
  { label: 'Escalate Sooner', msg: 'After 2 failed troubleshooting attempts in a conversation, proactively suggest the user create a ticket for human support. Mention the /ticket command.' },
]

const AI_RESPONSES: Record<string, string> = {
  verbose: "Understood. I will now provide more detailed and verbose responses with complete step-by-step breakdowns and relevant AHK v2 code examples when troubleshooting issues.",
  strict: "Debug protocol updated. I will now always ask the 5 required diagnostic questions at the start of every troubleshooting session before suggesting any fixes.",
  humor: "Got it, boss! I'll sprinkle in some friendly banter while keeping the troubleshooting on point. No more robo-vibes! ...mostly.",
  reset: "Tone reset to default. Professional, neutral, and accurate responses from here on.",
  roblox: "Focus updated. Roblox settings will be the first line of inquiry — window mode, graphics level, display scale. On it.",
  escalate: "Escalation threshold updated. After 2 failed troubleshooting rounds, I will proactively recommend creating a ticket via /ticket.",
}

function simulateAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('verbose')) return AI_RESPONSES.verbose
  if (lower.includes('debug') || lower.includes('question')) return AI_RESPONSES.strict
  if (lower.includes('humor') || lower.includes('funny')) return AI_RESPONSES.humor
  if (lower.includes('reset') || lower.includes('neutral')) return AI_RESPONSES.reset
  if (lower.includes('roblox') || lower.includes('focus')) return AI_RESPONSES.roblox
  if (lower.includes('escalat')) return AI_RESPONSES.escalate
  if (lower.includes('hello') || lower.includes('hi ')) return "Hello, developer! I'm PsychoBot, ready for your instructions. What behavior would you like to adjust?"
  if (lower.includes('ahk') || lower.includes('autohotkey')) return "Acknowledged. My AHK v2 knowledge base is active. I have access to the full AHK v2 documentation including functions, directives, hotkeys, and common v1→v2 migration issues."
  if (lower.includes('add') && lower.includes('response')) return "Understood. To add specific responses, I recommend adding them to the Knowledge Base for persistent storage. For temporary behavior changes, just instruct me directly here."
  return `Instruction received and logged. I'll adjust my behavior accordingly: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}". This will apply to all future interactions until changed.`
}

export default function AIInstructPage() {
  const user = useAuthStore((s) => s.user)
  const [instructions, setInstructions] = useState<AIInstruction[]>(() => getAIInstructions())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const canInstruct = user?.role === 'admin' || user?.role === 'moderator'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [instructions])

  function sendMessage(text?: string) {
    const msg = text || input.trim()
    if (!msg || !canInstruct) return
    setInput('')
    setLoading(true)

    const devMsg: AIInstruction = {
      id: generateId(),
      role: 'dev',
      content: msg,
      timestamp: new Date().toISOString(),
      author: user?.username || 'Dev',
    }
    saveAIInstruction(devMsg)
    const updated = getAIInstructions()
    setInstructions([...updated])

    setTimeout(() => {
      const aiMsg: AIInstruction = {
        id: generateId(),
        role: 'system',
        content: simulateAIResponse(msg),
        timestamp: new Date().toISOString(),
        author: 'PsychoBot',
      }
      saveAIInstruction(aiMsg)
      setInstructions(getAIInstructions())
      setLoading(false)
    }, 900)
  }

  function clearHistory() {
    localStorage.removeItem('ph_ai_instructions')
    setInstructions(getAIInstructions())
    toast.success('Instruction history cleared')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">AI Instructor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Direct PsychoBot's behavior, personality, and knowledge in real-time</p>
        </div>
        <button onClick={clearHistory} className="flex items-center gap-1.5 px-3 py-2 text-xs border border-cyber-border/40 text-slate-500 hover:text-cyber-red hover:border-cyber-red/30 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      {/* Presets */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 flex-wrap">
          {AI_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => canInstruct && sendMessage(p.msg)}
              disabled={!canInstruct}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyber-purple/5 border border-cyber-purple/20 text-cyber-purple/80 hover:bg-cyber-purple/10 hover:text-cyber-purple rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-3 h-3" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 rounded-xl bg-[#0d0d1a] border border-cyber-border/40 p-5 mb-4">
        {instructions.map((inst) => (
          <div key={inst.id} className={cn('flex gap-3', inst.role === 'dev' ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              inst.role === 'dev'
                ? 'bg-cyber-purple/20 border border-cyber-purple/30'
                : inst.role === 'system' && inst.author === 'system'
                ? 'bg-slate-700/50 border border-slate-600/30'
                : 'bg-cyber-cyan/10 border border-cyber-cyan/20'
            )}>
              {inst.role === 'dev'
                ? <User className="w-4 h-4 text-cyber-purple" />
                : <Bot className={cn('w-4 h-4', inst.author === 'system' ? 'text-slate-500' : 'text-cyber-cyan')} />
              }
            </div>

            {/* Bubble */}
            <div className={cn('flex-1 max-w-[80%] space-y-1', inst.role === 'dev' ? 'items-end flex flex-col' : '')}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">{inst.author}</span>
                <span className="text-[10px] text-slate-700">{formatDate(inst.timestamp)}</span>
              </div>
              <div className={cn(
                'px-4 py-3 rounded-xl text-sm leading-relaxed',
                inst.role === 'dev'
                  ? 'bg-cyber-purple/10 border border-cyber-purple/20 text-slate-200 rounded-tr-sm'
                  : inst.author === 'system'
                  ? 'bg-slate-800/50 border border-slate-700/30 text-slate-500 italic text-xs'
                  : 'bg-cyber-cyan/5 border border-cyber-cyan/15 text-slate-200 rounded-tl-sm'
              )}>
                {inst.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-cyber-cyan" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/15 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-cyber-cyan animate-spin" />
              <span className="text-xs text-slate-500 font-mono">PsychoBot processing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!canInstruct && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-yellow/5 border border-cyber-yellow/20 mb-3 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-cyber-yellow flex-shrink-0" />
          <p className="text-xs text-cyber-yellow/80">Moderator or Admin role required to send instructions to the AI.</p>
        </div>
      )}

      <div className="flex-shrink-0 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={!canInstruct || loading}
          placeholder={canInstruct ? "Instruct PsychoBot... (e.g. 'Be more concise' or 'Always mention admin mode first')" : "Read-only — insufficient permissions"}
          className="flex-1 px-4 py-3 bg-[#0d0d1a] border border-cyber-border/40 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || !canInstruct || loading}
          className="w-12 h-12 rounded-xl bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
