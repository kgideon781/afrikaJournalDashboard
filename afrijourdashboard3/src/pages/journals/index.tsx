import { useState, useEffect } from 'react'
import { Layout } from '@/components/custom/layout'
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
import { Loader2 } from 'lucide-react'
// ArticleCard swapped for local JournalCard (see bottom of file)
import NotFoundPage from './components/NotFoundPage'

interface Article {
  title: string
  authors: string
  citation_count: number
  url: string
  abstract: string
  doi?: string | null
  pdf?: string | null
}

interface Country { id: number; country: string }
interface ThematicArea { id: number; thematic_area: string }
interface Language { id: number; language: string }

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
  const [selectedThematicAreas, setSelectedThematicAreas] = useState<number[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([])

  const [viewMoreCountries, setViewMoreCountries] = useState(false)
  const [viewMoreThematicAreas, setViewMoreThematicAreas] = useState(false)
  const [viewMorelanguages, setViewMoreLanguages] = useState(false)
  const [filteredQuery, setFilteredQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ---- data-fetching helpers ------------------------------------------------
  const fetchArticles = async (page = 1, customUrl?: string) => {
    setIsLoading(true)
    try {
      const url =
        customUrl ||
        `https://backend.afrikajournals.org/journal_api/journals/search/?query=${searchTerm}&page=${page}&page_size=${pageSize}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data && data.results) {
        setArticles(
          data.results.map((journal: any) => ({
            ...journal,
            summary:
              journal.summary ||
              'No description available for this journal.',
          }))
        )
        setTotalPages(Math.ceil(data.count / pageSize))
      } else {
        throw new Error('Invalid data from API')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchArticles1 = async (page = 1, customUrl?: string) => {
    setIsLoading(true)
    try {
      const url =
        customUrl ||
        `https://backend.afrikajournals.org/journal_api/journals/search/?&page=${page}&page_size=${pageSize}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data && data.results) {
        setArticles(
          data.results.map((journal: any) => ({
            ...journal,
            summary:
              journal.summary ||
              'No description available for this journal.',
          }))
        )
        setTotalPages(Math.ceil(data.count / pageSize))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiltersData = async () => {
    try {
      const [c, t, l] = await Promise.all([
        fetch('https://backend.afrikajournals.org/journal_api/api/country/'),
        fetch('https://backend.afrikajournals.org/journal_api/api/thematic/'),
        fetch('https://backend.afrikajournals.org/journal_api/api/languages/'),
      ])
      setCountries(await c.json())
      setThematicAreas(await t.json())
      setLanguages(await l.json())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFiltersData()
  }, [searchTerm, currentPage])

  useEffect(() => {
    fetchArticles(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- handlers -------------------------------------------------------------
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const url = filteredQuery
      ? `https://backend.afrikajournals.org/journal_api/journals/search/?query=${filteredQuery}&page=${page}&page_size=${pageSize}`
      : `https://backend.afrikajournals.org/journal_api/journals/search/?query=${searchTerm}&page=${page}&page_size=${pageSize}`
    fetchArticles(page, url)
  }
  const toggleId = (setter: React.Dispatch<React.SetStateAction<number[]>>) => (id: number) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const handleCountryChange = toggleId(setSelectedCountries)
  const handleThematicAreaChange = toggleId(setSelectedThematicAreas)
  const handleLanguageChange = toggleId(setSelectedLanguages)

  const handleApplyFilters = () => {
    const queryParams: string[] = []
    if (selectedCountries.length > 0) {
      queryParams.push(
        countries
          .filter((c) => selectedCountries.includes(c.id))
          .map((c) => c.country)
          .join(' ')
      )
    }
    if (selectedThematicAreas.length > 0) {
      queryParams.push(
        thematicAreas
          .filter((a) => selectedThematicAreas.includes(a.id))
          .map((a) => a.thematic_area)
          .join(' ')
      )
    }
    if (selectedLanguages.length > 0) {
      queryParams.push(
        languages
          .filter((l) => selectedLanguages.includes(l.id))
          .map((l) => l.language)
          .join(' ')
      )
    }
    const dynamicQuery = encodeURIComponent(queryParams.join(' '))
    setFilteredQuery(dynamicQuery)
    setShowFilterForm(false)
    fetchArticles(
      1,
      `https://backend.afrikajournals.org/journal_api/journals/search/?query=${dynamicQuery}`
    )
  }

  const resetAll = () => {
    setSearchTerm('')
    setSelectedCountries([])
    setSelectedThematicAreas([])
    setSelectedLanguages([])
    setFilteredQuery('')
    setShowFilterForm(false)
    setCurrentPage(1)
    fetchArticles1(1)
  }

  const activeFilterCount =
    selectedCountries.length + selectedThematicAreas.length + selectedLanguages.length

  // ---- pagination helper ----------------------------------------------------
  const buildPageList = (current: number, total: number): (number | 'ellipsis')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = [1]
    if (current > 3) pages.push('ellipsis')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('ellipsis')
    pages.push(total)
    return pages
  }

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            Journals & articles
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Search the AJV article corpus. Filter by country, thematic area or language.
          </p>
        </div>

        {/* Search bar */}
        <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <IconSearch className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='search'
              placeholder='Search articles…'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchArticles(1)
              }}
              className='w-full rounded-md border border-border/60 bg-background/60 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            />
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => fetchArticles(1)}
              className='inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'
            >
              <IconSearch size={16} />
              Search
            </button>
            <button
              onClick={() => setShowFilterForm(true)}
              className={
                'relative inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition ' +
                (activeFilterCount > 0
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-muted/40')
              }
            >
              <IconFilter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className='ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground'>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={resetAll}
              className='inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-3 py-2 text-sm hover:border-primary/40 hover:bg-muted/40'
              title='Reset'
            >
              <IconRefresh size={16} />
              <span className='hidden sm:inline'>Reset</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className='flex items-center justify-center py-16 text-muted-foreground'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            Loading articles…
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <NotFoundPage />
        )}

        {!isLoading && articles.length > 0 && (
          <>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {articles.map((j, i) => (
                <JournalCard key={i} journal={j} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-8 flex justify-center'>
                <Pagination>
                  <PaginationContent className='flex-wrap justify-center'>
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
                    {buildPageList(currentPage, totalPages).map((p, idx) =>
                      p === 'ellipsis' ? (
                        <PaginationItem key={`e-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href='#'
                            isActive={p === currentPage}
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(p)
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        aria-disabled={currentPage >= totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* ================= FILTER DRAWER ================= */}
        {showFilterForm && (
          <>
            {/* Overlay */}
            <button
              type='button'
              aria-label='Close filters'
              onClick={() => setShowFilterForm(false)}
              className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
            />
            {/* Panel */}
            <aside className='fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/60 bg-card shadow-2xl'>
              <header className='flex items-center justify-between border-b border-border/60 px-5 py-4'>
                <h2 className='text-lg font-semibold'>Filters</h2>
                <button
                  onClick={() => setShowFilterForm(false)}
                  className='rounded-md p-1 hover:bg-muted/60'
                  aria-label='Close filters'
                >
                  <IconX size={20} />
                </button>
              </header>

              <div className='flex-1 space-y-6 overflow-y-auto px-5 py-4'>
                {/* Countries */}
                <FilterSection
                  title='Countries'
                  items={countries.map((c) => ({
                    id: c.id,
                    label: c.country,
                    checked: selectedCountries.includes(c.id),
                  }))}
                  expanded={viewMoreCountries}
                  setExpanded={setViewMoreCountries}
                  onToggle={handleCountryChange}
                />

                {/* Thematic areas */}
                <FilterSection
                  title='Thematic areas'
                  items={thematicAreas.map((a) => ({
                    id: a.id,
                    label: a.thematic_area,
                    checked: selectedThematicAreas.includes(a.id),
                  }))}
                  expanded={viewMoreThematicAreas}
                  setExpanded={setViewMoreThematicAreas}
                  onToggle={handleThematicAreaChange}
                />

                {/* Languages */}
                <FilterSection
                  title='Languages'
                  items={languages.map((l) => ({
                    id: l.id,
                    label: l.language,
                    checked: selectedLanguages.includes(l.id),
                  }))}
                  expanded={viewMorelanguages}
                  setExpanded={setViewMoreLanguages}
                  onToggle={handleLanguageChange}
                />
              </div>

              <footer className='flex items-center gap-2 border-t border-border/60 px-5 py-4'>
                <button
                  onClick={() => {
                    setSelectedCountries([])
                    setSelectedThematicAreas([])
                    setSelectedLanguages([])
                  }}
                  className='flex-1 rounded-md border border-border/60 bg-card px-3 py-2 text-sm hover:border-primary/40 hover:bg-muted/40'
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className='flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'
                >
                  Apply filters
                </button>
              </footer>
            </aside>
          </>
        )}
      </Layout.Body>
    </Layout>
  )
}

// ---------------------------------------------------------------------------
// Small subcomponent for repeating filter sections (countries / thematic /
// languages). Keeps the JSX manageable in the main return.
// ---------------------------------------------------------------------------
function FilterSection({
  title,
  items,
  expanded,
  setExpanded,
  onToggle,
}: {
  title: string
  items: { id: number; label: string; checked: boolean }[]
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  onToggle: (id: number) => void
}) {
  const visible = expanded ? items : items.slice(0, 5)
  return (
    <section>
      <h3 className='mb-2 text-sm font-semibold text-foreground'>{title}</h3>
      <div className='space-y-1.5'>
        {visible.map((it) => (
          <label
            key={it.id}
            className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/40'
          >
            <input
              type='checkbox'
              checked={it.checked}
              onChange={() => onToggle(it.id)}
              className='h-4 w-4 rounded border-border/70 bg-background text-primary focus:ring-primary'
            />
            <span className='flex-1 break-words text-foreground/90'>{it.label}</span>
          </label>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className='mt-1.5 text-xs font-medium text-primary hover:text-primary/80'
        >
          {expanded ? 'View less' : `View all ${items.length}`}
        </button>
      )}
    </section>
  )
}


// Inline journal-discovery card — mirrors ArticleCard styling but renders
// journal-appropriate fields (publisher, country, thematic area, summary,
// external link) instead of article-specific ones (authors, citations, DOI).
function JournalCard({ journal }: { journal: any }) {
  const externalUrl = journal?.link
    ? String(journal.link).split(',')[0].trim()
    : null
  return (
    <article className="mb-4 rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-lg">
      <h2 className="mb-3 text-base font-semibold leading-snug md:text-lg">
        {journal.journal_title}
      </h2>
      {journal.publishers_name && (
        <div className="mb-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Publisher:</span>{' '}
          {journal.publishers_name}
        </div>
      )}
      <div className="mb-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {journal.country?.country && (
          <span className="rounded bg-muted px-2 py-0.5">{journal.country.country}</span>
        )}
        {journal.thematic_area?.thematic_area && (
          <span className="rounded bg-muted px-2 py-0.5">{journal.thematic_area.thematic_area}</span>
        )}
        {journal.language?.language && (
          <span className="rounded bg-muted px-2 py-0.5">{journal.language.language}</span>
        )}
        {journal.issn_number && (
          <span className="rounded bg-muted px-2 py-0.5">ISSN {journal.issn_number}</span>
        )}
      </div>
      {journal.summary && (
        <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
          {journal.summary}
        </p>
      )}
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Visit journal ↗
        </a>
      )}
    </article>
  )
}

