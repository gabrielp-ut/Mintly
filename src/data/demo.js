import { isoDate } from '../utils/format'

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = Math.min(now.getDate(), 20)
const date = (d) => `${year}-${month}-${String(d).padStart(2, '0')}`

export const emptyState = {
  transactions: [],
  recurring: [],
  exceptions: [],
  goals: [],
  settings: { language: 'es', currency: 'USD', usable_percentage: 60, savings_percentage: 10, investment_percentage: 30 },
  lastUpdated: isoDate(now),
}

export const demoState = {
  transactions: [
    { id: '00000000-0000-4000-8000-000000000001', date: date(Math.max(1, day - 8)), type: 'income', amount: 60, category: 'Apoyo familiar', concept: 'Ingreso mensual' },
    { id: '00000000-0000-4000-8000-000000000002', date: date(Math.max(1, day - 6)), type: 'expense', amount: 3, category: 'Pequeños gastos', concept: 'Red Bull' },
    { id: '00000000-0000-4000-8000-000000000003', date: date(Math.max(1, day - 5)), type: 'savings', amount: 10, category: 'Ahorro general', concept: 'Ahorro del mes' },
    { id: '00000000-0000-4000-8000-000000000004', date: date(Math.max(1, day - 4)), type: 'investment', amount: 18, category: 'Inversión', concept: 'Fondo para invertir' },
  ],
  recurring: [
    { id: '10000000-0000-4000-8000-000000000001', type: 'expense', amount: 2.75, category: 'Comida', concept: 'Almuerzo', frequency: 'weekly', days_of_week: [1,2,3,4], start_date: `${year}-${month}-01`, end_date: `${year}-${month}-${new Date(year, now.getMonth()+1, 0).getDate()}`, active: true },
    { id: '10000000-0000-4000-8000-000000000002', type: 'income', amount: 60, category: 'Apoyo familiar', concept: 'Ingreso mensual', frequency: 'monthly', days_of_week: [], start_date: `${year}-${month}-28`, end_date: null, active: true },
  ],
  exceptions: [],
  goals: [
    { id: '20000000-0000-4000-8000-000000000001', name: 'Fondo de emergencia', target_amount: 500, saved_amount: 150, target_date: '' },
  ],
  settings: { language: 'es', currency: 'USD', usable_percentage: 60, savings_percentage: 10, investment_percentage: 30 },
  lastUpdated: isoDate(now),
}
