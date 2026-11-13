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
      <div className="auth-card"><div className="language-switch"><button onClick={()=>setLanguage('es')}>Español</button><button onClick={()=>setLanguage('en')}>English</button></div>
        <div className="auth-brand"><div className="brand-mark">M</div><div><strong>MINTLY</strong><span>Personal money</span></div></div>
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
