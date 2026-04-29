import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminBlogPostsPage } from './pages/admin/AdminBlogPostsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminMediaPage } from './pages/admin/AdminMediaPage'
import { AdminTagsPage } from './pages/admin/AdminTagsPage'
import { BlogDetailPage } from './pages/public/BlogDetailPage'
import { HomePage } from './pages/public/HomePage'
import { ProjectDetailPage } from './pages/public/ProjectDetailPage'
import { NotFoundPage } from './pages/shared/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<Navigate to="/#projects" replace />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="blog" element={<Navigate to="/#blog" replace />} />
        <Route path="blog/:slug" element={<BlogDetailPage />} />
        <Route path="contact" element={<Navigate to="/#contact" replace />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="blog-posts" element={<AdminBlogPostsPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="tags" element={<AdminTagsPage />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
