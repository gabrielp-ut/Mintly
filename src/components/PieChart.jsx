export default function PieChart({ items, currency = 'USD', language = 'es', deficit = 0 }) {
  const safe = items.map((i) => ({ ...i, value: Math.max(0, Number(i.value || 0)) }))
  const total = safe.reduce((s, i) => s + i.value, 0)
  let cursor = 0
  const parts = safe.map((item) => {
    const start = cursor
    cursor += (item.value / (total || 1)) * 360
    return `${item.color} ${start}deg ${cursor}deg`
  })
  return (
    <div className="chart-wrap">
      <div className="pie" style={{ background: total ? `conic-gradient(${parts.join(',')})` : '#eaf4f0' }} aria-label={language==='es'?'Gráfico de distribución':'Money distribution chart'}>
        <div className="pie-hole"><strong>{new Intl.NumberFormat(language==='es'?'es-EC':'en-US',{maximumFractionDigits:2}).format(total)}</strong><span>{currency}</span></div>
      </div>
      <div className="legend">{deficit>0&&<p role="status">{language==='es'?'Déficit':'Deficit'}: {new Intl.NumberFormat(language==='es'?'es-EC':'en-US',{style:'currency',currency}).format(deficit)}</p>}
        {safe.map((item) => <div className="legend-item" key={item.label}><span className="dot" style={{ background: item.color }} /><span>{item.label}</span><strong>{Math.round((item.value / (total || 1)) * 100)}%</strong></div>)}
      </div>
    </div>
  )
}
