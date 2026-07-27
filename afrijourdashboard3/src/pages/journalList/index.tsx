import {
  useContext,
  useEffect,
  
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Shield,
  User as UserIcon,
  BadgeCheck,
  Globe2,
  Tag,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Layout } from '@/components/custom/layout'
import AuthContext from '../../AuthContext'
import { BASE_URL } from '../../config'

/* ============================================================
   Types
   ============================================================ */

interface Language {
  id: number
  language: string
}
interface Country {
  id: number
  country: string
}
interface ThematicArea {
  id: number
  thematic_area: string
}
interface Platform {
  id: number
  platform: string
}

interface Journal {
  id: number
  journal_title: string
  publishers_name: string | null
  issn_number: string | null
  link: string | null
  summary: string | null
  language: Language | null
  country: Country | null
  thematic_area: ThematicArea | null
  platform: Platform | null
  aim_identifier: boolean
  medline: boolean
  google_scholar_index: boolean | null
  open_access_journal: boolean | null
  listed_in_doaj: boolean | null
  present_issn: boolean | null
  publisher_in_cope: boolean | null
  online_publisher_africa: boolean | null
  hosted_on_inasps: boolean | null
  impact_factor: number | null
  sjr: number | null
  h_index: number | null
  eigen_factor: number | null
  eigen_metrix: number | null
  snip: number | null
  snip_metrix: number | null
  approved: boolean
  user: number | null
}

interface JournalListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Journal[]
}

type Scope = 'mine' | 'all'

/* ============================================================
   Helpers
   ============================================================ */

const authHeaders = (): HeadersInit => {
  const tokens = localStorage.getItem('authTokens')
  if (!tokens) return { 'Content-Type': 'application/json' }
  try {
    const access = JSON.parse(tokens)?.access
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access}`,
    }
  } catch {
    return { 'Content-Type': 'application/json' }
  }
}

const emptyFormData = (userId?: number | null) => ({
  journal_title: '',
  publishers_name: '',
  issn_number: '',
  link: '',
  summary: '',
  language: '' as string | number,
  country: '' as string | number,
  thematic_area: '' as string | number,
  platform: '' as string | number,
  aim_identifier: false,
  medline: false,
  google_scholar_index: false,
  open_access_journal: false,
  listed_in_doaj: false,
  present_issn: false,
  publisher_in_cope: false,
  online_publisher_africa: false,
  hosted_on_inasps: false,
  impact_factor: '' as string | number,
  sjr: '' as string | number,
  h_index: '' as string | number,
  eigen_factor: '' as string | number,
  snip: '' as string | number,
  user: userId ?? undefined,
})

type FormState = ReturnType<typeof emptyFormData>

/* Populate the form with an existing journal's data for edit mode. */
const journalToForm = (j: Journal): FormState => ({
  journal_title: j.journal_title ?? '',
  publishers_name: j.publishers_name ?? '',
  issn_number: j.issn_number ?? '',
  link: j.link ?? '',
  summary: j.summary ?? '',
  language: j.language?.id ?? '',
  country: j.country?.id ?? '',
  thematic_area: j.thematic_area?.id ?? '',
  platform: j.platform?.id ?? '',
  aim_identifier: !!j.aim_identifier,
  medline: !!j.medline,
  google_scholar_index: !!j.google_scholar_index,
  open_access_journal: !!j.open_access_journal,
  listed_in_doaj: !!j.listed_in_doaj,
  present_issn: !!j.present_issn,
  publisher_in_cope: !!j.publisher_in_cope,
  online_publisher_africa: !!j.online_publisher_africa,
  hosted_on_inasps: !!j.hosted_on_inasps,
  impact_factor: j.impact_factor ?? '',
  sjr: j.sjr ?? '',
  h_index: j.h_index ?? '',
  eigen_factor: j.eigen_factor ?? '',
  snip: j.snip ?? '',
  user: j.user ?? undefined,
})

/* Convert form values to the JSON payload the API accepts.
   Empty strings become null for optional numeric/FK fields, so we don't
   send "" and get a 400. */
const formToPayload = (f: FormState) => {
  const numOrNull = (v: string | number) =>
    v === '' || v === null || v === undefined ? null : Number(v)
  return {
    journal_title: f.journal_title,
    publishers_name: f.publishers_name || null,
    issn_number: f.issn_number || null,
    link: f.link || null,
    summary: f.summary || null,
    language: numOrNull(f.language),
    country: numOrNull(f.country),
    thematic_area: numOrNull(f.thematic_area),
    platform: numOrNull(f.platform),
    aim_identifier: !!f.aim_identifier,
    medline: !!f.medline,
    google_scholar_index: !!f.google_scholar_index,
    open_access_journal: !!f.open_access_journal,
    listed_in_doaj: !!f.listed_in_doaj,
    present_issn: !!f.present_issn,
    publisher_in_cope: !!f.publisher_in_cope,
    online_publisher_africa: !!f.online_publisher_africa,
    hosted_on_inasps: !!f.hosted_on_inasps,
    impact_factor: numOrNull(f.impact_factor),
    sjr: numOrNull(f.sjr),
    h_index: numOrNull(f.h_index),
    eigen_factor: numOrNull(f.eigen_factor),
    snip: numOrNull(f.snip),
    user: f.user ?? undefined,
  }
}

/* ============================================================
   Page
   ============================================================ */

const JournalListPage = () => {
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const isStaff: boolean = !!user?.is_staff

  const [scope, setScope] = useState<Scope>('mine')
  const [journals, setJournals] = useState<Journal[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Reference data for select dropdowns
  const [languages, setLanguages] = useState<Language[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [thematic, setThematic] = useState<ThematicArea[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])

  // Edit/create modal
  const [showForm, setShowForm] = useState(false)
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null)
  const [formData, setFormData] = useState<FormState>(() =>
    emptyFormData(user?.user_id)
  )
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Delete confirmation
  const [deletingJournal, setDeletingJournal] = useState<Journal | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ---------- reference data ---------- */
  useEffect(() => {
    const load = async <T,>(url: string): Promise<T[]> => {
      try {
        const res = await fetch(url)
        if (!res.ok) return []
        return await res.json()
      } catch {
        return []
      }
    }
    void load<Language>(`${BASE_URL}/journal_api/api/languages/`).then(setLanguages)
    void load<Country>(`${BASE_URL}/journal_api/api/country/`).then(setCountries)
    void load<ThematicArea>(`${BASE_URL}/journal_api/api/thematic/`).then(
      setThematic
    )
    void load<Platform>(`${BASE_URL}/journal_api/api/platform/`).then(setPlatforms)
  }, [])

  /* ---------- fetch list ---------- */
  const fetchJournals = async (searchTerm: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(pageSize))
      if (isStaff && scope === 'all') params.set('scope', 'all')
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      const res = await fetch(
        `${BASE_URL}/journal_api/api/user-journals/?${params.toString()}`,
        { headers: authHeaders() }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: JournalListResponse = await res.json()
      setJournals(data.results ?? [])
      setTotal(data.count ?? 0)
    } catch (e) {
      setError((e as Error).message)
      setJournals([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Debounce search: refetch 300ms after the user stops typing. Reset to
  // page 1 whenever the search term changes so results are never hidden on
  // some later page the user forgot they were on.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (page !== 1 && search.trim()) {
        setPage(1) // triggers the other effect
      } else {
        void fetchJournals(search)
      }
    }, 300)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    void fetchJournals(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, page])

  // Server already filtered; no client-side filter needed.
  const visible = journals

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  /* ---------- open create/edit ---------- */
  const openCreate = () => {
    setEditingJournal(null)
    setFormData(emptyFormData(user?.user_id))
    setShowAdvanced(false)
    setShowForm(true)
  }

  const openEdit = (j: Journal) => {
    setEditingJournal(j)
    setFormData(journalToForm(j))
    setShowAdvanced(false)
    setShowForm(true)
  }

  /* ---------- save (create or update) ---------- */
  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.journal_title.trim()) {
      alert('Journal title is required')
      return
    }
    setSaving(true)
    try {
      const payload = formToPayload(formData)
      const url = editingJournal
        ? `${BASE_URL}/journal_api/api/user-journals/${editingJournal.id}/`
        : `${BASE_URL}/journal_api/api/user-journals/`
      const method = editingJournal ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status}: ${text.slice(0, 200)}`)
      }
      setShowForm(false)
      setEditingJournal(null)
      await fetchJournals()
    } catch (e) {
      alert(`Save failed — ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deletingJournal) return
    setDeleting(true)
    try {
      const res = await fetch(
        `${BASE_URL}/journal_api/api/user-journals/${deletingJournal.id}/`,
        { method: 'DELETE', headers: authHeaders() }
      )
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
      setDeletingJournal(null)
      await fetchJournals()
    } catch (e) {
      alert(`Delete failed — ${(e as Error).message}`)
    } finally {
      setDeleting(false)
    }
  }

  const canEdit = (j: Journal): boolean => {
    if (isStaff) return true
    return j.user === user?.user_id
  }

  return (
    <Layout>
      <Layout.Body>
        {/* ============ Header ============ */}
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground md:text-3xl'>
              {scope === 'all' ? 'All Journals' : 'My Journals'}
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {scope === 'all'
                ? 'Manage every journal in the catalogue. Admin view.'
                : "The journals you've added. Edit or delete anything you own."}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {isStaff && (
              <div className='inline-flex rounded-lg border border-border bg-card p-0.5'>
                <button
                  onClick={() => {
                    setScope('mine')
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    scope === 'mine'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserIcon className='h-3.5 w-3.5' />
                  My journals
                </button>
                <button
                  onClick={() => {
                    setScope('all')
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    scope === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield className='h-3.5 w-3.5' />
                  All journals
                </button>
              </div>
            )}

            <Link
              to='/submit_journal'
              className='inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-background px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10'
            >
              <Plus className='h-4 w-4' />
              Submit new journal
            </Link>
            <button
              onClick={openCreate}
              className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90'
            >
              <Plus className='h-4 w-4' />
              New journal
            </button>
          </div>
        </div>

        {/* ============ Search ============ */}
        <div className='mb-4 flex items-center gap-2'>
          <div className='relative flex-1 max-w-md'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              placeholder='Filter this page by title, publisher, country…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
            />
          </div>
          <p className='text-xs text-muted-foreground'>
            {loading ? 'Loading…' : `${total.toLocaleString()} total`}
          </p>
        </div>

        {/* ============ Error ============ */}
        {error && (
          <div className='mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground'>
            {error}
          </div>
        )}

        {/* ============ Table ============ */}
        {loading ? (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-16 animate-pulse rounded-lg border border-border bg-muted'
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className='rounded-lg border border-dashed border-border bg-card p-12 text-center'>
            <p className='text-sm text-muted-foreground'>
              {scope === 'mine'
                ? "You haven't added any journals yet."
                : 'No journals match your filter.'}
            </p>
            {scope === 'mine' && (
              <button
                onClick={openCreate}
                className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90'
              >
                <Plus className='h-4 w-4' />
                Add your first journal
              </button>
            )}
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border border-border bg-card'>
            <table className='w-full text-sm'>
              <thead className='bg-muted text-xs uppercase tracking-wider text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3 text-left'>Title</th>
                  <th className='hidden px-4 py-3 text-left md:table-cell'>
                    Publisher
                  </th>
                  <th className='hidden px-4 py-3 text-left lg:table-cell'>
                    Country
                  </th>
                  <th className='hidden px-4 py-3 text-left lg:table-cell'>
                    Thematic area
                  </th>
                  <th className='px-4 py-3 text-left'>Status</th>
                  <th className='px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((j) => (
                  <tr
                    key={j.id}
                    className='border-t border-border transition hover:bg-muted/40'
                  >
                    <td className='px-4 py-3'>
                      <div className='font-medium text-foreground'>
                        {j.journal_title || <em className='text-muted-foreground'>Untitled</em>}
                      </div>
                      {j.issn_number && (
                        <div className='mt-0.5 text-xs text-muted-foreground'>
                          ISSN {j.issn_number}
                        </div>
                      )}
                    </td>
                    <td className='hidden px-4 py-3 md:table-cell'>
                      <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <Building2 className='h-3.5 w-3.5 text-primary/70' />
                        <span className='truncate'>
                          {j.publishers_name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className='hidden px-4 py-3 lg:table-cell'>
                      <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <Globe2 className='h-3.5 w-3.5 text-primary/70' />
                        {j.country?.country || '—'}
                      </div>
                    </td>
                    <td className='hidden px-4 py-3 lg:table-cell'>
                      <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <Tag className='h-3.5 w-3.5 text-primary/70' />
                        <span className='line-clamp-1'>
                          {j.thematic_area?.thematic_area || '—'}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-1'>
                        {j.approved ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800'>
                            <BadgeCheck className='h-3 w-3' />
                            Approved
                          </span>
                        ) : (
                          <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800'>
                            Pending
                          </span>
                        )}
                        {j.open_access_journal && (
                          <span className='rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary'>
                            OA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex justify-end gap-1'>
                        <Link
                          to={`/journals/${j.id}`}
                          className='inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
                          title='View details'
                        >
                          <Search className='h-4 w-4' />
                        </Link>
                        {canEdit(j) && (
                          <>
                            <button
                              onClick={() => openEdit(j)}
                              className='inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary'
                              title='Edit'
                            >
                              <Pencil className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => setDeletingJournal(j)}
                              className='inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                              title='Delete'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============ Pagination ============ */}
        {!loading && total > pageSize && (
          <div className='mt-4 flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>
              Page {page} of {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:border-primary/40 hover:text-primary'
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:border-primary/40 hover:text-primary'
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ============ Edit / Create modal ============ */}
        {showForm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
            <div className='max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl'>
              <div className='flex items-center justify-between border-b border-border px-6 py-4'>
                <h2 className='text-lg font-semibold text-foreground'>
                  {editingJournal ? 'Edit journal' : 'Add new journal'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className='rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <form onSubmit={handleSave} className='flex max-h-[calc(90vh-8rem)] flex-col'>
                <div className='flex-1 space-y-4 overflow-y-auto px-6 py-5'>
                  {/* ---------- Basic fields ---------- */}
                  <Field label='Title *'>
                    <input
                      type='text'
                      required
                      value={formData.journal_title}
                      onChange={(e) =>
                        setFormData({ ...formData, journal_title: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <Field label='Publisher'>
                      <input
                        type='text'
                        value={formData.publishers_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publishers_name: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label='ISSN'>
                      <input
                        type='text'
                        value={formData.issn_number}
                        onChange={(e) =>
                          setFormData({ ...formData, issn_number: e.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label='Website link'>
                    <input
                      type='url'
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder='https://…'
                      className={inputClass}
                    />
                  </Field>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <SelectField
                      label='Country'
                      value={formData.country}
                      onChange={(v) => setFormData({ ...formData, country: v })}
                      options={countries.map((c) => ({
                        value: c.id,
                        label: c.country,
                      }))}
                    />
                    <SelectField
                      label='Language'
                      value={formData.language}
                      onChange={(v) => setFormData({ ...formData, language: v })}
                      options={languages.map((l) => ({
                        value: l.id,
                        label: l.language,
                      }))}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <SelectField
                      label='Thematic area'
                      value={formData.thematic_area}
                      onChange={(v) =>
                        setFormData({ ...formData, thematic_area: v })
                      }
                      options={thematic.map((t) => ({
                        value: t.id,
                        label: t.thematic_area,
                      }))}
                    />
                    <SelectField
                      label='Platform'
                      value={formData.platform}
                      onChange={(v) => setFormData({ ...formData, platform: v })}
                      options={platforms.map((p) => ({
                        value: p.id,
                        label: p.platform,
                      }))}
                    />
                  </div>

                  <Field label='Summary'>
                    <textarea
                      rows={4}
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <div className='flex flex-wrap gap-4 pt-1'>
                    <Checkbox
                      label='Open access'
                      checked={formData.open_access_journal}
                      onChange={(v) =>
                        setFormData({ ...formData, open_access_journal: v })
                      }
                    />
                    <Checkbox
                      label='Indexed on Google Scholar'
                      checked={formData.google_scholar_index}
                      onChange={(v) =>
                        setFormData({ ...formData, google_scholar_index: v })
                      }
                    />
                  </div>

                  {/* ---------- Advanced ---------- */}
                  <button
                    type='button'
                    onClick={() => setShowAdvanced((s) => !s)}
                    className='mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
                  >
                    {showAdvanced ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    )}
                    Advanced metadata
                  </button>

                  {showAdvanced && (
                    <div className='rounded-lg border border-border bg-muted/40 p-4'>
                      <div className='mb-3 grid grid-cols-2 gap-3 md:grid-cols-3'>
                        <Checkbox
                          label='Listed in DOAJ'
                          checked={formData.listed_in_doaj}
                          onChange={(v) =>
                            setFormData({ ...formData, listed_in_doaj: v })
                          }
                        />
                        <Checkbox
                          label='COPE member'
                          checked={formData.publisher_in_cope}
                          onChange={(v) =>
                            setFormData({ ...formData, publisher_in_cope: v })
                          }
                        />
                        <Checkbox
                          label='INASPS hosted'
                          checked={formData.hosted_on_inasps}
                          onChange={(v) =>
                            setFormData({ ...formData, hosted_on_inasps: v })
                          }
                        />
                        <Checkbox
                          label='African Index Medicus'
                          checked={formData.aim_identifier}
                          onChange={(v) =>
                            setFormData({ ...formData, aim_identifier: v })
                          }
                        />
                        <Checkbox
                          label='Medline indexed'
                          checked={formData.medline}
                          onChange={(v) =>
                            setFormData({ ...formData, medline: v })
                          }
                        />
                        <Checkbox
                          label='Online publisher in Africa'
                          checked={formData.online_publisher_africa}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              online_publisher_africa: v,
                            })
                          }
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                        <Field label='Impact factor'>
                          <input
                            type='number'
                            step='0.01'
                            value={formData.impact_factor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                impact_factor: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label='SJR'>
                          <input
                            type='number'
                            step='0.01'
                            value={formData.sjr}
                            onChange={(e) =>
                              setFormData({ ...formData, sjr: e.target.value })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label='h-index'>
                          <input
                            type='number'
                            value={formData.h_index}
                            onChange={(e) =>
                              setFormData({ ...formData, h_index: e.target.value })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label='Eigenfactor'>
                          <input
                            type='number'
                            step='0.01'
                            value={formData.eigen_factor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                eigen_factor: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label='SNIP'>
                          <input
                            type='number'
                            step='0.01'
                            value={formData.snip}
                            onChange={(e) =>
                              setFormData({ ...formData, snip: e.target.value })
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4'>
                  <button
                    type='button'
                    onClick={() => setShowForm(false)}
                    className='rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={saving}
                    className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60'
                  >
                    {saving && <Loader2 className='h-4 w-4 animate-spin' />}
                    {editingJournal ? 'Save changes' : 'Create journal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============ Delete confirm ============ */}
        {deletingJournal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
            <div className='w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl'>
              <div className='px-6 py-5'>
                <h3 className='text-lg font-semibold text-foreground'>
                  Delete this journal?
                </h3>
                <p className='mt-2 text-sm text-muted-foreground'>
                  <span className='font-medium text-foreground'>
                    {deletingJournal.journal_title || 'Untitled'}
                  </span>{' '}
                  will be permanently removed. This can't be undone.
                </p>
              </div>
              <div className='flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4'>
                <button
                  onClick={() => setDeletingJournal(null)}
                  disabled={deleting}
                  className='rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60'
                >
                  {deleting && <Loader2 className='h-4 w-4 animate-spin' />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout.Body>
    </Layout>
  )
}

/* ============================================================
   Small helpers
   ============================================================ */

const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <label className='block'>
    <span className='mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground'>
      {label}
    </span>
    {children}
  </label>
)

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string | number
  onChange: (v: string | number) => void
  options: { value: string | number; label: string }[]
}) => (
  <Field label={label}>
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value === '' ? '' : Number(e.target.value))
      }
      className={inputClass}
    >
      <option value=''>— Select —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </Field>
)

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) => (
  <label className='inline-flex cursor-pointer items-center gap-2 text-sm text-foreground'>
    <input
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className='h-4 w-4 rounded border-border text-primary focus:ring-primary/40'
    />
    {label}
  </label>
)

export default JournalListPage
