import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import KnowledgeBasePage from '@/pages/KnowledgeBasePage'
import BotConfigPage from '@/pages/BotConfigPage'
import SlashCommandsPage from '@/pages/SlashCommandsPage'
import AIInstructPage from '@/pages/AIInstructPage'
import TicketsPage from '@/pages/TicketsPage'
import StaffPage from '@/pages/StaffPage'
import NotFound from '@/pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d0d1a',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#e2e8f0',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="knowledge" element={<KnowledgeBasePage />} />
          <Route path="config" element={<BotConfigPage />} />
          <Route path="commands" element={<SlashCommandsPage />} />
          <Route path="ai-instruct" element={<AIInstructPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="staff" element={<StaffPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
