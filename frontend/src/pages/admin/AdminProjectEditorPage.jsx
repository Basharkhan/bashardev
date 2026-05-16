import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProject, getAdminProjectById, updateProject } from '../../api/projects'
import { ProjectEditorForm } from '../../components/admin/ProjectEditorForm'
import { getApiErrorDetails } from '../../utils/apiError'

export function AdminProjectEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!isEditMode) {
      setProject(null)
      setIsLoading(false)
      return
    }

    loadProject(id)
  }, [id, isEditMode])

  async function loadProject(projectId) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminProjectById(projectId)
      setProject(response)
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (details.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }

      setPageError(details.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(payload) {
    setIsSaving(true)

    try {
      if (isEditMode) {
        await updateProject(id, payload)
      } else {
        await createProject(payload)
      }

      navigate('/admin/projects')
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (details.status === 401) {
        navigate('/admin/login', { replace: true })
      }

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  function handleBack() {
    navigate('/admin/projects')
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/4 px-6 py-16 text-center text-white/55">
        Loading project editor...
      </section>
    )
  }

  if (pageError && isEditMode && !project) {
    return (
      <section className="space-y-5">
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full border border-white/12 px-5 py-3 font-medium text-white/75 transition hover:bg-white/8"
        >
          Back to projects
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {pageError && !isEditMode ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <ProjectEditorForm
        project={project}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />
    </section>
  )
}
