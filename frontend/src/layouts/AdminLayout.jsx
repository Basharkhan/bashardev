import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { useAuth } from '../auth/auth-context'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  function handleLogout() {
    setIsMobileNavOpen(false)
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#161616] text-[#f7f1e8]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[260px_1fr] lg:gap-6 lg:px-5 lg:py-5">
        <aside className="hidden rounded-[28px] border border-white/10 bg-white/5 p-5 lg:block">
          <AdminSidebar user={user} onLogout={handleLogout} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <header className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Admin panel</p>
              <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold text-white">BasharDev</p>
            </div>

            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Open navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-['Space_Grotesk'] text-xl font-semibold text-white">Navigation</SheetTitle>
                  <SheetDescription className="text-sm text-white/55">
                    Move between dashboard, posts, tags, and media on smaller screens.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex-1">
                  <AdminSidebar
                    user={user}
                    onLogout={handleLogout}
                    onNavigate={() => setIsMobileNavOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <main className="min-w-0 rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-5 lg:rounded-[32px] lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
