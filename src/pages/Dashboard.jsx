import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { monthData } from '../utils/calculations'
import { formatMoney, prettyDate } from '../utils/format'
import PieChart from '../components/PieChart'
import TransactionModal from '../components/TransactionModal'
import Icon from '../components/Icon'

export default function Dashboard() {
  const { state, t, language, today } = useFinance()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const data = useMemo(()=>monthData({ ...state }),[state,today])
  const money=(v)=>formatMoney(v,state.settings.currency,language==='es'?'es-EC':'en-US')
  const recent = [...state.transactions].sort((a,b)=>b.date.localeCompare(a.date))
  const items=[
    {label:t.dashboard.spent,value:data.totalExpenses,color:'#2C8F72'},
    {label:t.dashboard.savings,value:data.savings,color:'#7ED5B4'},
    {label:t.dashboard.investments,value:data.investments,color:'#B7EBDD'},
    {label:t.dashboard.availableLegend,value:Math.max(0,data.available),color:'#E7F8F2'},
  ]
  return <div className="page dashboard-page">
    <header className="page-header"><div><span className="eyebrow">{t.dashboard.monthSummary}</span><h1>{t.dashboard.greeting}</h1></div><button className="button primary desktop-add" onClick={()=>{setEditing(null);setOpen(true)}}><Icon name="plus"/>{t.dashboard.add}</button></header>
    <section className="hero-balance"><span>{t.dashboard.available}</span><strong>{money(data.available)}</strong><small>{data.available < 0 ? (language==='es'?'⚠ Revisa tus compromisos del mes':'⚠ Review your monthly commitments') : (language==='es'?'Después de gastos comprometidos, ahorro e inversión':'After committed expenses, savings and investments')}</small></section>
    <section className="stats-grid">
      <article className="stat-card"><div className="stat-icon positive"><Icon name="arrowDown"/></div><div><span>{t.dashboard.income}</span><strong>{money(data.incomeReceived)}</strong></div></article>
      <article className="stat-card"><div className="stat-icon"><Icon name="arrowUp"/></div><div><span>{t.dashboard.expenses}</span><strong>{money(data.totalExpenses)}</strong></div></article>
      {data.upcomingIncome && <article className="stat-card compact"><div><span>{t.dashboard.nextIncome}</span><strong>{money(data.upcomingIncome.amount)}</strong><small>{prettyDate(data.upcomingIncome.date, language)}</small></div></article>}
    </section>
    <div className="dashboard-grid">
      <section className="panel"><div className="section-head"><div><span className="eyebrow">{language==='es'?'Resumen':'Overview'}</span><h2>{t.dashboard.distribution}</h2></div></div><PieChart items={items} currency={state.settings.currency} language={language} deficit={Math.max(0,-data.available)}/></section>
      <section className="panel recent-panel"><div className="section-head"><div><span className="eyebrow">{language==='es'?'Actividad':'Activity'}</span><h2>{language==='es'?'Transacciones':'Transactions'}</h2></div></div>
        <div className="transaction-list">{recent.length?recent.map((x)=><button type="button" className="transaction-row transaction-edit-row" key={x.id} onClick={()=>{setEditing(x);setOpen(true)}} aria-label={`${language==='es'?'Editar o eliminar':'Edit or delete'} ${x.concept}`}><div className={`transaction-badge ${x.type}`}>{x.type==='income'?'+':'−'}</div><div className="transaction-copy"><strong>{x.concept}</strong><span>{x.category} · {prettyDate(x.date,language)}</span></div><strong className={x.type==='income'?'positive-text':''}>{x.type==='income'?'+':'−'}{money(x.amount)}</strong></button>):<p className="empty">{t.dashboard.noTransactions}</p>}</div>
      </section>
    </div>
    <button className="fab" onClick={()=>{setEditing(null);setOpen(true)}} aria-label={t.dashboard.add}><Icon name="plus" size={26}/></button>
    <TransactionModal open={open} transaction={editing} onClose={()=>{setOpen(false);setEditing(null)}}/>
  </div>
}
