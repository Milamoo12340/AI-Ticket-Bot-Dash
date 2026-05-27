import { useNavigate } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center grid-bg">
      <div className="text-center">
        <div className="text-8xl font-mono font-bold text-cyber-cyan/20 mb-4">404</div>
        <AlertTriangle className="w-10 h-10 text-cyber-yellow mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">The route you requested doesn't exist in this system.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan font-medium rounded-lg transition-all mx-auto"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
