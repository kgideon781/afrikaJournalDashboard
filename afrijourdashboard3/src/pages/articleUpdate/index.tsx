// import React, { useState, useEffect } from 'react'
// import { Layout } from '@/components/custom/layout'
// import { BASE_URL } from '../../config'

// interface Journal {
//   id: number
//   journal_title: string
// }

// interface Volume {
//   id: number
//   volume_number: number
// }

// interface AuthTokens {
//   access: string
//   refresh: string
// }

// const index = () => {
//   const [journals, setJournals] = useState<Journal[]>([])
//   const [volumes, setVolumes] = useState<Volume[]>([])
//   const [formData, setFormData] = useState({
//     journal: '',
//     volume: '',
//     title: '',
//     authors: '',
//     publisher: '',
//     publication_date: '',
//     doi: '',
//     license_url: '',
//     electronic_issn: '',
//     print_issn: '',
//     article_type: '',
//     pdf: null as File | null,
//     abstract:'',
//     // reference_count: '',
//     // citation_count: ''
//   })

//   const getAuthTokens = (): AuthTokens | null => {
//     const tokens = localStorage.getItem('authTokens')
//     return tokens ? JSON.parse(tokens) : null
//   }

//   useEffect(() => {
//     const fetchJournalsAndVolumes = async () => {
//       const authTokens = getAuthTokens()
//       const token = authTokens?.access

//       try {
//         const [journalsRes, volumesRes] = await Promise.all([
//           fetch(`${BASE_URL}/journal_api/user/journals/`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           fetch(`${BASE_URL}/journal_api/api/user-volumes/`, {
//             headers: { Authorization: `Bearer ${token}` },
//           })
//         ])

//         if (journalsRes.ok) {
//           const journalsData: Journal[] = await journalsRes.json()
//           setJournals(journalsData)
//         } else {
//           console.error('Failed to fetch journals. Status:', journalsRes.status)
//         }

//         if (volumesRes.ok) {
//           const volumesData: Volume[] = await volumesRes.json()
//           setVolumes(volumesData)
//         } else {
//           console.error('Failed to fetch volumes. Status:', volumesRes.status)
//         }

//       } catch (error) {
//         console.error('Error fetching data:', error)
//       }
//     }

//     fetchJournalsAndVolumes()
//   }, [])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({ ...prev, [name]: value }))
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null
//     setFormData(prev => ({ ...prev, pdf: file }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const authTokens = getAuthTokens()
//     const token = authTokens?.access

//     console.log("Submitting Article Form")
//     console.log("Form Data (raw):", formData)

//     const payload = new FormData()
//     payload.append('journal', formData.journal)
//     payload.append('volume', formData.volume)
//     payload.append('title', formData.title)
//     payload.append('authors', formData.authors)
//     payload.append('publisher', formData.publisher)
//     payload.append('publication_date', formData.publication_date)
//     payload.append('doi', formData.doi)
//     // payload.append('license_url', formData.license_url)
//     // payload.append('electronic_issn', formData.electronic_issn)
//     // payload.append('print_issn', formData.print_issn)
//     // payload.append('article_type', formData.article_type)
//     payload.append('abstract', formData.abstract)
//     // payload.append('reference_count', formData.reference_count)
//     // payload.append('citation_count', formData.citation_count)

//     if (formData.pdf) {
//       payload.append('pdf', formData.pdf)
//     }

//     console.log("Payload for submission:", Object.fromEntries(payload.entries()))

//     try {
//       const response = await fetch(`${BASE_URL}/journal_api/api/article/`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: payload,
//       })

//       console.log("Response status:", response.status)

//       if (response.ok) {
//         const data = await response.json()
//         console.log("Article created successfully:", data)
//         alert('Article created successfully!')
//         setFormData({
//           journal: '',
//           volume: '',
//           title: '',
//           authors: '',
//           publisher: '',
//           publication_date: '',
//           doi: '',
//           license_url: '',
//           electronic_issn: '',
//           print_issn: '',
//           article_type: '',
//           pdf: null,
//           abstract:'',
//           // reference_count: '',
//           // citation_count: ''
//         })
//       } else {
//         const errorData = await response.text()
//         console.error('Failed to create article. Status:', response.status, 'Body:', errorData)
//       }
//     } catch (error) {
//       console.error('Error posting article:', error)
//     }
//   }

//   return (
//     <Layout>
//       <Layout.Body>
//         <h1 className="text-xl font-semibold mb-4">Post New Article</h1>

//         <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
//           <select name="journal" value={formData.journal} onChange={handleChange} required className="w-full border rounded p-2">
//             <option value="">Select Journal</option>
//             {journals.map(j => (
//               <option key={j.id} value={j.id}>{j.journal_title}</option>
//             ))}
//           </select>

//           <select name="volume" value={formData.volume} onChange={handleChange} required className="w-full border rounded p-2">
//             <option value="">Select Volume</option>
//             {volumes.map(v => (
//               <option key={v.id} value={v.id}>Volume {v.volume_number}</option>
//             ))}
//           </select>

//           <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="w-full border rounded p-2" />

//           <input type="text" name="authors" value={formData.authors} onChange={handleChange} placeholder="Authors" required className="w-full border rounded p-2" />

//           <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher" required className="w-full border rounded p-2" />

//           <input type="date" name="publication_date" value={formData.publication_date} onChange={handleChange} required className="w-full border rounded p-2" />

//           <input type="text" name="doi" value={formData.doi} onChange={handleChange} placeholder="DOI" className="w-full border rounded p-2" />

//           <input type="text" name="license_url" value={formData.license_url} onChange={handleChange} placeholder="License URL" className="w-full border rounded p-2" />

//           <input type="text" name="electronic_issn" value={formData.electronic_issn} onChange={handleChange} placeholder="Electronic ISSN" className="w-full border rounded p-2" />

//           <input type="text" name="print_issn" value={formData.print_issn} onChange={handleChange} placeholder="Print ISSN" className="w-full border rounded p-2" />

//           <input type="text" name="article_type" value={formData.article_type} onChange={handleChange} placeholder="Article Type" className="w-full border rounded p-2" />
//           <input type="text" name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Abstract" className="w-full border rounded p-2" />
//           {/* <input type="number" name="reference_count" value={formData.reference_count} onChange={handleChange} placeholder="Reference Count" required className="w-full border rounded p-2" />

//           <input type="number" name="citation_count" value={formData.citation_count} onChange={handleChange} placeholder="Citation Count" required className="w-full border rounded p-2" /> */}

//           <input type="file" name="pdf" onChange={handleFileChange} className="w-full border rounded p-2" />

//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Article</button>
//         </form>
//       </Layout.Body>
//     </Layout>
//   )
// }

// export default index

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '../../config'

interface Journal {
  id: number
  journal_title: string
}

interface Volume {
  id: number
  volume_number: number
}

interface AuthTokens {
  access: string
  refresh: string
}

const index = () => {
  const [journals, setJournals] = useState<Journal[]>([])
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [formData, setFormData] = useState({
    journal: '',
    volume: '',
    title: '',
    authors: '',
    publisher: '',
    publication_date: '',
    doi: '',
    license_url: '',
    electronic_issn: '',
    print_issn: '',
    article_type: '',
    pdf: null as File | null,
    abstract: '',
  })

  const getAuthTokens = (): AuthTokens | null => {
    const tokens = localStorage.getItem('authTokens')
    return tokens ? JSON.parse(tokens) : null
  }

  useEffect(() => {
    const fetchJournalsAndVolumes = async () => {
      const authTokens = getAuthTokens()
      const token = authTokens?.access

      try {
        const [journalsRes, volumesRes] = await Promise.all([
          fetch(`${BASE_URL}/journal_api/user/journals/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/journal_api/api/user-volumes/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (journalsRes.ok) setJournals(await journalsRes.json())
        else console.error('Failed to fetch journals.', journalsRes.status)

        if (volumesRes.ok) setVolumes(await volumesRes.json())
        else console.error('Failed to fetch volumes.', volumesRes.status)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchJournalsAndVolumes()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, pdf: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const authTokens = getAuthTokens()
    const token = authTokens?.access

    // const payload = new FormData()
    // Object.entries(formData).forEach(([key, value]) => {
    //   if (key === 'pdf' && value) payload.append(key, value)
    //   else if (key !== 'pdf') payload.append(key, value)
    // })
    const payload = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        payload.append(key, value)
      }
    })

    try {
      const response = await fetch(`${BASE_URL}/journal_api/api/article/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      })

      if (response.ok) {
        alert('Article created successfully!')
        setFormData({
          journal: '',
          volume: '',
          title: '',
          authors: '',
          publisher: '',
          publication_date: '',
          doi: '',
          license_url: '',
          electronic_issn: '',
          print_issn: '',
          article_type: '',
          pdf: null,
          abstract: '',
        })
      } else {
        console.error('Failed to create article.', response.status)
      }
    } catch (error) {
      console.error('Error posting article:', error)
    }
  }

  return (
    <Layout>
      <Layout.Body>
        <div className='mx-auto max-w-6xl rounded-xl bg-white p-8 shadow-md'>
          <h1 className='mb-6 text-center text-2xl font-bold text-blue-700'>
            Add Articles To Your Journal Volumes
          </h1>
          {/* <h1 className='mb-4 text-3xl font-bold'>Post New Article</h1> */}
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          >
            <div>
              <label htmlFor="journal" className='mb-1 block font-medium'>Journal</label>
              <select id="journal"
                name='journal'
                value={formData.journal}
                onChange={handleChange}
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select Journal</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.journal_title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="volume" className='mb-1 block font-medium'>Volume</label>
              <select id="volume"
                name='volume'
                value={formData.volume}
                onChange={handleChange}
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select Volume</option>
                {volumes.map((v) => (
                  <option key={v.id} value={v.id}>
                    Volume {v.volume_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publication_date" className='mb-1 block font-medium'>Publication Date</label>
              <input id="publication_date"
                type='date'
                name='publication_date'
                value={formData.publication_date}
                onChange={handleChange}
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="title" className='mb-1 block font-medium'>Title</label>
              <input id="title"
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                placeholder='Title'
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="authors" className='mb-1 block font-medium'>Authors</label>
              <input id="authors"
                type='text'
                name='authors'
                value={formData.authors}
                onChange={handleChange}
                placeholder='Authors'
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="publisher" className='mb-1 block font-medium'>Publisher</label>
              <input id="publisher"
                type='text'
                name='publisher'
                value={formData.publisher}
                onChange={handleChange}
                placeholder='Publisher'
                required
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="doi" className='mb-1 block font-medium'>DOI</label>
              <input id="doi"
                type='text'
                name='doi'
                value={formData.doi}
                onChange={handleChange}
                placeholder='DOI'
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="license_url" className='mb-1 block font-medium'>License URL</label>
              <input id="license_url"
                type='text'
                name='license_url'
                value={formData.license_url}
                onChange={handleChange}
                placeholder='License URL'
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="electronic_issn" className='mb-1 block font-medium'>Electronic ISSN</label>
              <input id="electronic_issn"
                type='text'
                name='electronic_issn'
                value={formData.electronic_issn}
                onChange={handleChange}
                placeholder='Electronic ISSN'
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="print_issn" className='mb-1 block font-medium'>Print ISSN</label>
              <input id="print_issn"
                type='text'
                name='print_issn'
                value={formData.print_issn}
                onChange={handleChange}
                placeholder='Print ISSN'
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="article_type" className='mb-1 block font-medium'>Article Type</label>
              <input id="article_type"
                type='text'
                name='article_type'
                value={formData.article_type}
                onChange={handleChange}
                placeholder='Article Type'
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='lg:col-span-3'>
              <label htmlFor="abstract" className='mb-1 block font-medium'>Abstract</label>
              <textarea id="abstract"
                name='abstract'
                value={formData.abstract}
                onChange={handleChange}
                placeholder='Abstract'
                rows={4}
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              ></textarea>
            </div>

            <div className='lg:col-span-3'>
              <label htmlFor="pdf" className='mb-1 block font-medium'>Upload PDF</label>
              <input id="pdf"
                type='file'
                name='pdf'
                onChange={handleFileChange}
                className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='lg:col-span-3'>
              <button
                type='submit'
                className='mt-4 rounded bg-green-500 p-2 text-white'
              >
                Submit Article
              </button>
            </div>
          </form>
        </div>
      </Layout.Body>
    </Layout>
  )
}

export default index
