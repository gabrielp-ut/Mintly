import { NavLink, Outlet } from 'react-router-dom'
import Icon from '../components/Icon'
import { useFinance } from '../context/FinanceContext'

export default function AppLayout() {
  const { t, language, session, signOut, syncStatus, errorMessage } = useFinance()
  const items = [
    ['/', 'home', t.nav.home], ['/expenses','expenses',t.nav.expenses], ['/savings','savings',t.nav.savings], ['/settings','settings',t.nav.settings]
  ]
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand brand-image"><img src="/images/mintly-wordmark.png" alt="Mintly" width="1600" height="600" /></div>
      <nav>{items.map(([to,icon,label])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'nav-link active':'nav-link'}><Icon name={icon}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-account"><span className="sidebar-email">{session?.user?.email || (language==='es'?'Modo local':'Local mode')}</span><span className="sync-label">{syncStatus === 'synced' ? (language==='es'?'● Sincronizado':'● Synced') : syncStatus === 'syncing' ? (language==='es'?'↻ Sincronizando':'↻ Syncing') : syncStatus === 'error' ? (language==='es'?'! Error de sincronización':'! Sync error') : '● Local'}</span>{session && <button className="sidebar-signout" onClick={signOut}>{language==='es'?'Cerrar sesión':'Sign out'}</button>}</div>
    </aside>
    <main className="main-content">{errorMessage&&<p className="error-banner" role="alert">{errorMessage}</p>}<Outlet /></main>
    <nav className="mobile-nav">{items.map(([to,icon,label])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'mobile-link active':'mobile-link'}><Icon name={icon}/><span>{label}</span></NavLink>)}</nav>
  </div>
}
