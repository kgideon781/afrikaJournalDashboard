import { useEffect, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import { IconFileText, IconRefresh } from '@tabler/icons-react'
import { statusPillClasses, STATUS_LABEL } from '@/lib/ui-shared'

interface ReviewItem {
  id: number
  journal: number
  journal_title: string
  volume: number | null
  title: string
  abstract: string
  file: string
  authors: string
  corresponding_author: number
  author: string
  status: string
  created_at: string
}

const ReviewersList = () => {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const t = localStorage.getItem('authTokens')
      if (!t) throw new Error('You are not authenticated')
      const { access } = JSON.parse(t)
      const res = await fetch(`${BASE_URL}/journal_api/api/reviewer/queue/`, {
        headers: {
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : data?.results ?? [])
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'Unable to load reviewer queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8'>
        {/* Header */}
        <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              Reviewer queue
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manuscripts assigned to you for peer review.
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

        {/* States */}
        {loading && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-xl border border-border/60 bg-card/60 p-5'
              >
                <div className='mb-3 h-4 w-3/4 rounded bg-muted' />
                <div className='mb-2 h-3 w-1/2 rounded bg-muted' />
                <div className='mb-2 h-3 w-2/3 rounded bg-muted' />
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

        {!loading && !error && items.length === 0 && (
          <div className='rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center'>
            <p className='text-lg font-medium text-foreground'>
              No manuscripts in your queue
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              You will see submissions here once an editor assigns you as a
              reviewer.
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && items.length > 0 && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {items.map((item) => (
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

                <dl className='mb-3 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-x-3'>
                  <dt className='font-medium text-foreground/80'>Journal</dt>
                  <dd className='truncate'>{item.journal_title}</dd>
                  <dt className='font-medium text-foreground/80'>Authors</dt>
                  <dd className='truncate'>{item.authors}</dd>
                  <dt className='font-medium text-foreground/80'>Submitted by</dt>
                  <dd className='truncate'>{item.author}</dd>
                  <dt className='font-medium text-foreground/80'>Date</dt>
                  <dd>{new Date(item.created_at).toLocaleDateString()}</dd>
                </dl>

                {item.abstract && (
                  <p className='mb-4 line-clamp-3 text-sm text-muted-foreground'>
                    {item.abstract}
                  </p>
                )}

                <div className='mt-auto flex flex-wrap gap-2'>
                  <a
                    href={item.file}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40'
                  >
                    <IconFileText size={16} />
                    Open file
                  </a>
                  <a
                    href={`/submit_reviews?manuscript=${item.id}`}
                    className='inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'
                  >
                    Submit review
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </Layout.Body>
    </Layout>
  )
}

export default ReviewersList
