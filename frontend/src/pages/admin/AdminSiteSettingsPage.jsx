import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getSiteSettings, updateSiteSettings } from '../../api/siteSettings'
import { SiteSettingsForm } from '../../components/admin/SiteSettingsForm'
import { getApiErrorDetails } from '../../utils/apiError'

export function AdminSiteSettingsPage() {
  const navigate = useNavigate()

  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getSiteSettings()
      setSettings(response)
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
      const updated = await updateSiteSettings(payload)
      setSettings(updated)
      toast.success('Site settings saved')
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
    navigate('/admin')
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/4 px-6 py-16 text-center text-white/55">
        Loading site settings...
      </section>
    )
  }

  if (pageError && !settings) {
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
          Back to dashboard
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <SiteSettingsForm
        settings={settings}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />
    </section>
  )
}
