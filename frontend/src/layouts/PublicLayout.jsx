import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#projects', label: 'Projects' },
  { href: '#blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
]

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#fffaf2]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-['Space_Grotesk'] text-xl font-semibold tracking-tight">
            BasharDev
          </Link>
          <nav className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1 text-sm">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={`/${item.href}`}
                className="rounded-full px-4 py-2 text-black/65 transition hover:bg-black/5"
              >
                {item.label}
              </a>
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
