import { useEffect, useState } from 'react'
import Modal from './Modal'
import { isoDate } from '../utils/format'
import { useFinance } from '../context/FinanceContext'

const newForm = () => ({ type: 'expense', amount: '', category: '', concept: '', date: isoDate(), recurring: false, frequency: 'weekly', days: [1,2,3,4], start: isoDate(), end: '' })

const weekDays = [
  { id: 1, es: 'L', en: 'M' }, { id: 2, es: 'M', en: 'T' }, { id: 3, es: 'X', en: 'W' },
  { id: 4, es: 'J', en: 'T' }, { id: 5, es: 'V', en: 'F' }, { id: 6, es: 'S', en: 'S' }, { id: 0, es: 'D', en: 'S' },
]

export default function TransactionModal({ open, onClose, transaction = null }) {
  const { t, language, addTransaction, addRecurring, updateTransaction, deleteTransaction } = useFinance()
  const [form, setForm] = useState(newForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const text = (es, en) => language === 'es' ? es : en
  useEffect(() => {
    if (!open) return
    setForm(transaction ? { ...newForm(), type: transaction.type, amount: String(transaction.amount), concept: transaction.concept, category: transaction.category, date: transaction.date } : newForm())
    setError('')
    setConfirmDelete(false)
  }, [open, transaction])
  const conceptPlaceholder = language === 'es' ? {
    income: 'Qué ingreso', expense: 'En qué estás gastando', savings: 'En qué estás ahorrando', investment: 'En qué estás invirtiendo',
  }[form.type] : {
    income: 'What income', expense: 'What are you spending on', savings: 'What are you saving for', investment: 'What are you investing in',
  }[form.type]
  const categoryPlaceholder = language === 'es' ? {
    income: 'Tipo de ingreso', expense: 'Tipo de gasto', savings: 'Tipo de ahorro', investment: 'Tipo de inversión',
  }[form.type] : {
    income: 'Income type', expense: 'Expense type', savings: 'Savings type', investment: 'Investment type',
  }[form.type]
  async function remove() {
    if (busy) return
    setBusy(true)
    const result = await deleteTransaction(transaction)
    setBusy(false)
    if (result.error) setError(result.error.message)
    else onClose()
  }
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleDay = (id) => update('days', form.days.includes(id) ? form.days.filter((d) => d !== id) : [...form.days, id])

  async function submit(e) {
    e.preventDefault()
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0 || !form.concept.trim()) return
    if (busy) return
    if (form.recurring && (!form.start || (form.end && form.end < form.start) || (form.frequency === 'weekly' && !form.days.length))) {
      setError(language === 'es' ? 'Revisa las fechas y selecciona al menos un día.' : 'Check dates and select at least one weekday.')
      return
    }
    if (!form.recurring && !form.date) return
    setBusy(true)
    setError('')
    const base = { type: form.type, amount: Number(form.amount), category: form.category.trim() || text('Otros','Other'), concept: form.concept.trim() }
    let result
    if (transaction) result = await updateTransaction(transaction.id, { ...base, date: form.date })
    else if (form.recurring) {
      result = await addRecurring({ ...base, frequency: form.frequency, days_of_week: form.frequency === 'weekly' ? form.days : [], start_date: form.start, end_date: form.end || null })
    } else result = await addTransaction({ ...base, date: form.date })
    setBusy(false)
    if (result.error) setError(result.error.message)
    else onClose()
  }

  return <Modal open={open} onClose={()=>{if(!busy)onClose()}} title={transaction ? text('Editar transacción','Edit transaction') : t.form.title}>
    <form className="form-stack" onSubmit={submit}><fieldset className="transaction-fields" disabled={busy}>
      <div className="segmented" role="group" aria-label={t.form.type}>
        {['income','expense','savings','investment'].map((type) => <button type="button" key={type} className={form.type===type?'active':''} onClick={() => update('type', type)}>{t.form[type]}</button>)}
      </div>
      <label>{t.form.amount}<input type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>update('amount',e.target.value)} placeholder="0.00" required /></label>
      <label>{t.form.concept}<input value={form.concept} onChange={(e)=>update('concept',e.target.value)} placeholder={conceptPlaceholder} required /></label>
      <label>{t.form.category}<input value={form.category} onChange={(e)=>update('category',e.target.value)} placeholder={categoryPlaceholder} /></label>
      {!form.recurring && <label>{t.form.date}<input type="date" required disabled={Boolean(transaction?.recurring_id)} value={form.date} onChange={(e)=>update('date',e.target.value)} /></label>}
      {!transaction && <label className="switch-row"><span>{t.form.recurring}</span><input type="checkbox" checked={form.recurring} onChange={(e)=>update('recurring',e.target.checked)} /></label>}
      {form.recurring && <div className="recurrence-box">
        <label>{t.form.frequency}<select value={form.frequency} onChange={(e)=>update('frequency',e.target.value)}><option value="daily">{t.form.daily}</option><option value="weekly">{t.form.weekly}</option><option value="monthly">{t.form.monthly}</option></select></label>
        {form.frequency==='weekly' && <div><span className="field-label">{t.form.days}</span><div className="weekday-row">{weekDays.map((d)=><button type="button" key={d.id} className={form.days.includes(d.id)?'selected':''} onClick={()=>toggleDay(d.id)}>{d[language]}</button>)}</div></div>}
        <div className="two-col"><label>{t.form.start}<input type="date" value={form.start} onChange={(e)=>update('start',e.target.value)} /></label><label>{t.form.end}<input type="date" value={form.end} onChange={(e)=>update('end',e.target.value)} /></label></div>
        <p className="helper">{form.type==='income'?t.form.recurrenceNoteIncome:t.form.recurrenceNoteExpense}</p>
      </div>}
      {transaction && <div className="form-stack">{confirmDelete ? <><p>{text('¿Eliminar esta transacción? Esta acción no se puede deshacer.','Delete this transaction? This action cannot be undone.')}</p><button type="button" className="button danger" onClick={remove}>{text('Confirmar eliminación','Confirm deletion')}</button><button type="button" className="button ghost" onClick={()=>setConfirmDelete(false)}>{t.form.cancel}</button></> : <button type="button" className="button danger" onClick={()=>setConfirmDelete(true)}>{text('Eliminar transacción','Delete transaction')}</button>}</div>}
      {error && <p role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>{t.form.cancel}</button><button className="button primary" disabled={busy}>{t.form.save}</button></div>
    </fieldset></form>
  </Modal>
}
