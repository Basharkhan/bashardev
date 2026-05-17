import { ArrowLeft, Globe, Link, Mail, MapPin, Save, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { cn } from '../../lib/utils'
import { getApiErrorDetails } from '../../utils/apiError'

const initialFormData = {
  siteTitle: '',
  siteDescription: '',
  ownerName: '',
  headline: '',
  shortBio: '',
  fullBio: '',
  location: '',
  email: '',
  githubUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  resumeUrl: '',
  profileImageUrl: '',
  heroImageUrl: '',
}

function SidebarSection({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="space-y-1">
        <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">{title}</p>
        {description ? <p className="text-sm text-white/55">{description}</p> : null}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function fromSettings(settings) {
  if (!settings) {
    return initialFormData
  }

  return {
    siteTitle: settings.siteTitle ?? '',
    siteDescription: settings.siteDescription ?? '',
    ownerName: settings.ownerName ?? '',
    headline: settings.headline ?? '',
    shortBio: settings.shortBio ?? '',
    fullBio: settings.fullBio ?? '',
    location: settings.location ?? '',
    email: settings.email ?? '',
    githubUrl: settings.githubUrl ?? '',
    linkedinUrl: settings.linkedinUrl ?? '',
    twitterUrl: settings.twitterUrl ?? '',
    resumeUrl: settings.resumeUrl ?? '',
    profileImageUrl: settings.profileImageUrl ?? '',
    heroImageUrl: settings.heroImageUrl ?? '',
  }
}

function toPayload(formData) {
  return {
    siteTitle: formData.siteTitle.trim(),
    siteDescription: formData.siteDescription.trim(),
    ownerName: formData.ownerName.trim(),
    headline: formData.headline.trim(),
    shortBio: formData.shortBio.trim(),
    fullBio: formData.fullBio.trim(),
    location: formData.location.trim(),
    email: formData.email.trim(),
    githubUrl: formData.githubUrl.trim(),
    linkedinUrl: formData.linkedinUrl.trim(),
    twitterUrl: formData.twitterUrl.trim(),
    resumeUrl: formData.resumeUrl.trim(),
    profileImageUrl: formData.profileImageUrl.trim(),
    heroImageUrl: formData.heroImageUrl.trim(),
  }
}

function hasFieldErrors(fieldErrors) {
  return Object.keys(fieldErrors || {}).length > 0
}

export function SiteSettingsForm({ settings, onBack, onSubmit, isSubmitting }) {
  const [pageError, setPageError] = useState('')

  const defaultValues = useMemo(() => fromSettings(settings), [settings])

  const form = useForm({ defaultValues })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = form

  useEffect(() => {
    reset(defaultValues)
    setPageError('')
  }, [defaultValues, reset])

  async function submitForm(values) {
    setPageError('')

    try {
      await onSubmit(toPayload(values))
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (hasFieldErrors(details.fieldErrors)) {
        Object.entries(details.fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message })
        })
        return
      }

      setPageError(details.message)
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        {pageError ? (
          <div className="rounded-[24px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
            {pageError}
          </div>
        ) : null}

        <div className="sticky top-4 z-10 rounded-[28px] border border-white/10 bg-[#111111]/95 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur sm:px-5">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="submit" form="site-settings-form" disabled={isSubmitting}>
              <Save className="size-4" />
              {isSubmitting ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </div>

        <form
          id="site-settings-form"
          className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]"
          onSubmit={handleSubmit(submitForm)}
        >
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] lg:p-8">
              <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                <Globe className="size-5 text-white/40" />
                <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white">Site identity</p>
              </div>

              <div className="mt-6 space-y-6">
                <div className="space-y-5">
                  <FormField
                    control={control}
                    name="siteTitle"
                    render={() => (
                      <FormItem>
                        <FormLabel>Site title</FormLabel>
                        <FormControl>
                          <Input
                            id="site-title"
                            placeholder="BasharDev"
                            {...register('siteTitle', {
                              onChange: () => {
                                clearErrors('siteTitle')
                                setPageError('')
                              },
                            })}
                            className={cn(errors.siteTitle && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="siteDescription"
                    render={() => (
                      <FormItem>
                        <FormLabel>Site description</FormLabel>
                        <FormDescription>Short tagline shown in browser tabs and search results.</FormDescription>
                        <FormControl>
                          <Input
                            id="site-description"
                            placeholder="Personal portfolio and blog"
                            {...register('siteDescription', {
                              onChange: () => {
                                clearErrors('siteDescription')
                                setPageError('')
                              },
                            })}
                            className={cn(errors.siteDescription && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={control}
                      name="ownerName"
                      render={() => (
                        <FormItem>
                          <FormLabel>Owner name</FormLabel>
                          <FormControl>
                            <Input
                              id="owner-name"
                              placeholder="Bashar Khan"
                              {...register('ownerName', {
                                onChange: () => {
                                  clearErrors('ownerName')
                                  setPageError('')
                                },
                              })}
                              className={cn(errors.ownerName && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="headline"
                      render={() => (
                        <FormItem>
                          <FormLabel>Headline</FormLabel>
                          <FormControl>
                            <Input
                              id="headline"
                              placeholder="Software Developer"
                              {...register('headline', {
                                onChange: () => {
                                  clearErrors('headline')
                                  setPageError('')
                                },
                              })}
                              className={cn(errors.headline && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                <User className="size-5 text-white/40" />
                <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white">Bio</p>
              </div>

              <div className="mt-6 space-y-5">
                <FormField
                  control={control}
                  name="shortBio"
                  render={() => (
                    <FormItem>
                      <FormLabel>Short bio</FormLabel>
                      <FormDescription>One or two sentences for the hero section and preview cards.</FormDescription>
                      <FormControl>
                        <Textarea
                          id="short-bio"
                          rows={3}
                          placeholder="Full-stack developer building modern web applications."
                          {...register('shortBio', {
                            onChange: () => {
                              clearErrors('shortBio')
                              setPageError('')
                            },
                          })}
                          className={cn(errors.shortBio && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="fullBio"
                  render={() => (
                    <FormItem>
                      <FormLabel>Full bio</FormLabel>
                      <FormDescription>Longer background for the about section. Optional.</FormDescription>
                      <FormControl>
                        <Textarea
                          id="full-bio"
                          rows={8}
                          placeholder="Tell your story in more detail..."
                          {...register('fullBio', {
                            onChange: () => {
                              clearErrors('fullBio')
                              setPageError('')
                            },
                          })}
                          className={cn(
                            'bg-[#121212] font-mono leading-7 focus:bg-[#171717]',
                            errors.fullBio && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <SidebarSection title="Contact" description="Where visitors can reach you.">
              <FormField
                control={control}
                name="location"
                render={() => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        id="location"
                        placeholder="Dhaka, Bangladesh"
                        {...register('location', {
                          onChange: () => {
                            clearErrors('location')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.location && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={() => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="hello@example.com"
                        {...register('email', {
                          onChange: () => {
                            clearErrors('email')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.email && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SidebarSection>

            <SidebarSection title="Links" description="Social profiles and external resources.">
              <FormField
                control={control}
                name="githubUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input
                        id="github-url"
                        type="url"
                        placeholder="https://github.com/username"
                        {...register('githubUrl', {
                          onChange: () => {
                            clearErrors('githubUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.githubUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="linkedinUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        id="linkedin-url"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        {...register('linkedinUrl', {
                          onChange: () => {
                            clearErrors('linkedinUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.linkedinUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="twitterUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input
                        id="twitter-url"
                        type="url"
                        placeholder="https://twitter.com/username"
                        {...register('twitterUrl', {
                          onChange: () => {
                            clearErrors('twitterUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.twitterUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="resumeUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                      <Input
                        id="resume-url"
                        type="url"
                        placeholder="https://example.com/resume.pdf"
                        {...register('resumeUrl', {
                          onChange: () => {
                            clearErrors('resumeUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.resumeUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SidebarSection>

            <SidebarSection title="Media" description="Profile and hero images for the public site.">
              <FormField
                control={control}
                name="profileImageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Profile image URL</FormLabel>
                    <FormControl>
                      <Input
                        id="profile-image-url"
                        type="url"
                        placeholder="https://example.com/profile.jpg"
                        {...register('profileImageUrl', {
                          onChange: () => {
                            clearErrors('profileImageUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.profileImageUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="heroImageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Hero image URL</FormLabel>
                    <FormControl>
                      <Input
                        id="hero-image-url"
                        type="url"
                        placeholder="https://example.com/hero.jpg"
                        {...register('heroImageUrl', {
                          onChange: () => {
                            clearErrors('heroImageUrl')
                            setPageError('')
                          },
                        })}
                        className={cn(errors.heroImageUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SidebarSection>
          </aside>
        </form>
      </div>
    </Form>
  )
}
