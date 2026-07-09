import { Layout } from '@/components/custom/layout'
import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
import { Input } from '@/components/ui/input'
import { IconSearch, IconFilter, IconRefresh, IconX } from '@tabler/icons-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/articles/ArticleCard'
// import { FilterPanel } from '@/components/filters/FilterPanel';
import { Loader2 } from 'lucide-react'
import NotFoundPage from './components/NotFoundPage'
import { ScrollArea } from '@/components/ui/scroll-area'
interface Article {
  title: string
  authors: string
  citation_count: number
  url: string
  abstract: string
}

interface Country {
  id: number
  country: string
}

interface ThematicArea {
  id: number
  thematic_area: string
}

interface Language {
  id: number
  language: string
}

export default function Journals() {
  const [searchTerm, setSearchTerm] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilterForm, setShowFilterForm] = useState(false)
  const pageSize = 10

  const [countries, setCountries] = useState<Country[]>([])
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([])
  const [languages, setLanguages] = useState<Language[]>([])

  const [selectedCountries, setSelectedCountries] = useState<number[]>([])
  const [selectedThematicAreas, setSelectedThematicAreas] = useState<number[]>(
    []
  )
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([])

  const [viewMoreCountries, setViewMoreCountries] = useState(false)
  const [viewMoreThematicAreas, setViewMoreThematicAreas] = useState(false)
  const [viewMorelanguages, setViewMoreLanguages] = useState(false)
  const [filteredQuery, setFilteredQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // const [results, setResults] = useState(0)
  const fetchArticles = async (page = 1, customUrl?: string) => {
    setIsLoading(true) // Start loading
    try {
      const url =
        customUrl ||
        `https://backend.afrikajournals.org/journal_api/articles/search/?query=${searchTerm}&page=${page}&page_size=${pageSize}`

      console.log('Fetching articles from URL:', url) // Log the URL being requested

      const response = await fetch(url)

      // Check if response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('data', data.count)
      // Ensure data has expected structure
      if (data && data.results) {
        setArticles(
          data.results.map((article: any) => ({
            ...article,
            abstract:
              article.abstract ||
              'Abstract not available. This is a placeholder text that would normally contain 2-3 sentences describing the main points of the research article.',
          }))
        )
        setTotalPages(Math.ceil(data.count / pageSize))
        // setResults(data.count)
      } else {
        // setResults(0)
        throw new Error('Invalid data structure received from API')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false) // Stop loading
    }
  }


  const fetchArticles1 = async (page = 1, customUrl?: string) => {
    setIsLoading(true) // Start loading
    try {
      const url =
        customUrl ||
        `https://backend.afrikajournals.org/journal_api/articles/search/?&page=${page}&page_size=${pageSize}`

      console.log('Fetching articles from URL:', url) // Log the URL being requested

      const response = await fetch(url)

      // Check if response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('data', data.count)
      // Ensure data has expected structure
      if (data && data.results) {
        setArticles(
          data.results.map((article: any) => ({
            ...article,
            abstract:
              article.abstract ||
              'Abstract not available. This is a placeholder text that would normally contain 2-3 sentences describing the main points of the research article.',
          }))
        )
        setTotalPages(Math.ceil(data.count / pageSize))
        // setResults(data.count)
      } else {
        // setResults(0)
        throw new Error('Invalid data structure received from API')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false) // Stop loading
    }
  }

  const fetchFiltersData = async () => {
    try {
      const [countriesRes, thematicRes, languagesRes] = await Promise.all([
        fetch('https://backend.afrikajournals.org/journal_api/api/country/'),
        fetch('https://backend.afrikajournals.org/journal_api/api/thematic/'),
        fetch('https://backend.afrikajournals.org/journal_api/api/languages/'),
      ])

      setCountries(await countriesRes.json())
      setThematicAreas(await thematicRes.json())
      setLanguages(await languagesRes.json())
    } catch (error) {
      console.error('Error fetching filter data:', error)
    }
  }

  useEffect(() => {
    const loadFiltersAndArticles = async () => {
      // Fetch filters data and then fetch articles
      await fetchFiltersData() // Ensure filters are fetched first
    }

    loadFiltersAndArticles()
  }, [searchTerm, currentPage]) // Trigger whenever searchTerm or currentPage changes

  useEffect(() => {
    fetchArticles(1)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    const url = filteredQuery
      ? `https://backend.afrikajournals.org/journal_api/articles/search/?query=${filteredQuery}&page=${page}&page_size=${pageSize}`
      : `https://backend.afrikajournals.org/journal_api/articles/search/?query=${searchTerm}&page=${page}&page_size=${pageSize}`

    fetchArticles(page, url)
  }

  const handleCountryChange = (id: number) => {
    setSelectedCountries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleThematicAreaChange = (id: number) => {
    setSelectedThematicAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleLanguageChange = (id: number) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleApplyFilters = () => {
    const queryParams = []

    if (selectedCountries.length > 0) {
      const countriesQuery = countries
        .filter((country) => selectedCountries.includes(country.id))
        .map((country) => country.country)
        .join(' ')
      queryParams.push(countriesQuery)
    }

    if (selectedThematicAreas.length > 0) {
      const thematicQuery = thematicAreas
        .filter((area) => selectedThematicAreas.includes(area.id))
        .map((area) => area.thematic_area)
        .join(' ')
      queryParams.push(thematicQuery)
    }

    if (selectedLanguages.length > 0) {
      const languagesQuery = languages
        .filter((lang) => selectedLanguages.includes(lang.id))
        .map((lang) => lang.language)
        .join(' ')
      queryParams.push(languagesQuery)
    }

    const dynamicQuery = encodeURIComponent(queryParams.join(' '))
    setFilteredQuery(dynamicQuery)
    setShowFilterForm(false)

    const dynamicUrl = `https://backend.afrikajournals.org/journal_api/articles/search/?query=${dynamicQuery}`
    fetchArticles(1, dynamicUrl) // Pass the dynamic URL for the first page
  }

  const topNav = [{ title: ' ', href: ' ', isActive: true }]

  return (
    <Layout>
<Layout.Body>
        <div className='p-4 md:p-6'>
          <div className='mb-4 flex items-center justify-between '>
            <div className='relative w-full '>
              <Input
                type='search'
                placeholder='Search...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='border-mutedpy-2 block w-full rounded-lg border bg-white pl-10 pr-4 text-sm text-foreground focus:border-primary focus:ring-primary'
              />
              <div className='absolute inset-y-0 right-0 flex items-center space-x-3 pr-3'>
                <IconRefresh
                  className='h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary'
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCountries([])
                    setSelectedThematicAreas([])
                    setSelectedLanguages([])
                    setFilteredQuery('')
                    setShowFilterForm(false)
                    setCurrentPage(1)
                    fetchArticles1(currentPage)
                  }}
                />
                <IconFilter
                  className='h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary'
                  onClick={() => setShowFilterForm((prev) => !prev)}
                />
                <IconSearch
                  className='h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary'
                  onClick={() => fetchArticles(1)}
                />
              </div>
            </div>
          </div>
          {/* <h1 className='mb-4 text-2xl font-bold text-primary'>
            {results} Articles
          </h1> */}

          {showFilterForm && (
            <div className='w-70 max-w-70 box-sizing: border-box fixed left-0 top-0 z-50 h-full overflow-x-auto overflow-y-auto bg-white p-4 shadow-lg'>
              <h3 className='mb-4 text-lg font-bold'>Article Filters</h3>

              <IconX
                className='absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-primary'
                onClick={() => setShowFilterForm(false)} // Close the form on click
              />

              <div className='mb-6 w-full'>
                <h4 className='mb-2 font-semibold'>Countries</h4>
                <div className='w-full'>
                  {countries
                    .slice(0, viewMoreCountries ? countries.length : 5)
                    .map((country) => (
                      <div
                        key={country.id}
                        className='mb-2 flex w-full items-center'
                      >
                        <input
                          type='checkbox'
                          id={`country-${country.id}`}
                          className='mr-2'
                          checked={selectedCountries.includes(country.id)}
                          onChange={() => handleCountryChange(country.id)} // Handles checkbox toggle
                        />
                        <label
                          htmlFor={`country-${country.id}`}
                          className='w-56 break-words'
                        >
                          {country.country}
                        </label>
                      </div>
                    ))}
                </div>
                <button
                  className='mt-2 text-primary'
                  onClick={(e) => {
                    e.preventDefault()
                    setViewMoreCountries((prev) => !prev)
                  }}
                >
                  {viewMoreCountries ? 'View Less' : 'View More'}
                </button>
              </div>

              <div className='mb-6 w-full'>
                <h4 className='mb-2 font-semibold'>Thematic Areas</h4>
                <div className='w-full'>
                  {thematicAreas
                    .slice(0, viewMoreThematicAreas ? thematicAreas.length : 5)
                    .map((area) => (
                      <div
                        key={area.id}
                        className='mb-2 flex w-full items-center'
                      >
                        <input
                          type='checkbox'
                          id={`thematic-${area.id}`}
                          className='mr-2'
                          checked={selectedThematicAreas.includes(area.id)}
                          onChange={() => handleThematicAreaChange(area.id)} // Handles checkbox toggle
                        />
                        <label
                          htmlFor={`thematic-${area.id}`}
                          className='w-56 break-words'
                        >
                          {area.thematic_area}
                        </label>
                      </div>
                    ))}
                </div>
                <button
                  className='mt-2 text-primary'
                  onClick={(e) => {
                    e.preventDefault()
                    setViewMoreThematicAreas((prev) => !prev)
                  }}
                >
                  {viewMoreThematicAreas ? 'View Less' : 'View More'}
                </button>
              </div>

              <div className='mb-6 w-full'>
                <h4 className='mb-2 font-semibold'>Languages</h4>
                <div className='w-full'>
                  {languages
                    .slice(0, viewMorelanguages ? languages.length : 5)
                    .map((language) => (
                      <div
                        key={language.id}
                        className='mb-2 flex w-full items-center'
                      >
                        <input
                          type='checkbox'
                          id={`language-${language.id}`}
                          className='mr-2'
                          checked={selectedLanguages.includes(language.id)}
                          onChange={() => handleLanguageChange(language.id)} // Handles checkbox toggle
                        />
                        <label
                          htmlFor={`language-${language.id}`}
                          className='w-56 break-words'
                        >
                          {language.language}
                        </label>
                      </div>
                    ))}
                </div>
                <button
                  className='mt-2 text-primary'
                  onClick={(e) => {
                    e.preventDefault()
                    setViewMoreLanguages((prev) => !prev)
                  }}
                >
                  {viewMorelanguages ? 'View Less' : 'View More'}
                </button>
              </div>
              {/* bg-[#BFEFFF] */}
              <button
                className='mt-6 w-full rounded-lg bg-[#466785] py-2 text-white'
                onClick={handleApplyFilters} // Call the dynamic URL builder and fetcher
              >
                Apply Filters
              </button>
            </div>
          )}
          <ScrollArea className='flex h-[800px] items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-lg'>
            {isLoading ? (
              <div className='flex h-full w-full items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : (
              <>
                <div className='space-y-6'>
                  {articles.length > 0 ? (
                    articles.map((article, index) => (
                      <ArticleCard key={index} article={article} />
                    ))
                  ) : (
                    <div className=' flex  items-center justify-center'>
                      <NotFoundPage />
                    </div>
                  )}
                </div>
              </>
            )}
          </ScrollArea>
          {articles.length > 0 && (
            <div className='mt-6'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                      aria-disabled={currentPage <= 1}
                    />
                  </PaginationItem>
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href='#'
                          isActive={currentPage === 1}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(1)
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationEllipsis />
                    </>
                  )}
                  {[...Array(totalPages)]
                    .map((_, index) => index + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href='#'
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {currentPage < totalPages - 2 && (
                    <>
                      <PaginationEllipsis />
                      <PaginationItem>
                        <PaginationLink
                          href='#'
                          isActive={currentPage === totalPages}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(totalPages)
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1)
                      }}
                      aria-disabled={currentPage >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </Layout.Body>
    </Layout>
  )
}
