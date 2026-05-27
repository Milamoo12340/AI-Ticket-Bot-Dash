import { KnowledgeEntry, SlashCommand, BotConfig, Ticket, AIInstruction, BotStats, TicketMessage } from '@/types'
import { generateId } from '@/lib/utils'

const KEYS = {
  knowledge: 'ph_knowledge',
  commands: 'ph_commands',
  config: 'ph_bot_config',
  tickets: 'ph_tickets',
  aiInstructions: 'ph_ai_instructions',
}

function get<T>(key: string): T[] {
  const d = localStorage.getItem(key)
  return d ? JSON.parse(d) : []
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// --- Knowledge Base ---
export function getKnowledge(): KnowledgeEntry[] {
  const data = get<KnowledgeEntry>(KEYS.knowledge)
  if (data.length === 0) {
    const seed = seedKnowledge()
    set(KEYS.knowledge, seed)
    return seed
  }
  return data
}

export function saveKnowledgeEntry(entry: KnowledgeEntry): void {
  const all = getKnowledge()
  const idx = all.findIndex((k) => k.id === entry.id)
  if (idx >= 0) all[idx] = entry
  else all.unshift(entry)
  set(KEYS.knowledge, all)
}

export function deleteKnowledgeEntry(id: string): void {
  const all = getKnowledge().filter((k) => k.id !== id)
  set(KEYS.knowledge, all)
}

// --- Slash Commands ---
export function getCommands(): SlashCommand[] {
  const data = get<SlashCommand>(KEYS.commands)
  if (data.length === 0) {
    const seed = seedCommands()
    set(KEYS.commands, seed)
    return seed
  }
  return data
}

export function saveCommand(cmd: SlashCommand): void {
  const all = getCommands()
  const idx = all.findIndex((c) => c.id === cmd.id)
  if (idx >= 0) all[idx] = cmd
  else all.unshift(cmd)
  set(KEYS.commands, all)
}

export function deleteCommand(id: string): void {
  const all = getCommands().filter((c) => c.id !== id)
  set(KEYS.commands, all)
}

// --- Bot Config ---
export function getBotConfig(): BotConfig {
  const d = localStorage.getItem(KEYS.config)
  if (d) return JSON.parse(d)
  const defaultConfig: BotConfig = {
    token: '',
    clientId: '',
    guildId: '',
    webhookUrl: '',
    ticketChannelId: '',
    logChannelId: '',
    supportRoleId: '',
    prefix: '/',
    aiModel: 'gpt-4o',
    aiSystemPrompt: `You are PsychoBot, an expert AI assistant for PsychoHatcher and AHKVault — AHK-based macro programs for Roblox. Your role is to help users troubleshoot why their macros are not working. You have deep expertise in:
- AutoHotkey v2 scripting, syntax, and common errors
- Roblox window sizing, screen resolution, and display scaling (must be 100%)
- Common macro issues: F-key activation (Fn lock), admin mode requirements, graphics settings
- Computer-specific quirks (laptops vs desktops, GPU drivers, refresh rate)
- PsychoHatcher and AHKVault program specifics
Always ask clarifying questions: screen resolution, display scale %, whether they launched as admin, their computer type (laptop/desktop), and what exactly happens vs what they expect.`,
    maxTokensPerMessage: 2048,
    escalationEnabled: true,
    autoTagEnabled: true,
    welcomeMessage: 'Welcome to PsychoHatcher support! Use /help to see available commands or describe your issue.',
  }
  localStorage.setItem(KEYS.config, JSON.stringify(defaultConfig))
  return defaultConfig
}

export function saveBotConfig(config: BotConfig): void {
  localStorage.setItem(KEYS.config, JSON.stringify(config))
}

// --- Tickets ---
export function getTickets(): Ticket[] {
  const data = get<Ticket>(KEYS.tickets)
  if (data.length === 0) {
    const seed = seedTickets()
    set(KEYS.tickets, seed)
    return seed
  }
  return data
}

export function saveTicket(ticket: Ticket): void {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticket.id)
  if (idx >= 0) all[idx] = ticket
  else all.unshift(ticket)
  set(KEYS.tickets, all)
}

export function addTicketMessage(ticketId: string, msg: TicketMessage): void {
  const all = getTickets()
  const ticket = all.find((t) => t.id === ticketId)
  if (ticket) {
    ticket.messages.push(msg)
    ticket.updatedAt = new Date().toISOString()
    set(KEYS.tickets, all)
  }
}

// --- AI Instructions ---
export function getAIInstructions(): AIInstruction[] {
  const data = get<AIInstruction>(KEYS.aiInstructions)
  if (data.length === 0) {
    const seed: AIInstruction[] = [
      {
        id: generateId(),
        role: 'system',
        content: 'PsychoBot initialized. AI assistant is active and ready. System prompt loaded from Bot Config.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        author: 'system',
      },
    ]
    set(KEYS.aiInstructions, seed)
    return seed
  }
  return data
}

export function saveAIInstruction(inst: AIInstruction): void {
  const all = getAIInstructions()
  all.push(inst)
  set(KEYS.aiInstructions, all)
}

// --- Stats ---
export function getBotStats(): BotStats {
  return {
    totalUsers: 1247,
    messagesHandled: 34892,
    ticketsOpen: getTickets().filter((t) => t.status === 'open' || t.status === 'in-progress').length,
    ticketsResolved: getTickets().filter((t) => t.status === 'resolved').length,
    commandsUsed: 8432,
    uptime: 864000,
    aiResponsesToday: 312,
    topCommands: [
      { name: '/help', count: 2341 },
      { name: '/debug', count: 1892 },
      { name: '/resolution', count: 1234 },
      { name: '/ticket', count: 987 },
      { name: '/ahk', count: 765 },
    ],
  }
}

// --- Seed Data ---
function seedKnowledge(): KnowledgeEntry[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      title: 'Screen Resolution & Display Scale Requirements',
      category: 'troubleshoot',
      content: `CRITICAL: Display scale MUST be set to 100% for macros to work correctly.
Steps to fix:
1. Right-click Desktop → Display Settings
2. Scroll to "Scale and Layout"
3. Set "Change the size of text, apps, and other items" to 100%
4. Reboot PC
5. Set Roblox window to 1920x1080 or match macro's target resolution
Common resolutions: 1920x1080 (Full HD), 2560x1440 (QHD), 3840x2160 (4K - use 100% scale or macro will misclick)`,
      tags: ['resolution', 'display', 'scale', '100%', 'critical'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Admin Mode — Running AHKVault & Macros as Administrator',
      category: 'troubleshoot',
      content: `Many macros require Administrator privileges to send input to Roblox.
How to run as Admin:
1. Right-click AHKVault.exe → "Run as administrator"
2. OR: Right-click → Properties → Compatibility → Check "Run this program as an administrator"
3. Do the same for AutoHotkey.exe if running scripts directly
Note: If Roblox runs as a standard user and AHK runs as admin, UAC elevation can block input. Run both at the same privilege level.`,
      tags: ['admin', 'administrator', 'uac', 'ahkvault', 'permissions'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Fn Key Issues — F1-F12 Not Triggering Macros',
      category: 'troubleshoot',
      content: `On many laptops, F1-F12 keys are media keys by default and require Fn+F1 to act as F1.
Fix options:
1. Fn Lock: Press Fn+Esc (or Fn+F Lock key) to toggle Fn Lock ON — now F1-F12 work as standard function keys
2. BIOS/UEFI: Boot into BIOS → Find "Function Key Behavior" → Set to "Function Key" (not "Multimedia Key")
3. Check your laptop brand:
   - Lenovo: Fn+Esc toggles Fn Lock
   - HP: Fn+Num Lock or Fn+Shift
   - ASUS: Fn+F11 or BIOS setting
   - Dell: Fn+Esc
   - MSI: Fn+F7 or BIOS
Do NOT hold Fn while pressing F-keys unless your laptop requires it.`,
      tags: ['fn', 'function key', 'f1', 'laptop', 'keyboard', 'fn lock'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Roblox Window Size Configuration',
      category: 'roblox',
      content: `Roblox must be in windowed mode at the correct size.
Steps:
1. Open Roblox Settings (Esc in game) → Graphics
2. Set to Windowed mode (NOT fullscreen, NOT borderless)
3. Set window size to match macro target (usually 1920x1080 or 1366x768)
4. Drag window to top-left corner of screen (0,0 position) if macro uses absolute coordinates
5. Do NOT resize Roblox window while macro is running
Borderless Fullscreen: Some macros support this — check the specific macro documentation.`,
      tags: ['roblox', 'window', 'windowed', 'size', 'resolution'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Graphics Settings for Macro Accuracy',
      category: 'roblox',
      content: `Correct graphics settings prevent visual mismatch errors in pixel-detection macros.
Recommended settings in Roblox:
- Graphics Quality: Level 1-3 (lower = more consistent colors)
- Disable Post-Processing effects if possible
- Turn OFF: Depth of Field, Bloom, Shadows (if macro is using color detection)
- Terrain quality: Low
In Windows:
- Disable Hardware Accelerated GPU Scheduling if macros are stuttering
- Set Power Plan to "High Performance" or "Ultimate Performance"
- Disable G-Sync/FreeSync — use fixed refresh rate`,
      tags: ['graphics', 'roblox', 'settings', 'performance', 'color detection'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'AHK v2 — Basic Script Structure Reference',
      category: 'ahk',
      content: `AutoHotkey v2 script basics for debugging user scripts:
Hotkey syntax:
  F1:: { ... }           ; F1 triggers code block
  ^F1:: { ... }          ; Ctrl+F1
  !F1:: { ... }          ; Alt+F1
  +F1:: { ... }          ; Shift+F1
  #F1:: { ... }          ; Win+F1

Click and send:
  Click(x, y)            ; Click at coordinates
  Send("{Enter}")         ; Send Enter key
  Send("text here")       ; Type text
  MouseMove(x, y)         ; Move mouse

Image/pixel search:
  PixelGetColor(x, y)     ; Get color at pixel
  ImageSearch(&ox, &oy, x1, y1, x2, y2, "image.png")

Common errors:
  - Script not running as admin → use #Requires AutoHotkey v2 at top
  - Wrong coordinates → display scale not 100%
  - Hotkey not firing → Fn Lock issue or hotkey conflict`,
      tags: ['ahk', 'ahkv2', 'autohotkey', 'scripting', 'reference'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'PsychoHatcher — Common Launch Issues',
      category: 'macro',
      content: `PsychoHatcher specific troubleshooting:
Won't launch:
- Missing AHK v2 installation → Download from autohotkey.com
- Not running as Admin → Right-click → Run as administrator
- Antivirus blocking → Add exception for PsychoHatcher folder
- Wrong AHK version (v1 vs v2) → PsychoHatcher requires AHK v2

Macro starts but nothing happens:
- Check display scale (must be 100%)
- Check Roblox window is in focus
- Verify Roblox window size matches config
- F-key not registering → Fn Lock issue (see Fn Key article)

Color detection failing:
- In-game graphics too high → Lower to Level 1-3
- Bloom/post-processing on → Disable in Roblox settings
- Wrong monitor if multiple displays → Drag Roblox to primary monitor`,
      tags: ['psychohatcher', 'launch', 'troubleshoot', 'won\'t start'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'AHK v2 Official Documentation',
      category: 'link',
      content: 'Official AutoHotkey v2 documentation — covers all built-in functions, commands, directives, and examples.',
      url: 'https://www.autohotkey.com/docs/v2/',
      tags: ['ahk', 'documentation', 'official', 'v2'],
      createdBy: 'PsychoAdmin',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function seedCommands(): SlashCommand[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      name: 'help',
      description: 'Show all available commands and support options',
      category: 'General',
      enabled: true,
      response: "**PsychoHatcher Bot Help**\n\nAvailable commands:\n`/help` - Show this message\n`/debug` - Start a debug session with AI\n`/resolution` - Fix screen resolution issues\n`/fnkey` - Fix Fn key / F1-F12 issues\n`/admin` - How to run as Administrator\n`/roblox` - Roblox window setup guide\n`/ticket` - Create a support ticket\n`/macro [name]` - Get info about a specific macro",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'debug',
      description: 'Start an AI-powered debug session for your macro issue',
      category: 'Support',
      enabled: true,
      response: "**Debug Session Started** 🔧\n\nI'll help you figure out why your macro isn't working. Please tell me:\n1. Which macro/program are you using? (PsychoHatcher / AHKVault)\n2. What happens when you try to start it?\n3. What were you expecting to happen?\n4. Laptop or Desktop?\n5. Your screen resolution and display scale %",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'resolution',
      description: 'Guide for fixing screen resolution and display scale issues',
      category: 'Troubleshoot',
      enabled: true,
      response: "**Screen Resolution Fix** 🖥️\n\n⚠️ Display scale MUST be **100%**\n\n**Steps:**\n1. Right-click Desktop → Display Settings\n2. Set Scale to **100%**\n3. Reboot your PC\n4. Set Roblox to Windowed mode at correct resolution\n\nStill not working? Use `/ticket` to escalate.",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'fnkey',
      description: 'Fix F1-F12 function key issues on laptops',
      category: 'Troubleshoot',
      enabled: true,
      response: "**Fn Key Fix** ⌨️\n\nOn laptops, F1-F12 may be media keys by default.\n\n**Quick fix:** Press `Fn + Esc` to toggle Fn Lock\n\n**By brand:**\n• Lenovo: `Fn + Esc`\n• HP: `Fn + Num Lock`\n• ASUS: `Fn + F11` or BIOS\n• Dell: `Fn + Esc`\n• MSI: `Fn + F7` or BIOS\n\n**Do NOT hold Fn** while pressing F-keys after enabling Fn Lock.",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'admin',
      description: 'Instructions for running macros in Administrator mode',
      category: 'Troubleshoot',
      enabled: true,
      response: "**Run as Administrator** 🔐\n\n1. Right-click **AHKVault.exe** → **Run as administrator**\n2. Or: Properties → Compatibility → ✅ Run as administrator\n3. Do the same for **AutoHotkey.exe** if running scripts directly\n\n⚠️ Make sure Roblox and AHK run at the **same privilege level**.",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'ticket',
      description: 'Create a human support ticket for complex issues',
      category: 'Support',
      enabled: true,
      response: "**Creating Support Ticket** 🎫\n\nPlease provide:\n• Your username\n• Which program (PsychoHatcher/AHKVault)\n• Detailed description of the issue\n• What you've already tried\n\nA staff member will respond shortly.",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'macro',
      description: 'Get information and debug help for a specific macro',
      category: 'Support',
      enabled: true,
      response: "**Macro Info** 📜\n\nPlease specify which macro you're using and I'll pull up its documentation and common issues.",
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'roblox',
      description: 'Roblox window and graphics setup guide',
      category: 'Troubleshoot',
      enabled: true,
      response: "**Roblox Setup Guide** 🎮\n\n1. Set Roblox to **Windowed** mode (not Fullscreen)\n2. Match window size to macro requirements\n3. Drag window to **top-left** of screen\n4. Graphics: Set to **Level 1-3**\n5. Disable: Bloom, Depth of Field, Shadows\n6. Use **primary monitor** only",
      createdAt: now,
    },
  ]
}

function seedTickets(): Ticket[] {
  const now = new Date()
  return [
    {
      id: generateId(),
      ticketNumber: 1001,
      userId: 'user_abc123',
      username: 'xX_MacroKing_Xx',
      discriminator: '4521',
      subject: 'PsychoHatcher F1 key not working on ASUS laptop',
      description: "I press F1 but the macro doesn't start. Im on an ASUS laptop.",
      status: 'open',
      priority: 'high',
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000).toISOString(),
      tags: ['fn-key', 'laptop', 'asus'],
      messages: [
        {
          id: generateId(),
          author: 'xX_MacroKing_Xx',
          isStaff: false,
          content: "I press F1 but the macro doesn't start. Im on an ASUS laptop. Tried everything.",
          timestamp: new Date(now.getTime() - 3600000).toISOString(),
        },
        {
          id: generateId(),
          author: 'PsychoBot',
          isStaff: true,
          content: "Hi! On ASUS laptops, try pressing Fn+F11 to toggle Fn Lock, or check your BIOS. Also make sure AHKVault is running as Administrator. What's your display scale set to?",
          timestamp: new Date(now.getTime() - 3500000).toISOString(),
        },
      ],
    },
    {
      id: generateId(),
      ticketNumber: 1002,
      userId: 'user_def456',
      username: 'RobloxGrinder99',
      discriminator: '7823',
      subject: 'Macro clicking wrong spots — 4K monitor',
      description: 'Running on 4K display. Macro is clicking in wrong positions.',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'ModSupport',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000).toISOString(),
      tags: ['resolution', '4k', 'misclick'],
      messages: [
        {
          id: generateId(),
          author: 'RobloxGrinder99',
          isStaff: false,
          content: 'Running on a 4K monitor and the macro keeps clicking in the wrong places.',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
        },
        {
          id: generateId(),
          author: 'PsychoBot',
          isStaff: true,
          content: "Classic 4K scaling issue! Your display scale is likely set to 150-200%. Go to Display Settings and set Scale to **100%**, then reboot. On 4K monitors this makes everything smaller but is required for accurate macro clicking.",
          timestamp: new Date(now.getTime() - 86000000).toISOString(),
        },
        {
          id: generateId(),
          author: 'RobloxGrinder99',
          isStaff: false,
          content: "Set it to 100% but now everything is tiny. Is there no other way?",
          timestamp: new Date(now.getTime() - 7200000).toISOString(),
        },
      ],
    },
    {
      id: generateId(),
      ticketNumber: 1003,
      userId: 'user_ghi789',
      username: 'AHKNewbie2024',
      discriminator: '1234',
      subject: 'Script error on line 5 — unexpected token',
      description: 'Getting an AHK v2 error when I try to run my custom script.',
      status: 'resolved',
      priority: 'low',
      assignedTo: 'PsychoAdmin',
      createdAt: new Date(now.getTime() - 172800000).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString(),
      tags: ['ahk', 'script-error', 'syntax'],
      messages: [
        {
          id: generateId(),
          author: 'AHKNewbie2024',
          isStaff: false,
          content: "Error: line 5 unexpected token '=='. My script: if (var == 1)",
          timestamp: new Date(now.getTime() - 172800000).toISOString(),
        },
        {
          id: generateId(),
          author: 'PsychoBot',
          isStaff: true,
          content: "In AHK v2, use `=` for string comparison and `==` only for case-sensitive string comparison. For numbers use `=`. Try: `if (var = 1)`. Also make sure you have `#Requires AutoHotkey v2.0` at the top of your script.",
          timestamp: new Date(now.getTime() - 172700000).toISOString(),
        },
        {
          id: generateId(),
          author: 'AHKNewbie2024',
          isStaff: false,
          content: "That fixed it! Thanks so much!",
          timestamp: new Date(now.getTime() - 86500000).toISOString(),
        },
        {
          id: generateId(),
          author: 'PsychoAdmin',
          isStaff: true,
          content: "Glad it's working! Marking as resolved. Feel free to open a new ticket if you run into more issues.",
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
        },
      ],
    },
  ]
}
