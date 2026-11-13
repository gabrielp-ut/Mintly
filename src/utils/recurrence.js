import { isoDate, parseLocalDate } from './format.js'

function lastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function monthBounds(monthDate = new Date()) {
  const d = new Date(monthDate)
  const year = d.getFullYear()
  const month = d.getMonth()
  return {
    start: new Date(year, month, 1, 12),
    end: new Date(year, month, lastDayOfMonth(year, month), 12),
  }
}

export function generateOccurrences(rule, monthDate = new Date()) {
  const { start: monthStart, end: monthEnd } = monthBounds(monthDate)
  const ruleStart = parseLocalDate(rule.start_date)
  const ruleEnd = rule.end_date ? parseLocalDate(rule.end_date) : monthEnd
  const start = ruleStart > monthStart ? ruleStart : monthStart
  const end = ruleEnd < monthEnd ? ruleEnd : monthEnd
  if (start > end || rule.active === false) return []

  const results = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    let matches = false
    if (rule.frequency === 'daily') matches = true
    if (rule.frequency === 'weekly') matches = (rule.days_of_week || []).includes(day.getDay())
    if (rule.frequency === 'monthly') matches = day.getDate() === Math.min(ruleStart.getDate(), lastDayOfMonth(day.getFullYear(), day.getMonth()))
    if (matches) {
      results.push({
        id: `virtual-${rule.id}-${isoDate(day)}`,
        recurring_id: rule.id,
        date: isoDate(day),
        type: rule.type,
        amount: Number(rule.amount),
        category: rule.category,
        concept: rule.concept,
        scheduled: true,
        source: 'recurring',
      })
    }
  }
  return results
}

export function applyExceptions(occurrences, exceptions = []) {
  const map = new Map(exceptions.map((x) => [`${x.recurring_id}:${x.date}`, x]))
  return occurrences.map((item) => {
    const ex = map.get(`${item.recurring_id}:${item.date}`)
    if (!ex) return item
    if (ex.action === 'skip') return { ...item, skipped: true }
    if (ex.action === 'override') return { ...item, amount: Number(ex.override_amount), overridden: true }
    return item
  })
}
