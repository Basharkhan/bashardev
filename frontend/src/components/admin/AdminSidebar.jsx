import { Image, LayoutDashboard, LogOut, Tag, FileText, FolderKanban } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/blog-posts', label: 'Blog posts', icon: FileText },
  { to: '/admin/tags', label: 'Tags', icon: Tag },
  { to: '/admin/media', label: 'Media', icon: Image },
]

export function AdminSidebar({ user, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="font-['Space_Grotesk'] text-lg font-semibold">Admin</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/68">
          <p className="font-medium text-white">{user?.firstName || user?.username}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{user?.role}</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2 text-sm">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}>
            {({ isActive }) => (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 transition',
                  isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/6',
                )}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <Button variant="secondary" className="mt-6 w-full justify-start" onClick={onLogout}>
        <LogOut />
        <span>Sign out</span>
      </Button>
    </div>
  )
}
