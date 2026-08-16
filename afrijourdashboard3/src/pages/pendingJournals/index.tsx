import { useEffect, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconRefresh,
} from '@tabler/icons-react'

interface RefName {
  id: number
  language?: string
  platform?: string
  country?: string
  thematic_area?: string
}

interface PendingJournal {
  id: number
  journal_title: string
  publishers_name?: string | null
  issn_number?: string | null
  summary?: string | null
  link?: string | null
  user?: number | null
  created_at?: string | null

  language?: RefName | null
  platform?: RefName | null
  country?: RefName | null
  thematic_area?: RefName | null

  aim_identifier?: boolean | null
  medline?: boolean | null
  google_scholar_index?: boolean | null
  impact_factor?: number | null
  sjr?: boolean | null
  h_index?: number | null
  eigen_factor?: boolean | null
  eigen_metrix?: string | null
  snip?: boolean | null
  snip_metrix?: number | null
  open_access_journal?: boolean | null
  listed_in_doaj?: boolean | null
  present_issn?: boolean | null
  publisher_in_cope?: boolean | null
  online_publisher_africa?: boolean | null
  hosted_on_inasps?: boolean | null
}

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return 'Unknown submission date'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Unknown submission date'
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return 'Unknown submission date'
  }
}

const refName = (r: RefName | null | undefined, key: keyof RefName): string =>
  (r && (r[key] as string)) || '—'

const boolLabel = (v: boolean | null | undefined): string =>
  v == null ? '—' : v ? 'Yes' : 'No'

const numLabel = (v: number | null | undefined): string =>
  v == null ? '—' : String(v)

const textLabel = (v: string | null | undefined): string => v || '—'

interface FieldRow {
  label: string
  value: string
}

const buildDetailRows = (j: PendingJournal): FieldRow[] => [
  { label: 'Publisher', value: textLabel(j.publishers_name) },
  { label: 'ISSN number', value: textLabel(j.issn_number) },
  { label: 'Country', value: refName(j.country, 'country') },
  { label: 'Language', value: refName(j.language, 'language') },
  { label: 'Platform', value: refName(j.platform, 'platform') },
  { label: 'Thematic area', value: refName(j.thematic_area, 'thematic_area') },
  { label: 'AIM identifier', value: boolLabel(j.aim_identifier) },
  { label: 'Medline', value: boolLabel(j.medline) },
  { label: 'Google Scholar indexed', value: boolLabel(j.google_scholar_index) },
  { label: 'Open access', value: boolLabel(j.open_access_journal) },
  { label: 'Listed in DOAJ', value: boolLabel(j.listed_in_doaj) },
  { label: 'ISSN present', value: boolLabel(j.present_issn) },
  { label: 'Publisher in COPE', value: boolLabel(j.publisher_in_cope) },
  {
    label: 'Online publisher in Africa',
    value: boolLabel(j.online_publisher_africa),
  },
  { label: 'Hosted on INASP', value: boolLabel(j.hosted_on_inasps) },
  { label: 'Impact factor', value: numLabel(j.impact_factor) },
  { label: 'h-index', value: numLabel(j.h_index) },
  { label: 'SJR', value: boolLabel(j.sjr) },
  { label: 'SNIP', value: boolLabel(j.snip) },
  { label: 'SNIP metric', value: numLabel(j.snip_metrix) },
  { label: 'Eigenfactor', value: boolLabel(j.eigen_factor) },
  { label: 'Eigen metric', value: textLabel(j.eigen_metrix) },
]

export default function PendingJournals() {
  const [journals, setJournals] = useState<PendingJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const getToken = () => {
    const t = localStorage.getItem('authTokens')
    return t ? JSON.parse(t).access : null
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(
        `${BASE_URL}/journal_api/api/journals/unapproved/`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setJournals(data.results ?? data ?? [])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load pending journals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id: number) => {
    setApprovingId(id)
    setMessage(null)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(
        `${BASE_URL}/journal_api/api/journals/${id}/approve/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body.error || body.detail || `HTTP ${res.status}`)
      }
      setMessage(body.message ?? `Approved journal ${id}.`)
      setJournals((prev) => prev.filter((j) => j.id !== id))
    } catch (e: any) {
      setError(e?.message ?? 'Approval failed.')
    } finally {
      setApprovingId(null)
    }
  }

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8'>
        <div className='mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              Pending Journals
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Journals submitted by authors awaiting your approval.
            </p>
          </div>
          <button
            onClick={load}
            className='inline-flex items-center gap-1.5 self-start rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40 md:self-auto'
          >
            <IconRefresh className='h-4 w-4' />
            Refresh
          </button>
        </div>

        {message && (
          <div className='mb-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700'>
            <IconCheck className='mt-0.5 h-4 w-4 shrink-0' />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className='mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        {loading ? (
          <p className='text-muted-foreground'>Loading…</p>
        ) : journals.length === 0 ? (
          <p className='text-muted-foreground'>
            No pending journals. Anything a user submits will land here for
            your approval.
          </p>
        ) : (
          <div className='grid gap-4'>
            {journals.map((j) => {
              const isOpen = !!expanded[j.id]
              const detailRows = buildDetailRows(j)
              return (
                <div
                  key={j.id}
                  className='rounded-xl border border-border/60 bg-card p-5 shadow-sm'
                >
                  <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h2 className='text-lg font-semibold text-foreground'>
                          {j.journal_title}
                        </h2>
                        <span className='text-xs text-muted-foreground'>
                          #{j.id}
                        </span>
                      </div>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Submitted: {formatDate(j.created_at)}
                        {j.user != null ? ` · by user #${j.user}` : ''}
                      </p>

                      {j.publishers_name && (
                        <p className='mt-2 text-sm text-foreground'>
                          <span className='text-muted-foreground'>
                            Publisher:{' '}
                          </span>
                          {j.publishers_name}
                        </p>
                      )}
                      {j.issn_number && (
                        <p className='text-sm text-foreground'>
                          <span className='text-muted-foreground'>ISSN: </span>
                          {j.issn_number}
                        </p>
                      )}
                      {j.link && (
                        <p className='mt-1 text-sm'>
                          <a
                            href={j.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:underline'
                          >
                            {j.link}
                          </a>
                        </p>
                      )}
                      {j.summary && (
                        <p
                          className={
                            'mt-2 whitespace-pre-line text-sm text-foreground/90 ' +
                            (isOpen ? '' : 'line-clamp-3')
                          }
                        >
                          {j.summary}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => approve(j.id)}
                      disabled={approvingId === j.id}
                      className='inline-flex items-center justify-center gap-1.5 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60'
                    >
                      <IconCheck className='h-4 w-4' />
                      {approvingId === j.id ? 'Approving…' : 'Approve'}
                    </button>
                  </div>

                  <button
                    type='button'
                    onClick={() => toggleExpanded(j.id)}
                    className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
                  >
                    {isOpen ? (
                      <IconChevronDown className='h-4 w-4' />
                    ) : (
                      <IconChevronRight className='h-4 w-4' />
                    )}
                    {isOpen ? 'Hide details' : 'Read more'}
                  </button>

                  {isOpen && (
                    <div className='mt-3 rounded-lg border border-border/60 bg-background/40 p-4'>
                      <dl className='grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2'>
                        {detailRows.map((row) => (
                          <div key={row.label} className='flex gap-2'>
                            <dt className='min-w-[10rem] text-muted-foreground'>
                              {row.label}
                            </dt>
                            <dd className='flex-1 break-words text-foreground'>
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Layout.Body>
    </Layout>
  )
}
