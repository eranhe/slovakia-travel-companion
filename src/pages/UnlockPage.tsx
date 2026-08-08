import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { appConfig } from '@/config/env'
import { useApp } from '@/providers/AppProvider'

export function UnlockPage() {
  const navigate = useNavigate()
  const { preferences, sessionMode, login } = useApp()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const isHe = preferences.locale === 'he'

  if (sessionMode === 'open') return <Navigate to="/today" replace />

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!login(password)) {
      setError(true)
      return
    }
    setPassword('')
    navigate('/today', { replace: true })
  }

  return (
    <div className="unlock-page">
      <div className="unlock-card">
        <p className="unlock-kicker">{appConfig.tripLabel}</p>
        <h1>{isHe ? 'הטיול המשפחתי שלנו' : 'Our family trip'}</h1>
        <p className="unlock-subtitle">
          {isHe ? 'הזן סיסמה כדי להיכנס.' : 'Enter the password to continue.'}
        </p>

        <form className="unlock-form" onSubmit={handleSubmit}>
          <label htmlFor="password">{isHe ? 'סיסמה' : 'Password'}</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(false)
            }}
          />
          {error ? (
            <p className="form-error" role="alert">
              {isHe ? 'סיסמה שגויה.' : 'Wrong password.'}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary">
            {isHe ? 'כניסה' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
