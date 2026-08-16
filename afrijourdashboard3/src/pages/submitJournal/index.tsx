import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import {
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

interface RefOption {
  id: number
  label: string
}

const toOptions = (
  data: any,
  labelKey: string
): RefOption[] => {
  const rows = Array.isArray(data) ? data : (data?.results ?? [])
  return rows
    .map((r: any) => ({ id: r.id, label: r[labelKey] ?? '' }))
    .filter((o: RefOption) => o.label)
    .sort((a: RefOption, b: RefOption) => a.label.localeCompare(b.label))
}

const SubmitJournal = () => {
  const navigate = useNavigate()

  // Journal fields
  const [journalTitle, setJournalTitle] = useState('')
  const [publishersName, setPublishersName] = useState('')
  const [issnNumber, setIssnNumber] = useState('')
  const [link, setLink] = useState('')
  const [summary, setSummary] = useState('')

  const [languageId, setLanguageId] = useState('')
  const [platformId, setPlatformId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [thematicAreaId, setThematicAreaId] = useState('')

  // Booleans (author-attestable)
  const [aimIdentifier, setAimIdentifier] = useState(false)
  const [openAccess, setOpenAccess] = useState(false)
  const [listedInDoaj, setListedInDoaj] = useState(false)
  const [presentIssn, setPresentIssn] = useState(false)
  const [publisherInCope, setPublisherInCope] = useState(false)
  const [onlinePublisherAfrica, setOnlinePublisherAfrica] = useState(false)
  const [hostedOnInasps, setHostedOnInasps] = useState(false)
  const [googleScholarIndex, setGoogleScholarIndex] = useState(false)

  // Optional first volume
  const [includeVolume, setIncludeVolume] = useState(false)
  const [volumeNumber, setVolumeNumber] = useState('')
  const [issueNumber, setIssueNumber] = useState('1')
  const [volumeYear, setVolumeYear] = useState('')

  // Reference data
  const [languages, setLanguages] = useState<RefOption[]>([])
  const [platforms, setPlatforms] = useState<RefOption[]>([])
  const [countries, setCountries] = useState<RefOption[]>([])
  const [thematicAreas, setThematicAreas] = useState<RefOption[]>([])
  const [refsLoading, setRefsLoading] = useState(true)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [lang, plat, ctry, them] = await Promise.all([
          fetch(`${BASE_URL}/journal_api/api/languages/`).then((r) => r.json()),
          fetch(`${BASE_URL}/journal_api/api/platform/`).then((r) => r.json()),
          fetch(`${BASE_URL}/journal_api/api/country/`).then((r) => r.json()),
          fetch(`${BASE_URL}/journal_api/api/thematic/`).then((r) => r.json()),
        ])
        if (cancelled) return
        setLanguages(toOptions(lang, 'language'))
        setPlatforms(toOptions(plat, 'platform'))
        setCountries(toOptions(ctry, 'country'))
        setThematicAreas(toOptions(them, 'thematic_area'))
      } catch (err) {
        console.error('Failed to load reference data', err)
      } finally {
        if (!cancelled) setRefsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const getToken = () => {
    const t = localStorage.getItem('authTokens')
    return t ? JSON.parse(t).access : null
  }

  const resetForm = () => {
    setJournalTitle('')
    setPublishersName('')
    setIssnNumber('')
    setLink('')
    setSummary('')
    setLanguageId('')
    setPlatformId('')
    setCountryId('')
    setThematicAreaId('')
    setAimIdentifier(false)
    setOpenAccess(false)
    setListedInDoaj(false)
    setPresentIssn(false)
    setPublisherInCope(false)
    setOnlinePublisherAfrica(false)
    setHostedOnInasps(false)
    setGoogleScholarIndex(false)
    setIncludeVolume(false)
    setVolumeNumber('')
    setIssueNumber('1')
    setVolumeYear('')
  }

  const handleSubmit = async () => {
    setMessage('')
    setSuccess(false)

    if (!journalTitle.trim()) {
      setMessage('Journal title is required.')
      return
    }

    const token = getToken()
    if (!token) {
      setMessage('Not authenticated. Please sign in again.')
      return
    }

    const payload: Record<string, unknown> = {
      journal_title: journalTitle.trim(),
      publishers_name: publishersName.trim() || null,
      issn_number: issnNumber.trim() || null,
      link: link.trim() || null,
      summary: summary.trim() || null,
      language: languageId ? Number(languageId) : null,
      platform: platformId ? Number(platformId) : null,
      country: countryId ? Number(countryId) : null,
      thematic_area: thematicAreaId ? Number(thematicAreaId) : null,
      aim_identifier: aimIdentifier,
      open_access_journal: openAccess,
      listed_in_doaj: listedInDoaj,
      present_issn: presentIssn,
      publisher_in_cope: publisherInCope,
      online_publisher_africa: onlinePublisherAfrica,
      hosted_on_inasps: hostedOnInasps,
      google_scholar_index: googleScholarIndex,
    }

    if (includeVolume) {
      if (!volumeNumber || !volumeYear) {
        setMessage(
          'Volume number and year are required when adding a first volume.'
        )
        return
      }
      payload.volume = {
        volume_number: Number(volumeNumber),
        issue_number: Number(issueNumber) || 1,
        year: Number(volumeYear),
      }
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${BASE_URL}/journal_api/api/journals/submit/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setSuccess(true)
        setMessage(
          data.message ??
            'Journal submitted successfully and is awaiting editor approval.'
        )
        resetForm()
        setTimeout(() => navigate('/journal_list'), 1500)
      } else {
        setMessage(data.detail || data.error || JSON.stringify(data))
      }
    } catch (err) {
      console.error(err)
      setMessage('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

  const renderSelect = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    options: RefOption[]
  ) => (
    <div>
      <label className='mb-1.5 block text-sm font-medium'>{label}</label>
      <select
        className={inputClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={refsLoading}
      >
        <option value=''>
          {refsLoading ? 'Loading…' : `Select ${label.toLowerCase()}`}
        </option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderCheckbox = (
    label: string,
    checked: boolean,
    setChecked: (v: boolean) => void
  ) => (
    <label className='flex items-center gap-2 text-sm'>
      <input
        type='checkbox'
        className='h-4 w-4 rounded border-border/60 accent-primary'
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      {label}
    </label>
  )

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            Submit journal
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Submit a new journal for editor approval. Once approved, you can
            add volumes and articles to it.
          </p>
        </div>

        {message && (
          <div
            role='alert'
            className={
              'mb-6 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ' +
              (success
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300')
            }
          >
            {success ? (
              <IconCheck className='mt-0.5 h-4 w-4 shrink-0' />
            ) : (
              <IconAlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className='rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* LEFT column */}
            <div className='space-y-5'>
              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Journal title <span className='text-red-400'>*</span>
                </label>
                <input
                  className={inputClass}
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder='e.g. African Journal of Health Sciences'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Publisher name
                </label>
                <input
                  className={inputClass}
                  value={publishersName}
                  onChange={(e) => setPublishersName(e.target.value)}
                  placeholder='e.g. African Population and Health Research Center'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  ISSN number
                </label>
                <input
                  className={inputClass}
                  value={issnNumber}
                  onChange={(e) => setIssnNumber(e.target.value)}
                  placeholder='e.g. 1234-5678'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Journal URL
                </label>
                <input
                  className={inputClass}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder='https://…'
                />
              </div>

              {renderSelect('Language', languageId, setLanguageId, languages)}
              {renderSelect('Platform', platformId, setPlatformId, platforms)}
            </div>

            {/* RIGHT column */}
            <div className='space-y-5'>
              {renderSelect('Country', countryId, setCountryId, countries)}
              {renderSelect(
                'Thematic area',
                thematicAreaId,
                setThematicAreaId,
                thematicAreas
              )}

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Summary
                </label>
                <textarea
                  rows={6}
                  className='w-full resize-none rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder='Aims, scope, and target audience of the journal.'
                />
              </div>

              <div>
                <div className='mb-1.5 block text-sm font-medium'>
                  Indexing & policies
                </div>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {renderCheckbox('AIM identifier', aimIdentifier, setAimIdentifier)}
                  {renderCheckbox(
                    'Open access',
                    openAccess,
                    setOpenAccess
                  )}
                  {renderCheckbox(
                    'Listed in DOAJ',
                    listedInDoaj,
                    setListedInDoaj
                  )}
                  {renderCheckbox('ISSN present', presentIssn, setPresentIssn)}
                  {renderCheckbox(
                    'Publisher in COPE',
                    publisherInCope,
                    setPublisherInCope
                  )}
                  {renderCheckbox(
                    'Online publisher in Africa',
                    onlinePublisherAfrica,
                    setOnlinePublisherAfrica
                  )}
                  {renderCheckbox(
                    'Hosted on INASP',
                    hostedOnInasps,
                    setHostedOnInasps
                  )}
                  {renderCheckbox(
                    'Google Scholar indexed',
                    googleScholarIndex,
                    setGoogleScholarIndex
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optional first volume */}
          <div className='mt-8 rounded-lg border border-border/60 bg-background/40'>
            <button
              type='button'
              onClick={() => setIncludeVolume((v) => !v)}
              className='flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/40'
            >
              <span className='flex items-center gap-2'>
                {includeVolume ? (
                  <IconChevronDown className='h-4 w-4' />
                ) : (
                  <IconChevronRight className='h-4 w-4' />
                )}
                Add first volume (optional)
              </span>
              <span className='text-xs text-muted-foreground'>
                {includeVolume
                  ? 'A volume will be created alongside the journal'
                  : 'Skip and add volumes later after approval'}
              </span>
            </button>
            {includeVolume && (
              <div className='grid grid-cols-1 gap-4 border-t border-border/60 px-4 py-4 sm:grid-cols-3'>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    Volume number <span className='text-red-400'>*</span>
                  </label>
                  <input
                    className={inputClass}
                    type='number'
                    min={1}
                    value={volumeNumber}
                    onChange={(e) => setVolumeNumber(e.target.value)}
                    placeholder='e.g. 1'
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    Issue number
                  </label>
                  <input
                    className={inputClass}
                    type='number'
                    min={1}
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                    placeholder='1'
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    Year <span className='text-red-400'>*</span>
                  </label>
                  <input
                    className={inputClass}
                    type='number'
                    min={1900}
                    max={2100}
                    value={volumeYear}
                    onChange={(e) => setVolumeYear(e.target.value)}
                    placeholder='e.g. 2026'
                  />
                </div>
              </div>
            )}
          </div>

          <div className='mt-8 flex flex-col items-stretch gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-end'>
            <button
              type='button'
              onClick={() => {
                resetForm()
                setMessage('')
                setSuccess(false)
              }}
              disabled={loading}
              className='rounded-md border border-border/60 bg-card px-4 py-2 text-sm hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60'
            >
              Clear
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={loading}
              className='inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60'
            >
              {loading && <IconLoader2 className='h-4 w-4 animate-spin' />}
              {loading ? 'Submitting…' : 'Submit journal'}
            </button>
          </div>
        </div>
      </Layout.Body>
    </Layout>
  )
}

export default SubmitJournal
