import { generateOccurrences, applyExceptions } from './recurrence.js'
import { monthKey, isoDate } from './format.js'

export function monthData({ transactions = [], recurring = [], exceptions = [], monthDate = new Date(), today = new Date() }) {
  const key = monthKey(monthDate)
  const todayIso = isoDate(today)
  const real = transactions.filter(x => monthKey(x.date) === key)
  const occurrences = applyExceptions(recurring.flatMap(r => generateOccurrences(r, monthDate)), exceptions)
    .filter(v => !real.some(r => r.recurring_id === v.recurring_id && r.date === v.date))
  const virtual = occurrences.filter(x => !x.skipped)
  const all = [...real, ...virtual]
  const sum = rows => rows.reduce((total, x) => total + Math.round(Number(x.amount) * 100), 0) / 100
  const incomeReceived = sum(all.filter(x => x.type === 'income' && x.date <= todayIso))
  const allExpenses = all.filter(x => x.type === 'expense')
  const actualExpense = sum(allExpenses.filter(x => x.date <= todayIso))
  const scheduledExpense = sum(allExpenses.filter(x => x.date > todayIso))
  // One-time allocations reserve money on registration; recurring allocations count when due.
  const allocations = all.filter(x => !x.scheduled || x.date <= todayIso)
  const savings = sum(allocations.filter(x => x.type === 'savings'))
  const investments = sum(allocations.filter(x => x.type === 'investment'))
  const totalExpenses = sum(allExpenses)
  const available = Math.round((incomeReceived - totalExpenses - savings - investments) * 100) / 100
  const upcomingIncome = all.filter(x => x.type === 'income' && x.date > todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null
  return { real, virtual, occurrences, allExpenses, incomeReceived, actualExpense, scheduledExpense,
    totalExpenses, savings, investments, available, upcomingIncome }
}
