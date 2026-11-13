import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Savings from './pages/Savings'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { useFinance } from './context/FinanceContext'

export default function App() {
  const { isSupabaseConfigured, session, authLoading, cloudLoading, syncStatus, errorMessage, loadFromCloud } = useFinance()

  if (isSupabaseConfigured && authLoading) return <div className="loading-screen">Conectando de forma segura…</div>
  if (isSupabaseConfigured && !session) return <Auth />

  if (cloudLoading) return <div className="loading-screen"><div>{syncStatus === 'error' ? <><p role="alert">{errorMessage}</p><button className="button primary" onClick={loadFromCloud}>Reintentar / Retry</button></> : 'Cargando datos… / Loading data…'}</div></div>

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
