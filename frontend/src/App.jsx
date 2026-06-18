import { useState } from 'react'

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

  if (token) return <Home onLogout={handleLogout} />
  if (page === 'register') return <Register onBack={() => setPage('login')} />
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

function Register({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
      setSuccess(true)
      setTimeout(onBack, 1500)
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
        {success && <p style={s.success}>Compte créé ! Redirection...</p>}
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

function Home({ onLogout }) {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Bienvenue !</h2>
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>Vous êtes connecté.</p>
        <button style={{ ...s.btn, background: '#e74c3c' }} onClick={onLogout}>
          Se déconnecter
        </button>
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
