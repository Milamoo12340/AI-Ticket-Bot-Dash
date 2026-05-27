export type StaffRole = 'admin' | 'moderator' | 'viewer'

export interface StaffUser {
  id: string
  username: string
  email: string
  password: string
  role: StaffRole
  avatar?: string
  createdAt: string
  lastLogin?: string
  active: boolean
}

export interface KnowledgeEntry {
  id: string
  title: string
  category: 'macro' | 'ahk' | 'roblox' | 'troubleshoot' | 'general' | 'link'
  content: string
  url?: string
  filename?: string
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SlashCommand {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  response?: string
  subcommands?: SlashSubcommand[]
  createdAt: string
}

export interface SlashSubcommand {
  name: string
  description: string
  response: string
}

export interface BotConfig {
  token: string
  clientId: string
  guildId: string
  webhookUrl: string
  ticketChannelId: string
  logChannelId: string
  supportRoleId: string
  prefix: string
  aiModel: string
  aiSystemPrompt: string
  maxTokensPerMessage: number
  escalationEnabled: boolean
  autoTagEnabled: boolean
  welcomeMessage: string
}

export interface Ticket {
  id: string
  ticketNumber: number
  userId: string
  username: string
  discriminator: string
  subject: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
  tags: string[]
}

export interface TicketMessage {
  id: string
  author: string
  isStaff: boolean
  content: string
  timestamp: string
}

export interface AIInstruction {
  id: string
  role: 'dev' | 'system'
  content: string
  timestamp: string
  author: string
}

export interface BotStats {
  totalUsers: number
  messagesHandled: number
  ticketsOpen: number
  ticketsResolved: number
  commandsUsed: number
  uptime: number
  aiResponsesToday: number
  topCommands: { name: string; count: number }[]
}
