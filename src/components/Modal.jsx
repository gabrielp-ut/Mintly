import { useFinance } from '../context/FinanceContext'
export default function Modal({ open, onClose, title, children }) {
  const { t } = useFinance()
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label={t.common.close}>×</button></div>
        {children}
      </section>
    </div>
  )
}
