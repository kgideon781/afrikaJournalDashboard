import { useEffect, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'

interface PendingJournal {
  id: number
  journal_title: string
  publishers_name?: string | null
  issn_number?: string | null
  summary?: string | null
  link?: string | null
  user?: number | null
}

export default function PendingJournals() {
  const [journals, setJournals] = useState<PendingJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      // Endpoint uses UnapprovedJournalPagination — could be {results:[...]}.
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
      // Remove it from the list without a full reload.
      setJournals((prev) => prev.filter((j) => j.id !== id))
    } catch (e: any) {
      setError(e?.message ?? 'Approval failed.')
    } finally {
      setApprovingId(null)
    }
  }


  return (
    <Layout>
<Layout.Body>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pending Journals</h1>
            <button
              onClick={load}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {message && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : journals.length === 0 ? (
            <p className="text-gray-500">
              No pending journals. Anything a user creates will land here for
              your approval.
            </p>
          ) : (
            <div className="grid gap-4">
              {journals.map((j) => (
                <div
                  key={j.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {j.journal_title}{' '}
                        <span className="text-sm text-gray-400">
                          #{j.id}
                        </span>
                      </h2>
                      {j.publishers_name && (
                        <p className="text-sm text-gray-600">
                          Publisher: {j.publishers_name}
                        </p>
                      )}
                      {j.issn_number && (
                        <p className="text-sm text-gray-600">
                          ISSN: {j.issn_number}
                        </p>
                      )}
                      {j.link && (
                        <p className="text-sm">
                          <a
                            href={j.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {j.link}
                          </a>
                        </p>
                      )}
                      {j.user != null && (
                        <p className="text-xs text-gray-400">
                          Submitted by user #{j.user}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => approve(j.id)}
                      disabled={approvingId === j.id}
                      className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {approvingId === j.id ? 'Approving…' : 'Approve'}
                    </button>
                  </div>
                  {j.summary && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-gray-700">
                      {j.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout.Body>
    </Layout>
  )
}
