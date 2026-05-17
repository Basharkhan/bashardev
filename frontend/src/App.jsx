import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminBlogPostEditorPage } from './pages/admin/AdminBlogPostEditorPage'
import { AdminBlogPostsPage } from './pages/admin/AdminBlogPostsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminMediaPage } from './pages/admin/AdminMediaPage'
import { AdminProjectEditorPage } from './pages/admin/AdminProjectEditorPage'
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage'
import { AdminSiteSettingsPage } from './pages/admin/AdminSiteSettingsPage'
import { AdminTagsPage } from './pages/admin/AdminTagsPage'
import { AdminContactMessagesPage } from './pages/admin/AdminContactMessagesPage'
import { AdminContactMessageDetailPage } from './pages/admin/AdminContactMessageDetailPage'
import { BlogDetailPage } from './pages/public/BlogDetailPage'
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
        <Route path="settings" element={<AdminSiteSettingsPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="projects/new" element={<AdminProjectEditorPage />} />
        <Route path="projects/:id/edit" element={<AdminProjectEditorPage />} />
        <Route path="blog-posts" element={<AdminBlogPostsPage />} />
        <Route path="blog-posts/new" element={<AdminBlogPostEditorPage />} />
        <Route path="blog-posts/:id/edit" element={<AdminBlogPostEditorPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="tags" element={<AdminTagsPage />} />
        <Route path="contact-messages" element={<AdminContactMessagesPage />} />
        <Route path="contact-messages/:id" element={<AdminContactMessageDetailPage />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
