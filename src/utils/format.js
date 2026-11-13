export function formatMoney(value, currency = 'USD', locale = 'es-EC') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(value || 0))
}

export function monthKey(date = new Date()) {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function isoDate(date = new Date()) {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseLocalDate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

export function prettyDate(value, language = 'es') {
  if (!value) return ''
  return parseLocalDate(value).toLocaleDateString(language === 'es' ? 'es-EC' : 'en-US', { day: 'numeric', month: 'short' })
}
