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

function Home({ token, onLogout }) {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch('/todos', { headers })
      .then(r => r.json())
      .then(data => { setTodos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function add(e) {
    e.preventDefault()
    if (!input.trim()) return
    const res = await fetch('/todos', { method: 'POST', headers, body: JSON.stringify({ text: input.trim() }) })
    const todo = await res.json()
    setTodos([...todos, todo])
    setInput('')
  }

  async function toggle(id) {
    const res = await fetch(`/todos/${id}`, { method: 'PATCH', headers })
    const updated = await res.json()
    setTodos(todos.map(t => t.id === id ? updated : t))
  }

  async function remove(id) {
    await fetch(`/todos/${id}`, { method: 'DELETE', headers })
    setTodos(todos.filter(t => t.id !== id))
  }

  async function clearDone() {
    await fetch('/todos/done', { method: 'DELETE', headers })
    setTodos(todos.filter(t => !t.done))
  }

  const remaining = todos.filter(t => !t.done).length
  const hasDone = todos.some(t => t.done)

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={s.title}>Ma To-Do List</h2>
            {todos.length > 0 && (
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {remaining} tâche{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button style={{ ...s.btn, background: '#e74c3c', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onLogout}>
            Déconnexion
          </button>
        </div>

        <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={add}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Ajouter une tâche..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button style={{ ...s.btn, padding: '0.75rem 1.2rem', fontSize: '1.2rem' }} type="submit">+</button>
        </form>

        {loading && <p style={{ color: '#bbb', textAlign: 'center' }}>Chargement...</p>}
        {!loading && todos.length === 0 && (
          <p style={{ color: '#bbb', textAlign: 'center', padding: '1rem 0' }}>Aucune tâche pour le moment</p>
        )}

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {todos.map(t => (
            <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem', background: t.done ? '#f9f9f9' : '#fff', border: '1px solid #eee', borderRadius: '6px', opacity: t.done ? 0.6 : 1 }}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3498db' }} />
              <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#aaa' : '#333' }}>
                {t.text}
              </span>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
            </li>
          ))}
        </ul>

        {hasDone && (
          <button onClick={clearDone} style={{ background: 'none', border: '1px solid #ddd', color: '#888', borderRadius: '4px', padding: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            Supprimer les tâches terminées
          </button>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { fontSize: '1.5rem', color: '#333' },
  input: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.75rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#e74c3c' },
  success: { color: '#27ae60' },
  link: { textAlign: 'center', color: '#555' },
  a: { color: '#3498db', cursor: 'pointer', textDecoration: 'underline' },
}
