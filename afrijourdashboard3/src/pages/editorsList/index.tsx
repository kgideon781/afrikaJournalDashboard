import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import { IconFileText, IconRefresh, IconChevronRight } from '@tabler/icons-react'
import { statusPillClasses, STATUS_LABEL } from '@/lib/ui-shared'

interface Manuscript {
  id: number
  journal: number
  journal_title: string
  title: string
  abstract: string
  file: string
  authors: string
  author: string
  status: string
  created_at: string
}

const EditorsList = () => {
  const [queue, setQueue] = useState<Manuscript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const navigate = useNavigate()

  const getToken = () =>
    JSON.parse(localStorage.getItem('authTokens') || '{}')?.access ?? null

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch(`${BASE_URL}/journal_api/api/editor/queue/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setQueue(Array.isArray(data) ? data : data?.results ?? [])
    } catch (err: any) {
      setError(err?.message ?? 'Error loading queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered =
    filter === 'all' ? queue : queue.filter((m) => m.status === filter)

  const counts = queue.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1
    return acc
  }, {})

  const filterOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: STATUS_LABEL.submitted },
    { value: 'under_review', label: STATUS_LABEL.under_review },
    { value: 'revision', label: STATUS_LABEL.revision },
    { value: 'accepted', label: STATUS_LABEL.accepted },
    { value: 'rejected', label: STATUS_LABEL.rejected },
  ]

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8'>
        {/* Header */}
        <div className='mb-5 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              Editor manuscript queue
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Assign reviewers, track progress, and issue final decisions.
            </p>
          </div>
          <button
            onClick={load}
            className='inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5 text-sm text-foreground/90 hover:border-primary/40 hover:bg-muted/40'
          >
            <IconRefresh size={16} />
            Refresh
          </button>
        </div>

        {/* Filter chips — scroll horizontally on narrow screens */}
        {!loading && !error && queue.length > 0 && (
          <div className='mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar'>
            {filterOptions.map((opt) => {
              const active = filter === opt.value
              const count =
                opt.value === 'all' ? queue.length : counts[opt.value] ?? 0
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={
                    'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs transition ' +
                    (active
                      ? 'border-primary/60 bg-primary/15 text-primary'
                      : 'border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground')
                  }
                >
                  {opt.label}
                  <span
                    className={
                      'rounded-full px-1.5 py-0.5 text-[10px] ' +
                      (active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground')
                    }
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-xl border border-border/60 bg-card/60 p-5'
              >
                <div className='mb-3 h-4 w-3/4 rounded bg-muted' />
                <div className='mb-2 h-3 w-1/2 rounded bg-muted' />
                <div className='mt-4 h-16 rounded bg-muted/60' />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
            {error}
          </div>
        )}

        {!loading && !error && queue.length === 0 && (
          <div className='rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center'>
            <p className='text-lg font-medium text-foreground'>
              Nothing in the queue yet
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Submissions from authors will appear here for review and assignment.
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((item) => (
              <article
                key={item.id}
                className='group flex flex-col rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-lg'
              >
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <h2 className='text-base font-semibold leading-snug'>
                    {item.title}
                  </h2>
                  <span
                    className={
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                      statusPillClasses(item.status)
                    }
                  >
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </div>

                <p className='mb-1 text-xs text-muted-foreground'>
                  <span className='font-medium text-foreground/80'>Journal:</span>{' '}
                  {item.journal_title}
                </p>
                <p className='mb-1 text-xs text-muted-foreground'>
                  <span className='font-medium text-foreground/80'>Authors:</span>{' '}
                  {item.authors}
                </p>
                <p className='mb-3 text-xs text-muted-foreground'>
                  Submitted {new Date(item.created_at).toLocaleDateString()}
                </p>

                {item.abstract && (
                  <p className='mb-4 line-clamp-4 text-sm text-muted-foreground'>
                    {item.abstract}
                  </p>
                )}

                <div className='mt-auto flex flex-wrap gap-2'>
                  <a
                    href={`${BASE_URL}${item.file}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40'
                  >
                    <IconFileText size={16} />
                    View file
                  </a>
                  <button
                    onClick={() => navigate(`/editors_manuscript/${item.id}`)}
                    className='inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'
                  >
                    Open
                    <IconChevronRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Layout.Body>
    </Layout>
  )
}

export default EditorsList
