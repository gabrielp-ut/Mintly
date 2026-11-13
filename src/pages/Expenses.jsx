import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { monthData } from '../utils/calculations'
import { formatMoney, prettyDate } from '../utils/format'
import TransactionModal from '../components/TransactionModal'
import Modal from '../components/Modal'
import Icon from '../components/Icon'

export default function Expenses() {
  const { state, t, language, today, addException, removeException } = useFinance()
  const [editing,setEditing]=useState(null);
  const [open,setOpen]=useState(false); const [query,setQuery]=useState(''); const [selected,setSelected]=useState(null); const [editAmount,setEditAmount]=useState(''); const [busy,setBusy]=useState(false); const [showRecurring,setShowRecurring]=useState(false)
  const data=useMemo(()=>monthData({...state}),[state,today]); const money=(v)=>formatMoney(v,state.settings.currency,language==='es'?'es-EC':'en-US')

  const rows=[
    ...data.real.filter(x=>!showRecurring && x.type==='expense').map(x=>({...x, scheduled:false})),
    ...data.occurrences.filter(x=>showRecurring || x.type==='expense').filter(v=>!data.real.some(r=>r.recurring_id===v.recurring_id&&r.date===v.date)),
  ].filter(x=>(x.concept+' '+x.category).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.date.localeCompare(b.date))
  async function changeDay(action){
    if(busy)return
    if(action==='override'&&(editAmount===''||!Number.isFinite(Number(editAmount))||Number(editAmount)<0))return
    setBusy(true)
    const result=action==='restore'?await removeException(selected.recurring_id,selected.date):await addException({recurring_id:selected.recurring_id,date:selected.date,action,...(action==='override'?{override_amount:Number(editAmount)}:{})})
    setBusy(false)
    if(!result.error)setSelected(null)
  }
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">{language==='es'?'Salidas de dinero':'Money out'}</span><h1>{t.expenses.title}</h1><p>{t.expenses.subtitle}</p></div><button className="button primary desktop-add" onClick={()=>{setEditing(null);setOpen(true)}}><Icon name="plus"/>{t.expenses.add}</button></header>
    <section className="expense-summary"><article><span>{t.expenses.total}</span><strong>{money(data.totalExpenses)}</strong></article><article><span>{t.expenses.actual}</span><strong>{money(data.actualExpense)}</strong></article><article><span>{t.expenses.scheduled}</span><strong>{money(data.scheduledExpense)}</strong></article></section>
    <section className="panel"><div className="toolbar"><label><input type="checkbox" checked={showRecurring} onChange={e=>setShowRecurring(e.target.checked)}/>{language==='es'?'Ver todas las recurrencias':'Show all recurring transactions'}</label><div className="search-box"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.expenses.search}/></div></div>
      <div className="expense-table"><div className="table-head"><span>{language==='es'?'Movimiento':'Transaction'}</span><span>{language==='es'?'Estado':'Status'}</span><span>{language==='es'?'Monto':'Amount'}</span></div>
      {rows.length?rows.map(x=><button className="expense-row" key={x.id} onClick={()=>{if(x.scheduled){setEditAmount(String(x.amount));setSelected(x)}else{setEditing(x);setOpen(true)}}}><div><strong>{x.concept}</strong><span>{showRecurring?t.form[x.type]+' · ':''}{x.category} · {prettyDate(x.date,language)}</span></div><span className={`pill ${x.scheduled?'pending':'done'}`}>{x.skipped ? (language==='es'?'Omitido':'Skipped') : x.scheduled && x.date > today ? t.dashboard.planned : t.dashboard.completed}</span><strong>{x.type==='income'?'+':'−'}{money(x.amount)}</strong></button>):<p className="empty">{t.expenses.noResults}</p>}</div>
    </section>
    <button className="fab" onClick={()=>{setEditing(null);setOpen(true)}}><Icon name="plus" size={26}/></button>
    <TransactionModal open={open} transaction={editing} onClose={()=>{setOpen(false);setEditing(null)}}/>
    <Modal open={Boolean(selected)} onClose={()=>setSelected(null)} title={selected?.concept || ''}>{selected&&<div className="form-stack"><div className="selected-info"><span>{prettyDate(selected.date,language)}</span><strong>{money(selected.amount)}</strong></div><label>{t.expenses.editAmount}<input type="number" step="0.01" min="0" value={editAmount} onChange={e=>setEditAmount(e.target.value)} placeholder={selected.amount}/></label><button className="button primary" disabled={busy} onClick={()=>changeDay('override')}>{t.expenses.editAmount}</button><button className="button danger" disabled={busy} onClick={()=>changeDay('skip')}>{t.expenses.skip}</button><button className="button ghost" disabled={busy} onClick={()=>changeDay('restore')}>{t.expenses.restore}</button></div>}</Modal>
  </div>
}
