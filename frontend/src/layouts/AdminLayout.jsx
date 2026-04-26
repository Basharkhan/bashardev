import { NavLink, Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#161616] text-[#f7f1e8]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="font-['Space_Grotesk'] text-lg font-semibold">Admin</p>
          <nav className="mt-6 flex flex-col gap-2 text-sm">
            <NavLink to="/admin" end className="rounded-xl bg-white/10 px-4 py-3">
              Dashboard
            </NavLink>
          </nav>
        </aside>
        <main className="rounded-[32px] border border-white/10 bg-white/5 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
