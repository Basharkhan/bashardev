import { useParams } from 'react-router-dom'

export function ProjectDetailPage() {
  const { slug } = useParams()

  return (
    <section className="space-y-4">
      <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Project detail</p>
      <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">{slug}</h1>
      <p className="max-w-2xl text-black/70">
        This page is ready to consume a single project by slug.
      </p>
    </section>
  )
}
