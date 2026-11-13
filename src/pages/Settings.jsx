import { useEffect, useState } from 'react'
import { useFinance } from '../context/FinanceContext'

export default function Settings(){
 const {state,t,language,updateSettings,isSupabaseConfigured,session,signOut,syncStatus,importLocalToCloud}=useFinance(); const [form,setForm]=useState(state.settings); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false); const [failed,setFailed]=useState(false)
 useEffect(()=>setForm(state.settings),[state.settings]); const total=Number(form.usable_percentage)+Number(form.savings_percentage)+Number(form.investment_percentage)
 async function save(){
  if(busy)return
  if(total!==100){setFailed(true);setMessage(t.settings.invalid);return}
  setBusy(true)
  const {error}=await updateSettings({...form,usable_percentage:Number(form.usable_percentage),savings_percentage:Number(form.savings_percentage),investment_percentage:Number(form.investment_percentage)})
  setBusy(false);setFailed(Boolean(error));setMessage(error?error.message:t.settings.saved)
 }
 async function importData(){
  if(busy)return
  setBusy(true)
  const {error}=await importLocalToCloud()
  setBusy(false);setFailed(Boolean(error));setMessage(error?error.message:(language==='es'?'Importación completada':'Import complete'))
 }

 return <div className="page settings-page"><header className="page-header"><div><span className="eyebrow">{language==='es'?'Preferencias':'Preferences'}</span><h1>{t.settings.title}</h1></div></header>
 <div className="settings-grid"><section className="panel settings-section"><h2>{t.settings.language}</h2><div className="language-switch"><button className={form.language==='es'?'active':''} onClick={()=>setForm({...form,language:'es'})}>Español</button><button className={form.language==='en'?'active':''} onClick={()=>setForm({...form,language:'en'})}>English</button></div><label>{t.settings.currency}<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option>USD</option><option>EUR</option></select></label></section>
 <section className="panel settings-section"><h2>{t.settings.distribution}</h2><p>{t.settings.distributionHelp}</p><div className="allocation-total"><span>Total</span><strong className={total===100?'ok':'bad'}>{total}%</strong></div>{[['usable_percentage',t.settings.usable],['savings_percentage',t.settings.savings],['investment_percentage',t.settings.investments]].map(([k,l])=><label className="percentage-row" key={k}><span>{l}</span><div><input type="number" min="0" max="100" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/><span>%</span></div></label>)}<div className="recommendation"><strong>{t.settings.recommendation}</strong><p>{t.settings.recommendationText}</p></div></section>
 <section className="panel settings-section"><h2>{t.settings.sync}</h2><div className="sync-state"><span className={`status-dot ${isSupabaseConfigured?'cloud':''}`}/><strong>{isSupabaseConfigured?t.settings.cloudMode:t.settings.localMode}</strong></div><p>{t.settings.syncText}</p><p role="status">{syncStatus}</p>{session&&<><p>{session.user.email}</p><button className="button ghost" disabled={busy} onClick={importData}>{language==='es'?'Importar datos locales':'Import local data'}</button><button className="button ghost" onClick={signOut}>{language==='es'?'Cerrar sesión':'Sign out'}</button></>}</section>
 <section className="panel settings-section"><h2>{t.settings.privacy}</h2><p>{t.settings.privacyText}</p></section></div>
 <div className="settings-save"><button className="button primary" disabled={busy} onClick={save}>{t.settings.save}</button>{message&&<span role="status" className={failed?'error-message':'success-message'}>{message}</span>}</div></div>
}
