import { Layout } from '@/components/custom/layout'

import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../../AuthContext'
import { BASE_URL } from '../../config'
import { useNavigate } from 'react-router-dom'


interface Platform {
  id: string 
  platform: string
}
interface Country {
  id: string 
  country: string
}
interface Language {
  id: string 
  language: string
}
interface ThematicArea {
  id: string 
  thematic_area: string
}

const journalUpdate = () => {
 const navigate = useNavigate()
 const authContext = useContext(AuthContext)
  if (!authContext) {
    return <div> Loading...</div>
  }
  
  const { user } = authContext
  console.log("user-",user)
  

  const [formData, setFormData] = useState({
    journal_title: '',
    platform: '',
    country: '',
    publishers_name: '',
    language: '',
    thematic_area: '',
    issn_number: '',
    link: '',
    aim_identifier: false,
    medline: false,
    summary: '',
    user: user.user_id,
  })
  const initialFormData = {
    journal_title: '',
    platform: '',
    country: '',
    publishers_name: '',
    language: '',
    thematic_area: '',
    issn_number: '',
    link: '',
    aim_identifier: false,
    medline: false,
    summary: '',
    user: '',
    // Add other fields here...
  }
  const [platforms, setPlatforms] = useState<Platform[]>([])

  const [countries, setCountries] = useState<Country[]>([])

  const [languages, setLanguages] = useState<Language[]>([])

  const [thematic, setThematic] = useState<ThematicArea[]>([])
  useEffect(() => {
    fetch(`${BASE_URL}/journal_api/api/languages/`)
      .then((response) => response.json())
      .then((data) => setLanguages(data))
      .catch((error) => console.error('Error fetching languages:', error))
  }, [])

  useEffect(() => {
    fetch(`${BASE_URL}/journal_api/api/country/`)
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) => console.error('Error fetching languages:', error))
  }, [])

  useEffect(() => {
    fetch(`${BASE_URL}/journal_api/api/platform/`)
      .then((response) => response.json())
      .then((data) => setPlatforms(data))
      .catch((error) => console.error('Error fetching languages:', error))
  }, [])

  useEffect(() => {
    fetch(`${BASE_URL}/journal_api/api/thematic/`)
      .then((response) => response.json())
      .then((data) => setThematic(data))
      .catch((error) => console.error('Error fetching languages:', error))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target

    // Check if the input is a checkbox
    const newValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData({
      ...formData,
      [name]: newValue,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `${BASE_URL}/journal_api/api/journalcreate/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        const result = await response.json()
        console.log('Success:', result)
        alert('Journal Added Successfully')
        setFormData(initialFormData)
        // ✅ Navigate to desired URL after success
        navigate('/journal_list')
      } else {
        console.error('Error:', response.statusText)
        alert('OOps! An Error occured try again later')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Layout>
      <Layout.Body>
        <div>
          <h2 className='mb-4 text-xl font-semibold'>Add a New Journal</h2>

          <form
            onSubmit={handleSubmit}
            className='mx-auto mt-8 rounded-lg bg-white p-10 shadow-xl'
            style={{
              // maxWidth: "3600px",
              padding: '40px',
              marginRight: '20px',
              width: '100%',
              height: 'auto',
            }}
          >
            <div className='grid grid-cols-1 gap-12 lg:grid-cols-3'>
              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="journal_title" className='block font-medium text-gray-700'>Journal Title</label>
                <input id="journal_title"
                  type='text'
                  name='journal_title'
                  value={formData.journal_title}
                  onChange={handleChange}
                  required
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                />
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="platform" className='block font-medium text-gray-700'>Platform</label>
                <select id="platform"
                  name='platform'
                  value={formData.platform}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                >
                  <option value=''>Select a Platform</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.platform}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="country" className='block font-medium text-gray-700'>Countries</label>
                <select id="country"
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                >
                  <option value=''>Select a Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="publishers_name" className='block font-medium text-gray-700'>Publisher's Name</label>
                <input id="publishers_name"
                  type='text'
                  name='publishers_name'
                  value={formData.publishers_name}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                />
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="language" className='block font-medium text-gray-700'>Language</label>
                <select id="language"
                  name='language'
                  value={formData.language}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                >
                  <option value=''>Select a Language</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.language}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="thematic_area" className='block font-medium text-gray-700'>Thematic Area</label>
                <select id="thematic_area"
                  name='thematic_area'
                  value={formData.thematic_area}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                >
                  <option value=''>Select a thematic area</option>
                  {thematic.map((themat) => (
                    <option key={themat.id} value={themat.id}>
                      {themat.thematic_area}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <label htmlFor="issn_number" className='block font-medium text-gray-700'>ISSN Number</label>
                <input id="issn_number"
                  type='text'
                  name='issn_number'
                  value={formData.issn_number}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                />
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-2'>
                <label htmlFor="link" className='block font-medium text-gray-700'>Link</label>
                <textarea id="link"
                  name='link'
                  value={formData.link}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                />
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <div className='flex items-center'>
                  <label htmlFor="aim_identifier" className='block font-medium text-gray-700'>African Index Medicus Identifier</label>
                  <input id="aim_identifier"
                    type='checkbox'
                    name='aim_identifier'
                    checked={formData.aim_identifier}
                    onChange={handleChange}
                    className='ml-2 leading-tight'
                  />
                </div>
              </div>

              <div className='col-span-3 space-y-4 lg:col-span-1'>
                <div className='flex items-center'>
                  <label htmlFor="medline" className='block font-medium text-gray-700'>Medicine and Health Journal</label>
                  <input id="medline"
                    type='checkbox'
                    name='medline'
                    checked={formData.medline}
                    onChange={handleChange}
                    className='ml-2 leading-tight'
                  />
                </div>
              </div>

              <div className='col-span-3 space-y-4'>
                <label htmlFor="summary" className='block font-medium text-gray-700'>Abtract</label>
                <textarea id="summary"
                  name='summary'
                  value={formData.summary}
                  onChange={handleChange}
                  className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300'
                />
              </div>
            </div>

            <button
              type='submit'
              className='rounded-md bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
              style={{ width: 'auto', margin: '20px auto', display: 'block' }}
            >
              Add Journal
            </button>
          </form>
        </div>
      </Layout.Body>
    </Layout>
  )
}

export default journalUpdate
