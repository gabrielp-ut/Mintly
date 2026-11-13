import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'

export default function Auth() {
  const { signIn, signUp } = useFinance()
  const [language,setLanguage]=useState('es')
  const text=(es,en)=>language==='es'?es:en
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const action = mode === 'signin' ? signIn : signUp
    const { error, needsConfirmation } = await action(email.trim(), password)
    if (error) setMessage(error.message || String(error))
    else if (needsConfirmation) setMessage(text('Cuenta creada. Revisa tu correo y confirma el enlace antes de iniciar sesión.','Account created. Check your email and confirm the link before signing in.'))
    setBusy(false)
  }

  return (
    <div className="auth-screen">
      <svg className="auth-growth-art" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="auth-bar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#168461" stopOpacity=".13" />
            <stop offset="100%" stopColor="#168461" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="auth-growth-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#58b79a" stopOpacity=".08" />
            <stop offset="100%" stopColor="#168461" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <g fill="url(#auth-bar-fill)">
          <rect x="960" y="680" width="64" height="220" rx="20" />
          <rect x="1056" y="602" width="64" height="298" rx="20" />
          <rect x="1152" y="510" width="64" height="390" rx="20" />
          <rect x="1248" y="394" width="64" height="506" rx="20" />
          <rect x="1344" y="270" width="64" height="630" rx="20" />
        </g>
        <path d="M 830 830 C 950 820, 950 675, 1055 688 S 1175 625, 1235 520 S 1320 435, 1400 248" fill="none" stroke="url(#auth-growth-stroke)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="1400" cy="248" r="8" fill="#238866" opacity=".3" />
        <circle cx="100" cy="140" r="185" fill="none" stroke="#238866" strokeOpacity=".06" />
        <circle cx="100" cy="140" r="230" fill="none" stroke="#238866" strokeOpacity=".04" />
      </svg>
      <div className="auth-card"><div className="language-switch" role="group" aria-label={text('Escoger idioma','Choose language')}><button type="button" className={language==='es'?'active':''} aria-pressed={language==='es'} onClick={()=>setLanguage('es')}>Español</button><button type="button" className={language==='en'?'active':''} aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>English</button></div>
        <div className="auth-brand"><img className="auth-logo" src="/images/mintly-wordmark.png" alt="Mintly" width="1600" height="600" /></div>
        <h1>{mode === 'signin' ? text('Iniciar sesión','Sign in') : text('Crear cuenta','Create account')}</h1>
        <p className="auth-subtitle">{text('Tus finanzas se sincronizan de forma privada entre tus dispositivos.','Your finances sync privately across your devices.')}</p>
        <form onSubmit={submit} className="auth-form">
          <label>{text('Correo electrónico','Email')}<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" /></label>
          <label>{text('Contraseña','Password')}<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} autoComplete={mode==='signin'?'current-password':'new-password'} /></label>
          {message && <div className="auth-message" role="status">{message}</div>}
          <button className="button primary auth-submit" disabled={busy}>{busy ? text('Procesando…','Processing…') : mode === 'signin' ? text('Entrar','Sign in') : text('Crear cuenta','Create account')}</button>
        </form>
        <button className="text-button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}}>
          {mode === 'signin' ? text('¿No tienes cuenta? Crear una','No account? Create one') : text('¿Ya tienes cuenta? Iniciar sesión','Already have an account? Sign in')}
        </button>
      </div>
    </div>
  )
}
