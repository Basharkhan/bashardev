import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getApiErrorDetails } from '../../utils/apiError'

export function AdminLoginPage() {
  const { isAuthenticated, isAuthReady, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthReady && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required.'
    }

    if (!formData.password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      })
      navigate(location.state?.from?.pathname || '/admin', { replace: true })
    } catch (error) {
      const details = getApiErrorDetails(error)
      setFieldErrors(details.fieldErrors)
      setFormError(details.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#161616] px-5 py-10 text-[#f7f1e8]">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin access</p>
          <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight lg:text-5xl">
            Manage blog content without leaving the app shell.
          </h1>
          <p className="mt-5 max-w-xl text-white/68">
            This admin area is now wired for login and content management. Start with the seeded admin account, then move into blog CRUD.
          </p>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#101010] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <h2 className="font-['Space_Grotesk'] text-2xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-white/55">Use the backend admin credentials to continue.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-white/75">Username</span>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/35"
                placeholder="admin"
              />
              {fieldErrors.username ? <span className="text-sm text-[#f7a28c]">{fieldErrors.username}</span> : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-white/75">Password</span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/35"
                placeholder="••••••••"
              />
              {fieldErrors.password ? <span className="text-sm text-[#f7a28c]">{fieldErrors.password}</span> : null}
            </label>

            {formError ? <p className="rounded-2xl border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">{formError}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#f5efe3] px-5 py-3 font-medium text-[#161616] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
