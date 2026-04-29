import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#161616] text-[#f7f1e8]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="font-['Space_Grotesk'] text-lg font-semibold">Admin</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/68">
            <p className="font-medium text-white">{user?.firstName || user?.username}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{user?.role}</p>
          </div>
          <nav className="mt-6 flex flex-col gap-2 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `rounded-xl px-4 py-3 transition ${isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/6'}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/blog-posts"
              className={({ isActive }) => `rounded-xl px-4 py-3 transition ${isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/6'}`}
            >
              Blog posts
            </NavLink>
            <NavLink
              to="/admin/tags"
              className={({ isActive }) => `rounded-xl px-4 py-3 transition ${isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/6'}`}
            >
              Tags
            </NavLink>
            <NavLink
              to="/admin/media"
              className={({ isActive }) => `rounded-xl px-4 py-3 transition ${isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/6'}`}
            >
              Media
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl border border-white/12 px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/8"
          >
            Sign out
          </button>
        </aside>
        <main className="rounded-[32px] border border-white/10 bg-white/5 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
