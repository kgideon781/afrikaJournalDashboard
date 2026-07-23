// import React from 'react'
// import { Layout } from '@/components/custom/layout'
// import { TopNav } from '@/components/top-nav'
// import { UserNav } from '@/components/user-nav'
// const index = () => {
//      const topNav = [
//     {
//       title: 'Submit Review',
//       href: '#',
//       isActive: true,
//     },
//   ]
//   return (
//     <Layout>
//           <Layout.Header>
//             <TopNav links={topNav} />
//             <div className="ml-auto flex items-center space-x-4">
//               <UserNav />
//             </div>
//           </Layout.Header>
    
//           {/* IMPORTANT: overflow fix for scrolling */}
//           <Layout.Body className="h-[calc(100vh-80px)] overflow-y-auto p-6">
//     <div>Submit Reviews</div>
//     </Layout.Body>
//     </Layout>
//   )
// }

// export default index



import { useEffect, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
import { BASE_URL } from '@/config'

interface Manuscript {
  id: number
  title: string
  journal_title: string
  authors: string
  abstract: string
  file: string
  status: string
}

const Index = () => {
  const [queue, setQueue] = useState<Manuscript[]>([])
  const [selected, setSelected] = useState<Manuscript | null>(null)

  const [recommendation, setRecommendation] = useState('accept')
  const [comments, setComments] = useState('')
  const [score, setScore] = useState<number>(5)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const topNav = [
    {
      title: 'Reviewer Queue',
      href: '#',
      isActive: true,
    },
  ]

  const getToken = () => {
    const tokens = localStorage.getItem('authTokens')
    return tokens ? JSON.parse(tokens).access : null
  }

  const getUserIdFromToken = () => {
    const token = getToken()
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.user_id || payload?.id
    } catch {
      return null
    }
  }

  useEffect(() => {
    const fetchQueue = async () => {
      const token = getToken()

      const res = await fetch(
        `${BASE_URL}/journal_api/api/reviewer/queue/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json()
      setQueue(data || [])
    }

    fetchQueue()
  }, [])

  const submitReview = async () => {
    if (!selected) return

    setLoading(true)
    setMessage('')

    const token = getToken()
    const userId = getUserIdFromToken()

    try {
      const res = await fetch(
        `${BASE_URL}/journal_api/api/review/${selected.id}/submit/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            manuscript: selected.id,
            reviewer: userId,
            recommendation,
            comments,
            score,
          }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        setMessage('Review submitted successfully')
        setSelected(null)
        setComments('')
        setScore(5)
        setRecommendation('accept')
      } else {
        setMessage(data?.error || 'Submission failed')
      }
    } catch {
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Layout.Header>
        <TopNav links={topNav} />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body className="h-[calc(100vh-80px)] overflow-hidden p-6 bg-gray-50">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

          {/* LEFT PANEL */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">

            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Review Queue</h2>
              <p className="text-xs text-gray-500">
                Click a manuscript to review
              </p>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-3">

              {queue.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No manuscripts assigned
                </p>
              ) : (
                queue.map((m) => (
                  <button
                    type='button'
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`w-full text-left p-3 rounded-lg border cursor-pointer transition
                      ${
                        selected?.id === m.id
                          ? 'bg-blue-50 border-blue-400'
                          : 'hover:bg-gray-50'
                      }`}
                  >
                    <p className="font-medium text-sm">{m.title}</p>
                    <p className="text-xs text-gray-500">
                      {m.journal_title}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {m.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6 overflow-y-auto">

            {!selected ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a manuscript to start reviewing
              </div>
            ) : (
              <div className="space-y-5">

                <div>
                  <h2 className="text-xl font-semibold">
                    {selected.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selected.journal_title}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  {selected.abstract}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm font-medium">
                      Recommendation
                    </label>
                    <select
                      className="w-full border rounded p-2 mt-1"
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                    >
                      <option value="accept">Accept</option>
                      <option value="minor">Minor Revision</option>
                      <option value="major">Major Revision</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Score (0–10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="w-full border rounded p-2 mt-1"
                      value={score}
                      onChange={(e) =>
                        setScore(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Comments</label>
                  <textarea
                    className="w-full border rounded p-3 mt-1 h-40"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={submitReview}
                    disabled={loading}
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>

                  {message && (
                    <p className="text-sm text-gray-600">
                      {message}
                    </p>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      </Layout.Body>
    </Layout>
  )
}

export default Index