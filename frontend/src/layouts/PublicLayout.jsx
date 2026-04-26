import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#fffaf2]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <NavLink to="/" className="font-['Space_Grotesk'] text-xl font-semibold tracking-tight">
            BasharDev
          </NavLink>
          <nav className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${isActive ? 'bg-[#1a1d1a] text-white' : 'text-black/65 hover:bg-black/5'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-black/10 bg-white/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-black/65 md:flex-row md:items-center md:justify-between">
          <p>Dynamic portfolio and dev blog in progress.</p>
          <NavLink to="/admin" className="font-medium text-[#32543f]">
            Admin
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
