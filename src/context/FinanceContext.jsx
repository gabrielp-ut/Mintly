import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { demoState, emptyState } from '../data/demo'
import { translations } from '../locales/translations'
import { isoDate } from '../utils/format'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'

const FinanceContext = createContext(null)
const STORAGE_KEY = 'mint-finance-v2'
function loadLocal(fallback = demoState) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return saved && ['transactions','recurring','exceptions','goals'].every(k => Array.isArray(saved[k]))
      ? { ...saved, settings: { ...emptyState.settings, ...saved.settings } } : fallback
  } catch { return fallback }
}
const stripUser = ({ user_id, created_at, updated_at, ...rest }) => rest

export function FinanceProvider({ children }) {
  const [state, setState] = useState(() => isSupabaseConfigured ? emptyState : loadLocal())
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [cloudUser, setCloudUser] = useState(null)
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local')
  const [errorMessage, setErrorMessage] = useState('')
  const [today, setToday] = useState(isoDate())
  const identity = useRef({ id: null, generation: 0 })
  const queue = useRef(Promise.resolve())
  const language = state.settings.language === 'en' ? 'en' : 'es'
  const t = useMemo(() => translations[language], [language])

  useEffect(() => {
    const tick = () => setToday(isoDate())
    const timer = setInterval(tick, 30000)
    window.addEventListener('focus', tick)
    return () => { clearInterval(timer); window.removeEventListener('focus', tick) }
  }, [])

  useEffect(() => {
    if (!supabase) return
    let alive = true
    let authEventReceived = false
    const accept = next => {
      if (!alive) return
      const id = next?.user?.id || null
      if (identity.current.id !== id) {
        identity.current = { id, generation: identity.current.generation + 1 }
        queue.current = Promise.resolve()
        setState(emptyState)
        setCloudUser(null)
        setErrorMessage('')
      }
      setSession(next)
      setAuthLoading(false)
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      authEventReceived = true
      accept(next)
    })
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive || authEventReceived) return
      if (error) setErrorMessage(error.message)
      accept(data.session)
    }).catch(error => { if (alive) { setErrorMessage(error.message); setAuthLoading(false) } })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  function enqueue(task) {
    const token = { ...identity.current }
    const current = () => token.id === identity.current.id && token.generation === identity.current.generation
    const result = queue.current.then(async () => {
      if (!current()) return { error: new Error('La sesión cambió. / Session changed.') }
      try { return await task(token.id, current) }
      catch (error) {
        if (current()) { setSyncStatus('error'); setErrorMessage(error.message) }
        return { error }
      }
    })
    queue.current = result.then(() => undefined, () => undefined)
    return result
  }

  async function readCloud(uid, current) {
    setSyncStatus('syncing')
    const tables = ['transactions','recurring_transactions','recurring_exceptions','savings_goals','user_settings']
    const results = await Promise.all(tables.map(table => supabase.from(table).select('*').eq('user_id', uid)))
    const error = results.find(r => r.error)?.error
    if (error) throw error
    if (!current()) return { error: new Error('La sesión cambió. / Session changed.') }
    const [tx, rec, exc, goals, settings] = results.map(r => r.data || [])
    setState({ transactions: tx.map(stripUser), recurring: rec.map(stripUser), exceptions: exc.map(stripUser),
      goals: goals.map(stripUser), settings: { ...emptyState.settings, ...(settings[0] ? stripUser(settings[0]) : {}) }, lastUpdated: isoDate() })
    setCloudUser(uid)
    setSyncStatus('synced')
    setErrorMessage('')
    return { error: null }
  }
  function loadFromCloud() {
    if (!identity.current.id) return Promise.resolve({ error: null })
    return enqueue(readCloud)
  }

  useEffect(() => {
    if (!session?.user?.id) return
    loadFromCloud()
    const uid = session.user.id
    const channel = supabase.channel(`finance-${uid}`)
    let timer
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => loadFromCloud(), 150) }
    for (const table of ['transactions','recurring_transactions','recurring_exceptions','savings_goals','user_settings']) {
      for (const event of ['INSERT','UPDATE']) channel.on('postgres_changes', { event, schema: 'public', table, filter: `user_id=eq.${uid}` }, refresh)
      // DELETE events may contain only the primary key; reload through RLS instead of filtering old.user_id.
      channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table }, refresh)
    }
    channel.subscribe()
    const focus = () => { if (!document.hidden) refresh() }
    window.addEventListener('focus', focus)
    document.addEventListener('visibilitychange', focus)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', focus)
      document.removeEventListener('visibilitychange', focus)
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (isSupabaseConfigured) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
    catch { setErrorMessage('No se pudieron guardar los datos locales. / Local storage failed.') }
  }, [state])

  async function signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      return { error, needsConfirmation: !error && !data.session }
    } catch (error) { return { error } }
  }
  async function signIn(email, password) {
    try { return await supabase.auth.signInWithPassword({ email, password }) }
    catch (error) { return { error } }
  }
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) { setErrorMessage(error.message); return { error } }
    return { error: null }
  }

  function mutate(localUpdate, cloudWrite) {
    if (!isSupabaseConfigured) { setState(localUpdate); return Promise.resolve({ error: null }) }
    if (!identity.current.id || cloudUser !== identity.current.id) return Promise.resolve({ error: new Error('Espera la sincronización. / Wait for sync.') })
    return enqueue(async (uid, current) => {
      setSyncStatus('syncing')
      const { error } = await cloudWrite(uid)
      if (error) throw error
      return current() ? readCloud(uid, current) : { error: new Error('La sesión cambió. / Session changed.') }
    })
  }
  function addTransaction(payload) {
    const row = { ...payload, id: crypto.randomUUID() }
    return mutate(s => ({ ...s, transactions: [row, ...s.transactions] }), uid => supabase.from('transactions').insert({ ...row, user_id: uid }))
  }
  function updateTransaction(id, payload) {
    const { type, amount, concept, category, date } = payload
    const changes = { type, amount, concept, category, date }
    return mutate(s => ({ ...s, transactions: s.transactions.map(row => row.id === id ? { ...row, ...changes } : row) }),
      uid => supabase.from('transactions').update(changes).eq('id', id).eq('user_id', uid))
  }
  function deleteTransaction(transaction) {
    const exception = transaction.recurring_id ? { id: crypto.randomUUID(), recurring_id: transaction.recurring_id, date: transaction.date, action: 'skip' } : null
    return mutate(s => ({ ...s, transactions: s.transactions.filter(row => row.id !== transaction.id),
      exceptions: exception ? [...s.exceptions.filter(x => !(x.recurring_id === exception.recurring_id && x.date === exception.date)), exception] : s.exceptions }),
      async uid => {
        // Keep the deleted occurrence from reappearing as a virtual recurrence.
        if (exception) {
          const result = await supabase.from('recurring_exceptions').upsert({ ...exception, user_id: uid }, { onConflict: 'recurring_id,date' })
          if (result.error) return result
        }
        return supabase.from('transactions').delete().eq('id', transaction.id).eq('user_id', uid)
      })
  }
  function addRecurring(payload) {
    const row = { ...payload, id: crypto.randomUUID(), active: true }
    return mutate(s => ({ ...s, recurring: [row, ...s.recurring] }), uid => supabase.from('recurring_transactions').insert({ ...row, user_id: uid }))
  }
  function addException(payload) {
    const row = { ...payload, id: crypto.randomUUID() }
    return mutate(s => ({ ...s, exceptions: [...s.exceptions.filter(x => !(x.recurring_id === row.recurring_id && x.date === row.date)), row] }),
      uid => supabase.from('recurring_exceptions').upsert({ ...row, user_id: uid }, { onConflict: 'recurring_id,date' }))
  }
  function removeException(recurringId, date) {
    return mutate(s => ({ ...s, exceptions: s.exceptions.filter(x => !(x.recurring_id === recurringId && x.date === date)) }),
      uid => supabase.from('recurring_exceptions').delete().eq('user_id', uid).eq('recurring_id', recurringId).eq('date', date))
  }
  function addGoal(payload) {
    const row = { ...payload, id: crypto.randomUUID(), target_date: payload.target_date || null }
    return mutate(s => ({ ...s, goals: [...s.goals, row] }), uid => supabase.from('savings_goals').insert({ ...row, user_id: uid }))
  }
  function updateGoal(id, changes) {
    const clean = { ...changes }
    if ('target_date' in clean) clean.target_date ||= null
    return mutate(s => ({ ...s, goals: s.goals.map(g => g.id === id ? { ...g, ...clean } : g) }),
      uid => supabase.from('savings_goals').update(clean).eq('id', id).eq('user_id', uid))
  }
  function updateSettings(settings) {
    const next = { ...state.settings, ...settings }
    const percentages = [next.usable_percentage, next.savings_percentage, next.investment_percentage]
    if (!percentages.every(x => Number.isInteger(x) && x >= 0 && x <= 100) || percentages.reduce((a,b) => a+b, 0) !== 100) {
      return Promise.resolve({ error: new Error(t.settings.invalid) })
    }
    return mutate(s => ({ ...s, settings: next }), uid => supabase.from('user_settings').upsert({ ...next, user_id: uid, updated_at: new Date().toISOString() }))
  }
  function importLocalToCloud() {
    const local = loadLocal(null)
    if (!local || !identity.current.id) return Promise.resolve({ error: new Error('No hay datos locales o sesión. / No local data or session.') })
    return enqueue(async (uid, current) => {
      setSyncStatus('syncing')
      // Stable per-account IDs make retries safe without importing another account's UUIDs.
      const mappingKey = `${STORAGE_KEY}-import-${uid}`
      const ids = JSON.parse(localStorage.getItem(mappingKey) || '{}')
      for (const key of ['recurring','transactions','exceptions','goals']) for (const row of local[key]) ids[row.id] ||= crypto.randomUUID()
      localStorage.setItem(mappingKey, JSON.stringify(ids))
      for (const [key, table] of [['recurring','recurring_transactions'],['transactions','transactions'],['exceptions','recurring_exceptions'],['goals','savings_goals']]) {
        if (!current()) throw new Error('La sesión cambió. / Session changed.')
        const rows = local[key].map(row => ({ ...row, id: ids[row.id], user_id: uid,
          ...(row.recurring_id ? { recurring_id: ids[row.recurring_id] } : {}),
          ...(key === 'goals' ? { target_date: row.target_date || null } : {}) }))
        if (!rows.length) continue
        const { error } = await supabase.from(table).upsert(rows, key === 'exceptions' ? { onConflict: 'recurring_id,date' } : {})
        if (error) throw error
      }
      return readCloud(uid, current)
    })
  }
  const cloudLoading = Boolean(session && cloudUser !== session.user.id)
  const value = { state, t, language, today, isSupabaseConfigured, syncStatus, errorMessage, session, authLoading, cloudLoading,
    signUp, signIn, signOut, loadFromCloud, importLocalToCloud, addTransaction, updateTransaction, deleteTransaction, addRecurring, addException, removeException, addGoal, updateGoal, updateSettings }
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}
