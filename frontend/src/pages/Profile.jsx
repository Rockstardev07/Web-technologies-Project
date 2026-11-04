import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Profile.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const EMPTY_PROFILE = { username: '', email: '', age: '' }

function getCachedUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user ? {
      username: user.username || '',
      email: user.email || user.emailId || '',
      age: user.age ?? '',
    } : EMPTY_PROFILE
  } catch {
    return EMPTY_PROFILE
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(getCachedUser)
  const [form, setForm] = useState(getCachedUser)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadProfile() {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please sign in to view your profile.')
        setLoading(false)
        return
      }
      try {
        const cached = getCachedUser()
        const query = cached.email ? `?emailId=${encodeURIComponent(cached.email)}` : ''
        const response = await fetch(`${API_URL}/api/users${query}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Unable to load your profile.')
        const user = data.user || data
        const nextProfile = { username: user.username || '', email: user.email || user.emailId || '', age: user.age ?? '' }
        if (active) {
          setProfile(nextProfile)
          setForm(nextProfile)
          localStorage.setItem('user', JSON.stringify({ ...user, emailId: nextProfile.email }))
          setError('')
        }
      } catch (cause) {
        if (active) setError(cause.message || 'Unable to load your profile.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProfile()
    return () => { active = false }
  }, [])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function saveProfile() {
    setError('')
    setMessage('')
    const token = localStorage.getItem('token')
    if (!token || !profile.email) {
      setError('A signed-in account with an email address is required to update your profile.')
      return
    }
    const complete = { username: form.username.trim(), age: Number(form.age) }
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/users?emailId=${encodeURIComponent(profile.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(complete),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to save your profile.')
      const user = data.user || {}
      const nextProfile = {
        username: user.username ?? complete.username,
        email: user.email || user.emailId || profile.email,
        age: user.age ?? complete.age,
      }
      setProfile(nextProfile)
      setForm(nextProfile)
      setEditing(false)
      localStorage.setItem('user', JSON.stringify({ ...user, ...nextProfile, emailId: nextProfile.email }))
      setMessage('User profile updated successfully.')
    } catch (cause) {
      const cleanError = (cause.message || 'Unable to update your profile.')
        .replace(/\s*using\s*(PUT|PATCH)/gi, '')
        .replace(/\s*\((PUT|PATCH)\)/gi, '')
      setError(cleanError)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return
    const token = localStorage.getItem('token')
    if (!token || !profile.email) {
      setError('A signed-in account with an email address is required to delete your account.')
      return
    }
    setDeleting(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${API_URL}/api/users?emailId=${encodeURIComponent(profile.email)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to delete your account.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setDeleted(true)
      setMessage('Your account was deleted successfully.')
    } catch (cause) {
      setError(cause.message || 'Unable to delete your account.')
    } finally {
      setDeleting(false)
    }
  }

  function cancelEditing() {
    setForm(profile)
    setEditing(false)
    setError('')
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <p className="profile-kicker">ACCOUNT SETTINGS</p>
        <h1>Your profile</h1>
        <p>View and manage your Kaadugal account details.</p>
      </header>
      {error && <p className="profile-alert profile-alert-error" role="alert">{error}</p>}
      {message && <p className="profile-alert profile-alert-success" role="status">{message}</p>}
      {loading ? (
        <p className="profile-loading" role="status">Loading profile…</p>
      ) : deleted ? (
        <section className="profile-card profile-deleted">
          <h2>Account deleted</h2>
          <p>Your account and sign-in session have been removed.</p>
          <Link to="/register">Create a new account</Link>
        </section>
      ) : (
        <section className="profile-card">
          {!editing ? (
            <>
              <dl className="profile-details">
                <div><dt>Username</dt><dd>{profile.username || '—'}</dd></div>
                <div><dt>Email address</dt><dd>{profile.email || '—'}</dd></div>
                <div><dt>Age</dt><dd>{profile.age || '—'}</dd></div>
              </dl>
              <div className="profile-actions">
                <button type="button" className="profile-primary-button" onClick={() => setEditing(true)}>
                  Edit profile
                </button>
                <button type="button" className="profile-delete-button" onClick={deleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete account'}
                </button>
              </div>
            </>
          ) : (
            <form className="profile-edit-form" onSubmit={(event) => { event.preventDefault(); saveProfile() }}>
              <h2>Edit account details</h2>
              <label htmlFor="profile-username">Username</label>
              <input id="profile-username" name="username" value={form.username} onChange={updateField} minLength="2" required />
              <label htmlFor="profile-email">Email address</label>
              <input id="profile-email" name="email" type="email" value={form.email} readOnly aria-describedby="profile-email-note" />
              <small id="profile-email-note">Email changes are not supported by the current profile API.</small>
              <label htmlFor="profile-age">Age</label>
              <input id="profile-age" name="age" type="number" min="1" value={form.age} onChange={updateField} required />
              <div className="profile-actions">
                <button type="submit" className="profile-primary-button" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="profile-secondary-button" onClick={cancelEditing} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </main>
  )
}
