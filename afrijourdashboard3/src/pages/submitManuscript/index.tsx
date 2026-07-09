import { useState, useEffect } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import {
  IconUpload,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'

interface JournalOption {
  id: number
  journal_title: string
  approved?: boolean
}

const SubmitManuscript = () => {
  // Form fields
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [authors, setAuthors] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  // Journal selector
  const [journals, setJournals] = useState<JournalOption[]>([])
  const [journalId, setJournalId] = useState<string>('')
  const [journalSearch, setJournalSearch] = useState('')
  const [journalPickerOpen, setJournalPickerOpen] = useState(false)
  const [journalsLoading, setJournalsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const firstRes = await fetch(
          `${BASE_URL}/journal_api/journals/?page=1&page_size=100`
        )
        if (!firstRes.ok) throw new Error(`HTTP ${firstRes.status}`)
        const first = await firstRes.json()
        const total: number = first.count ?? first.results?.length ?? 0
        const pageSize = first.results?.length || 100
        const pageCount = Math.ceil(total / pageSize)
        const rest = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
            fetch(
              `${BASE_URL}/journal_api/journals/?page=${i + 2}&page_size=${pageSize}`
            )
              .then((r) => (r.ok ? r.json() : { results: [] }))
              .catch(() => ({ results: [] }))
          )
        )
        const all: JournalOption[] = [first, ...rest]
          .flatMap((p: any) => p.results || [])
          .map((j: any) => ({
            id: j.id,
            journal_title: j.journal_title,
            approved: Boolean(j.approved),
          }))
          .filter((j: JournalOption) => j.approved)
          .sort((a: JournalOption, b: JournalOption) =>
            a.journal_title.localeCompare(b.journal_title)
          )
        if (!cancelled) setJournals(all)
      } catch (err) {
        console.error('Failed to load journals list', err)
      } finally {
        if (!cancelled) setJournalsLoading(false)
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

  const selectedJournalTitle =
    journals.find((j) => String(j.id) === journalId)?.journal_title ?? ''

  const handleSubmit = async () => {
    setMessage('')
    setSuccess(false)
    if (!title || !abstract || !authors || !file || !journalId) {
      setMessage('Please complete every required field.')
      return
    }
    const token = getToken()
    if (!token) {
      setMessage('Not authenticated. Please sign in again.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('journal', journalId)
      fd.append('title', title)
      fd.append('abstract', abstract)
      fd.append('authors', authors)
      fd.append('file', file)
      const response = await fetch(
        `${BASE_URL}/journal_api/api/manuscripts/submit/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      )
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setMessage('Manuscript submitted successfully.')
        setTitle('')
        setAbstract('')
        setAuthors('')
        setFile(null)
        setJournalId('')
        setJournalSearch('')
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

  const filteredJournals = (() => {
    const q = journalSearch.trim().toLowerCase()
    return q
      ? journals.filter((j) => j.journal_title.toLowerCase().includes(q))
      : journals
  })()

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            Submit manuscript
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Submit a paper for peer review. Corresponding author is set from
            your account.
          </p>
        </div>

        {/* Result banner */}
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
              {/* Journal picker */}
              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Journal <span className='text-red-400'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={journalSearch}
                    onChange={(e) => {
                      setJournalSearch(e.target.value)
                      setJournalId('')
                      setJournalPickerOpen(true)
                    }}
                    onFocus={() => setJournalPickerOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setJournalPickerOpen(false), 150)
                    }
                    placeholder={
                      journalsLoading
                        ? 'Loading approved journals…'
                        : 'Start typing to search…'
                    }
                    disabled={journalsLoading}
                    className='w-full rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60'
                    autoComplete='off'
                  />
                  {journalPickerOpen && !journalsLoading && (
                    <ul className='absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border/60 bg-popover shadow-xl'>
                      {filteredJournals.length === 0 ? (
                        <li className='p-3 text-sm text-muted-foreground'>
                          No matching approved journals.
                        </li>
                      ) : (
                        filteredJournals.slice(0, 100).map((j) => (
                          <li
                            key={j.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setJournalId(String(j.id))
                              setJournalSearch(j.journal_title)
                              setJournalPickerOpen(false)
                            }}
                            className={
                              'cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-muted/60 ' +
                              (String(j.id) === journalId
                                ? 'bg-primary/15 text-primary'
                                : '')
                            }
                          >
                            {j.journal_title}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                {journalId && (
                  <p className='mt-1.5 flex items-center gap-1 text-xs text-emerald-400'>
                    <IconCheck className='h-3.5 w-3.5' />
                    Selected · {selectedJournalTitle} · id {journalId}
                  </p>
                )}
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Manuscript title <span className='text-red-400'>*</span>
                </label>
                <input
                  className='w-full rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. Novel methods in African peer review'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Authors <span className='text-red-400'>*</span>
                </label>
                <input
                  className='w-full rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder='Comma-separated, e.g. Ada Lovelace, Alan Turing'
                />
              </div>
            </div>

            {/* RIGHT column */}
            <div className='space-y-5'>
              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Abstract <span className='text-red-400'>*</span>
                </label>
                <textarea
                  rows={7}
                  className='w-full resize-none rounded-md border border-border/60 bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder='Summarize the manuscript in ~200 words.'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Manuscript file <span className='text-red-400'>*</span>
                </label>
                <label className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border/60 bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-muted/40'>
                  <IconUpload className='h-5 w-5 text-primary' />
                  {file ? (
                    <>
                      <span className='font-medium text-foreground'>
                        {file.name}
                      </span>
                      <span className='text-xs'>Click to replace</span>
                    </>
                  ) : (
                    <>
                      <span>
                        <span className='font-medium text-primary'>
                          Choose a file
                        </span>{' '}
                        or drag and drop
                      </span>
                      <span className='text-xs'>PDF, DOC or DOCX</span>
                    </>
                  )}
                  <input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    className='hidden'
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className='mt-8 flex flex-col items-stretch gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-end'>
            <button
              type='button'
              onClick={() => {
                setTitle('')
                setAbstract('')
                setAuthors('')
                setFile(null)
                setJournalId('')
                setJournalSearch('')
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
              {loading ? 'Submitting…' : 'Submit manuscript'}
            </button>
          </div>
        </div>
      </Layout.Body>
    </Layout>
  )
}

export default SubmitManuscript
