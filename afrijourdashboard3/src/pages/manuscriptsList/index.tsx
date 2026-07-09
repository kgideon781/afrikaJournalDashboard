
import { useEffect, useState } from 'react'
import { BASE_URL } from '@/config'
import { Layout } from '@/components/custom/layout'
import { TopNav } from "@/components/top-nav";
import { UserNav } from "@/components/user-nav";
interface Manuscript {
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

const Index = () => {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens')

        if (!storedTokens) {
          setError('You are not authenticated.')
          setLoading(false)
          return
        }

        const { access } = JSON.parse(storedTokens)

        const response = await fetch(
          `${BASE_URL}/journal_api/api/my-manuscripts/`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${access}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch manuscripts.')
        }

        const data = await response.json()

        setManuscripts(data.results || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load manuscripts.')
      } finally {
        setLoading(false)
      }
    }

    fetchManuscripts()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading manuscripts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const topNav = [
  {
    title: " ",
    href: " ",
    isActive: true,
  },
];

  return (
      <Layout>
<Layout.Body>
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">My Manuscripts</h1>

      {manuscripts.length === 0 ? (
        <p>No manuscripts found.</p>
      ) : (
        <div className="grid gap-6">
          {manuscripts.map((manuscript) => (
            <div
              key={manuscript.id}
              className="rounded-lg border bg-white p-6 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {manuscript.title}
                </h2>

                <span
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {manuscript.status}
                </span>
              </div>

              <p className="mb-3 text-sm text-gray-600">
                <strong>Journal:</strong> {manuscript.journal_title}
              </p>

              <p className="mb-3 text-sm text-gray-600">
                <strong>Authors:</strong> {manuscript.authors}
              </p>

              <p className="mb-3 text-sm text-gray-600">
                <strong>Submitted By:</strong> {manuscript.author}
              </p>

              <p className="mb-3 text-sm text-gray-600">
                <strong>Submitted On:</strong>{' '}
                {new Date(manuscript.created_at).toLocaleString()}
              </p>

              <div className="mb-4">
                <p className="mb-1 font-medium">Abstract</p>

                <p className="line-clamp-4 text-gray-700">
                  {manuscript.abstract}
                </p>
              </div>

              <a
                href={manuscript.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
              >
                Download Manuscript
              </a>
            </div>
          ))}
        </div>
      )}
    </div></Layout.Body>
    </Layout>
  )
}

export default Index