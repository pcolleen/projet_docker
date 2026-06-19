import { useState, useEffect } from 'react'

export default function App() {
  const [page, setPage] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('token'))

  function handleLogin(t) {
    localStorage.setItem('token', t)
    setToken(t)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (token) return <Home token={token} onLogout={handleLogout} />
  if (page === 'register') return <Register onSuccess={handleLogin} onBack={() => setPage('login')} />
  return <Login onSuccess={handleLogin} onRegister={() => setPage('register')} />
}

function Login({ onSuccess, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      onSuccess(data.token)
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={submit}>
        <h2 style={s.title}>Connexion</h2>
        {error && <p style={s.error}>{error}</p>}
        <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={s.input} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        <p style={s.link}>
          Pas de compte ?{' '}
          <span style={s.a} onClick={onRegister}>S'inscrire</span>
        </p>
      </form>
    </div>
  )
}

function Register({ onSuccess, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)

      const loginRes = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) return setError(loginData.error)
      onSuccess(loginData.token)
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={submit}>
        <h2 style={s.title}>Inscription</h2>
        {error && <p style={s.error}>{error}</p>}
        <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={s.input} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer un compte'}</button>
        <p style={s.link}>
          Déjà un compte ?{' '}
          <span style={s.a} onClick={onBack}>Se connecter</span>
        </p>
      </form>
    </div>
  )
}

const COLUMNS = [
  { key: 'todo',        label: 'À faire',   color: '#e2e8f0', accent: '#64748b' },
  { key: 'in_progress', label: 'En cours',  color: '#dbeafe', accent: '#3b82f6' },
  { key: 'done',        label: 'Terminé',   color: '#dcfce7', accent: '#22c55e' },
]

const NEXT = { todo: 'in_progress', in_progress: 'done', done: null }
const PREV = { todo: null, in_progress: 'todo', done: 'in_progress' }

function Home({ token, onLogout }) {
  const [board, setBoard] = useState({ todo: [], in_progress: [], done: [] })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch('/tasks', { headers })
      .then(r => r.json())
      .then(data => { setBoard(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!input.trim()) return
    const res = await fetch('/tasks', { method: 'POST', headers, body: JSON.stringify({ title: input.trim() }) })
    const task = await res.json()
    setBoard(b => ({ ...b, todo: [...b.todo, task] }))
    setInput('')
  }

  async function move(task, direction) {
    const newStatus = direction === 'next' ? NEXT[task.status] : PREV[task.status]
    if (!newStatus) return
    const res = await fetch(`/tasks/${task.id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) })
    const updated = await res.json()
    setBoard(b => {
      const from = b[task.status].filter(t => t.id !== task.id)
      const to = [...b[newStatus], updated]
      return { ...b, [task.status]: from, [newStatus]: to }
    })
  }

  async function remove(task) {
    await fetch(`/tasks/${task.id}`, { method: 'DELETE', headers })
    setBoard(b => ({ ...b, [task.status]: b[task.status].filter(t => t.id !== task.id) }))
  }

  const total = Object.values(board).flat().length

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#1e293b', margin: 0 }}>Tableau Kanban</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{total} tâche{total !== 1 ? 's' : ''}</p>
          </div>
          <button style={{ ...s.btn, background: '#ef4444', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }} onClick={onLogout}>
            Déconnexion
          </button>
        </div>

        <form style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }} onSubmit={addTask}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Nouvelle tâche..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button style={{ ...s.btn, padding: '0.75rem 1.4rem' }} type="submit">+ Ajouter</button>
        </form>

        {loading
          ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'start' }}>
              {COLUMNS.map(col => (
                <div key={col.key} style={{ background: col.color, borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: col.accent }}>{col.label}</h3>
                    <span style={{ background: col.accent, color: '#fff', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.78rem' }}>
                      {board[col.key].length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {board[col.key].length === 0 && (
                      <p style={{ color: '#aaa', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>Vide</p>
                    )}
                    {board[col.key].map(task => (
                      <div key={task.id} style={{ background: '#fff', borderRadius: '6px', padding: '0.7rem 0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#1e293b', wordBreak: 'break-word' }}>{task.title}</p>
                        {task.description && (
                          <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>{task.description}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {PREV[task.status] && (
                              <button onClick={() => move(task, 'prev')} style={s.moveBtn} title="Reculer">←</button>
                            )}
                            {NEXT[task.status] && (
                              <button onClick={() => move(task, 'next')} style={{ ...s.moveBtn, background: col.accent, color: '#fff' }} title="Avancer">→</button>
                            )}
                          </div>
                          <button onClick={() => remove(task)} style={s.deleteBtn} title="Supprimer">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { fontSize: '1.5rem', color: '#333' },
  input: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#e74c3c' },
  success: { color: '#27ae60' },
  link: { textAlign: 'center', color: '#555' },
  a: { color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' },
  moveBtn: { background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' },
  deleteBtn: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem' },
}
