export const translations = {
  es: {
    nav: { home: 'Inicio', expenses: 'Gastos', savings: 'Ahorros', settings: 'Configuración' },
    dashboard: {
      greeting: 'Tus finanzas', monthSummary: 'Resumen del mes', available: 'Dinero disponible',
      income: 'Ingresos recibidos', expenses: 'Gastos del mes', distribution: 'Distribución del dinero',
      spent: 'Gastos', savings: 'Ahorro', investments: 'Inversión', availableLegend: 'Disponible',
      recent: 'Movimientos recientes', add: 'Registrar movimiento', planned: 'Programado', completed: 'Realizado',
      nextIncome: 'Próximo ingreso', noTransactions: 'Aún no hay movimientos.'
    },
    expenses: {
      title: 'Gastos', subtitle: 'Controla lo realizado y lo que ya está comprometido.', total: 'Total del mes',
      actual: 'Realizados', scheduled: 'Programados pendientes', add: 'Nuevo movimiento', all: 'Todos',
      search: 'Buscar gastos', upcoming: 'Próximos', history: 'Historial', recurring: 'Recurrente', oneTime: 'Único',
      skip: 'Omitir este día', editAmount: 'Cambiar monto de este día', restore: 'Restaurar día', noResults: 'No hay gastos para mostrar.'
    },
    savings: {
      title: 'Ahorros y futuro', saved: 'Ahorrado', investing: 'Guardado para invertir', goals: 'Metas',
      addGoal: 'Crear meta', savedOf: 'guardados de', remaining: 'faltantes', noGoals: 'Crea tu primera meta de ahorro.'
    },
    settings: {
      title: 'Configuración', language: 'Idioma', currency: 'Moneda', distribution: 'Distribución de ingresos',
      distributionHelp: 'Define cómo quieres repartir tus ingresos. Debe sumar 100%.', usable: 'Dinero utilizable',
      savings: 'Ahorro', investments: 'Inversión', recommendation: 'Referencia educativa',
      recommendationText: 'Una referencia popular es 50% necesidades, 30% deseos y 20% ahorro/metas. Ajusta estos porcentajes a tu realidad.',
      save: 'Guardar configuración', invalid: 'Los porcentajes deben sumar exactamente 100%.', saved: 'Configuración guardada.',
      sync: 'Sincronización', syncText: 'Al conectar Supabase, tus datos pueden sincronizarse entre teléfono y computadora.',
      localMode: 'Modo local activo', cloudMode: 'Supabase configurado', privacy: 'Privacidad',
      privacyText: 'No guardes números de tarjetas, cuentas bancarias, documentos ni contraseñas financieras en esta aplicación.'
    },
    form: {
      title: 'Registrar movimiento', type: 'Tipo', income: 'Ingreso', expense: 'Gasto', savings: 'Ahorro', investment: 'Inversión',
      amount: 'Monto', category: 'Categoría', concept: 'Concepto', date: 'Fecha', recurring: '¿Repetir movimiento?',
      frequency: 'Frecuencia', daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', days: 'Días de la semana',
      start: 'Inicio', end: 'Fin', noEnd: 'Sin fecha de fin', save: 'Guardar', cancel: 'Cancelar',
      oneTime: 'Movimiento único', recurrenceNoteExpense: 'Los gastos programados pendientes reducen el dinero disponible del mes.',
      recurrenceNoteIncome: 'Los ingresos programados solo cuentan cuando llega su fecha.'
    },
    goal: { title: 'Nueva meta', name: 'Nombre', target: 'Meta', current: 'Monto inicial', date: 'Fecha objetivo (opcional)', save: 'Crear meta' },
    common: { close: 'Cerrar', today: 'Hoy', pending: 'Pendiente' }
  },
  en: {
    nav: { home: 'Home', expenses: 'Expenses', savings: 'Savings', settings: 'Settings' },
    dashboard: {
      greeting: 'Your finances', monthSummary: 'Monthly summary', available: 'Available money',
      income: 'Received income', expenses: 'Monthly expenses', distribution: 'Money distribution',
      spent: 'Expenses', savings: 'Savings', investments: 'Investments', availableLegend: 'Available',
      recent: 'Recent activity', add: 'Add transaction', planned: 'Scheduled', completed: 'Completed',
      nextIncome: 'Next income', noTransactions: 'No activity yet.'
    },
    expenses: {
      title: 'Expenses', subtitle: 'Track what you spent and what is already committed.', total: 'Monthly total',
      actual: 'Completed', scheduled: 'Scheduled pending', add: 'New transaction', all: 'All', search: 'Search expenses',
      upcoming: 'Upcoming', history: 'History', recurring: 'Recurring', oneTime: 'One-time', skip: 'Skip this day',
      editAmount: 'Change amount for this day', restore: 'Restore day', noResults: 'No expenses to show.'
    },
    savings: {
      title: 'Savings & future', saved: 'Saved', investing: 'Set aside to invest', goals: 'Goals', addGoal: 'Create goal',
      savedOf: 'saved of', remaining: 'remaining', noGoals: 'Create your first savings goal.'
    },
    settings: {
      title: 'Settings', language: 'Language', currency: 'Currency', distribution: 'Income distribution',
      distributionHelp: 'Choose how to distribute income. It must total 100%.', usable: 'Usable money', savings: 'Savings',
      investments: 'Investments', recommendation: 'Educational reference',
      recommendationText: 'A common reference is 50% needs, 30% wants, and 20% savings/goals. Adapt it to your circumstances.',
      save: 'Save settings', invalid: 'Percentages must total exactly 100%.', saved: 'Settings saved.', sync: 'Sync',
      syncText: 'Once Supabase is connected, data can sync between phone and desktop.', localMode: 'Local mode active',
      cloudMode: 'Supabase configured', privacy: 'Privacy', privacyText: 'Do not store card numbers, bank accounts, documents, or financial passwords in this app.'
    },
    form: {
      title: 'Add transaction', type: 'Type', income: 'Income', expense: 'Expense', savings: 'Savings', investment: 'Investment',
      amount: 'Amount', category: 'Category', concept: 'Concept', date: 'Date', recurring: 'Repeat transaction?', frequency: 'Frequency',
      daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', days: 'Days of week', start: 'Start', end: 'End', noEnd: 'No end date',
      save: 'Save', cancel: 'Cancel', oneTime: 'One-time transaction',
      recurrenceNoteExpense: 'Pending scheduled expenses reduce this month’s available money.',
      recurrenceNoteIncome: 'Scheduled income only counts once its date arrives.'
    },
    goal: { title: 'New goal', name: 'Name', target: 'Target', current: 'Starting amount', date: 'Target date (optional)', save: 'Create goal' },
    common: { close: 'Close', today: 'Today', pending: 'Pending' }
  }
}
