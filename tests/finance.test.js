import test from 'node:test'
import assert from 'node:assert/strict'
import { monthData } from '../src/utils/calculations.js'
import { monthKey, isoDate } from '../src/utils/format.js'
import { generateOccurrences } from '../src/utils/recurrence.js'

process.env.TZ = 'America/Guayaquil'
const base = { transactions: [], recurring: [], exceptions: [], monthDate: new Date(2026,10,12,12), today: new Date(2026,10,12,12) }
const income = { id: 'income', type: 'income', date: '2026-11-10', amount: 100 }
const rule = { id: 'rule', type: 'expense', amount: 20, frequency: 'monthly', start_date: '2026-11-28', active: true }
const calc = changes => monthData({ ...base, ...changes })

test('date-only strings keep their calendar date in Ecuador', () => {
  assert.equal(monthKey('2026-11-01'), '2026-11')
  assert.equal(isoDate('2026-11-01'), '2026-11-01')
  assert.equal(calc({ transactions: [{ ...income, date: '2026-11-01' }] }).incomeReceived, 100)
})
test('future one-time and recurring income wait for their date', () => {
  assert.equal(calc({ transactions: [{ ...income, date: '2026-11-28' }], recurring: [{ ...rule, type: 'income' }] }).available, 0)
  assert.equal(calc({ transactions: [{ ...income, date: '2026-11-12' }] }).available, 100)
})
test('future recurring expenses reserve monthly money', () => {
  const data = calc({ transactions: [income], recurring: [rule] })
  assert.equal(data.available, 80)
  assert.equal(data.scheduledExpense, 20)
})
test('one-time future expenses are scheduled, not completed', () => {
  const data = calc({ transactions: [income, { ...rule, date: '2026-11-28' }] })
  assert.equal(data.actualExpense, 0)
  assert.equal(data.scheduledExpense, 20)
})
test('registered savings and investments reduce available money', () => {
  assert.equal(calc({ transactions: [income, { type: 'savings', date: '2026-11-28', amount: 10 }, { type: 'investment', date: '2026-11-10', amount: 15 }] }).available, 75)
})
test('recurring savings and investments count when due', () => {
  const data = calc({ transactions: [income], recurring: [{ ...rule, type: 'savings', start_date: '2026-11-10' }, { ...rule, id: 'future', type: 'investment' }] })
  assert.equal(data.available, 80)
  assert.equal(data.investments, 0)
})
test('exceptions affect a single date and skipped dates remain restorable', () => {
  const recurring = [{ ...rule, frequency: 'daily', start_date: '2026-11-27', end_date: '2026-11-28' }]
  const skipped = calc({ transactions: [income], recurring, exceptions: [{ recurring_id: 'rule', date: '2026-11-28', action: 'skip' }] })
  assert.equal(skipped.available, 80)
  assert.equal(skipped.occurrences.find(x => x.date === '2026-11-28').skipped, true)
  const overridden = calc({ transactions: [income], recurring, exceptions: [{ recurring_id: 'rule', date: '2026-11-28', action: 'override', override_amount: 5 }] })
  assert.equal(overridden.available, 75)
  assert.equal(calc({ transactions: [income], recurring }).available, 60)
})
test('materialized occurrences are not counted twice', () => {
  const data = calc({ transactions: [income, { ...rule, id: 'real', recurring_id: 'rule', date: '2026-11-28', amount: 7 }], recurring: [rule] })
  assert.equal(data.totalExpenses, 7)
  assert.equal(data.allExpenses.length, 1)
})
test('monthly day 31 falls on the last day of shorter months', () => {
  assert.equal(generateOccurrences({ ...rule, start_date: '2026-10-31' }, base.monthDate)[0].date, '2026-11-30')
  assert.equal(generateOccurrences({ ...rule, start_date: '2024-01-31' }, new Date(2024,1,10))[0].date, '2024-02-29')
})
test('end dates and inactive series are respected', () => {
  assert.equal(generateOccurrences({ ...rule, active: false }, base.monthDate).length, 0)
  assert.equal(generateOccurrences({ ...rule, end_date: '2026-11-20' }, base.monthDate).length, 0)
})
test('monetary sums avoid floating point residue', () => {
  assert.equal(calc({ transactions: [{ ...income, amount: .3 }, { type: 'expense', date: income.date, amount: .1 }] }).available, .2)
})
