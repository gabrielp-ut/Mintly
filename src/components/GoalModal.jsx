import { useState } from 'react'
import Modal from './Modal'
import { useFinance } from '../context/FinanceContext'

export default function GoalModal({ open, onClose }) {
  const { t, addGoal } = useFinance()
  const [form, setForm] = useState({ name:'', target_amount:'', saved_amount:'', target_date:'' })
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const submit=async(e)=>{e.preventDefault(); if(!form.name||Number(form.target_amount)<=0)return; if(busy)return;setBusy(true);const result=await addGoal({...form,target_amount:Number(form.target_amount),saved_amount:Number(form.saved_amount||0)});setBusy(false);if(result.error)setError(result.error.message);else onClose()}
  return <Modal open={open} onClose={onClose} title={t.goal.title}><form className="form-stack" onSubmit={submit}>
    <label>{t.goal.name}<input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
    <label>{t.goal.target}<input type="number" step="0.01" min="0" value={form.target_amount} onChange={(e)=>setForm({...form,target_amount:e.target.value})} required /></label>
    <label>{t.goal.current}<input type="number" step="0.01" min="0" value={form.saved_amount} onChange={(e)=>setForm({...form,saved_amount:e.target.value})} /></label>
    <label>{t.goal.date}<input type="date" value={form.target_date} onChange={(e)=>setForm({...form,target_date:e.target.value})} /></label>
    {error&&<p role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>{t.form.cancel}</button><button className="button primary" disabled={busy}>{t.goal.save}</button></div>
  </form></Modal>
}
