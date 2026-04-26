import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { BlogDetailPage } from './pages/public/BlogDetailPage'
import { BlogListPage } from './pages/public/BlogListPage'
import { ContactPage } from './pages/public/ContactPage'
import { HomePage } from './pages/public/HomePage'
import { ProjectDetailPage } from './pages/public/ProjectDetailPage'
import { ProjectsPage } from './pages/public/ProjectsPage'
import { NotFoundPage } from './pages/shared/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="blog" element={<BlogListPage />} />
        <Route path="blog/:slug" element={<BlogDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
