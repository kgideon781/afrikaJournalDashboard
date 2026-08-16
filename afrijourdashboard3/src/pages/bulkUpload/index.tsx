import { useMemo, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import {
  IconAlertCircle,
  IconCheck,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconLoader2,
  IconUpload,
} from '@tabler/icons-react'

interface ErrorEntry {
  row: number
  message: string
}

interface CreatedEntry {
  row: number
  article_id: number
}

interface UploadResponse {
  created: number
  skipped: number
  errors: ErrorEntry[]
  created_rows: CreatedEntry[]
}

const MAX_PDFS = 200
const MAX_TOTAL_BYTES = 200 * 1024 * 1024

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function BulkUpload() {
  const [sheet, setSheet] = useState<File | null>(null)
  const [pdfs, setPdfs] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalBytes = useMemo(
    () => (sheet?.size ?? 0) + pdfs.reduce((s, f) => s + f.size, 0),
    [sheet, pdfs]
  )
  const overLimitFiles = pdfs.length > MAX_PDFS
  const overLimitSize = totalBytes > MAX_TOTAL_BYTES

  const getToken = () => {
    const t = localStorage.getItem('authTokens')
    return t ? JSON.parse(t).access : null
  }

  const handlePdfs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfs(Array.from(e.target.files ?? []))
  }

  const reset = () => {
    setSheet(null)
    setPdfs([])
    setResult(null)
    setError(null)
  }

  const submit = async () => {
    setError(null)
    setResult(null)

    if (!sheet) {
      setError('Please choose a completed template spreadsheet (.xlsx).')
      return
    }
    if (pdfs.length === 0) {
      setError('Please add at least one PDF file.')
      return
    }
    if (overLimitFiles) {
      setError(`Too many PDFs. Max ${MAX_PDFS} per submission.`)
      return
    }
    if (overLimitSize) {
      setError(
        `Total upload is too large. Max ${MAX_TOTAL_BYTES / 1024 / 1024} MB per submission.`
      )
      return
    }

    const token = getToken()
    if (!token) {
      setError('Not authenticated. Please sign in again.')
      return
    }

    const fd = new FormData()
    fd.append('sheet', sheet)
    for (const p of pdfs) fd.append('pdfs', p)

    setLoading(true)
    try {
      const res = await fetch(
        `${BASE_URL}/journal_api/api/bulk_upload/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok && !data?.created && !data?.skipped) {
        setError(data?.error || `Upload failed with HTTP ${res.status}.`)
      } else {
        setResult(data as UploadResponse)
      }
    } catch (err) {
      console.error(err)
      setError('Network error during upload. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            Bulk upload articles
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Upload a completed{' '}
            <code className='rounded bg-muted/60 px-1 py-0.5 text-xs'>
              AJP_Bulk_Upload_Template.xlsx
            </code>{' '}
            plus the matching PDF files. One row per article. Register the
            journal on the platform first — rows referencing journals you
            don't own will be rejected.
          </p>
        </div>

        <div className='space-y-5 rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm'>
          {/* Sheet input */}
          <div>
            <label className='mb-1.5 block text-sm font-medium'>
              Completed spreadsheet <span className='text-red-400'>*</span>
            </label>
            <label className='flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-border/60 bg-background/40 px-4 py-4 text-sm hover:border-primary/50 hover:bg-muted/40'>
              <IconFileSpreadsheet className='h-6 w-6 text-secondary' />
              {sheet ? (
                <div className='min-w-0'>
                  <div className='truncate font-medium text-foreground'>
                    {sheet.name}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {formatBytes(sheet.size)} · click to replace
                  </div>
                </div>
              ) : (
                <div>
                  <div className='font-medium text-primary'>
                    Choose the .xlsx template
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Must contain an "Articles" tab
                  </div>
                </div>
              )}
              <input
                type='file'
                accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                className='hidden'
                onChange={(e) => setSheet(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* PDFs input */}
          <div>
            <label className='mb-1.5 block text-sm font-medium'>
              PDF files <span className='text-red-400'>*</span>
              <span className='ml-2 text-xs font-normal text-muted-foreground'>
                {pdfs.length} selected ·{' '}
                {formatBytes(pdfs.reduce((s, f) => s + f.size, 0))} · max{' '}
                {MAX_PDFS} files, {MAX_TOTAL_BYTES / 1024 / 1024} MB total
              </span>
            </label>
            <label className='flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-border/60 bg-background/40 px-4 py-4 text-sm hover:border-primary/50 hover:bg-muted/40'>
              <IconFileTypePdf className='h-6 w-6 text-secondary' />
              <div>
                <div className='font-medium text-primary'>
                  {pdfs.length === 0 ? 'Choose PDFs' : 'Replace PDFs'}
                </div>
                <div className='text-xs text-muted-foreground'>
                  File names must match the{' '}
                  <code className='rounded bg-muted/60 px-1 text-xs'>
                    pdf_filename
                  </code>{' '}
                  column exactly
                </div>
              </div>
              <input
                type='file'
                accept='.pdf,application/pdf'
                multiple
                className='hidden'
                onChange={handlePdfs}
              />
            </label>

            {pdfs.length > 0 && (
              <details className='mt-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm'>
                <summary className='cursor-pointer text-muted-foreground'>
                  Show file list ({pdfs.length})
                </summary>
                <ul className='mt-2 max-h-48 overflow-y-auto space-y-0.5 pl-2 text-xs text-foreground/80'>
                  {pdfs.map((f, i) => (
                    <li key={i}>
                      {f.name}{' '}
                      <span className='text-muted-foreground'>
                        ({formatBytes(f.size)})
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {(overLimitFiles || overLimitSize) && (
              <div className='mt-2 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700'>
                <IconAlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                {overLimitFiles && (
                  <span>Too many files ({pdfs.length}). Split into batches.</span>
                )}
                {overLimitSize && (
                  <span>Total size too large. Split into batches.</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className='flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700'>
              <IconAlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <div className='flex items-center justify-end gap-3 border-t border-border/60 pt-4'>
            <button
              type='button'
              onClick={reset}
              disabled={loading}
              className='rounded-md border border-border/60 bg-card px-4 py-2 text-sm hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60'
            >
              Reset
            </button>
            <button
              type='button'
              onClick={submit}
              disabled={loading || !sheet || pdfs.length === 0}
              className='inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60'
            >
              {loading ? (
                <IconLoader2 className='h-4 w-4 animate-spin' />
              ) : (
                <IconUpload className='h-4 w-4' />
              )}
              {loading ? 'Uploading…' : 'Upload & create articles'}
            </button>
          </div>
        </div>

        {result && (
          <div className='mt-6 space-y-4'>
            <div className='rounded-xl border border-border/60 bg-card p-5 shadow-sm'>
              <h2 className='mb-3 text-lg font-semibold'>Result</h2>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-3'>
                  <div className='text-xs text-emerald-800'>Articles created</div>
                  <div className='mt-1 text-2xl font-semibold text-emerald-800'>
                    {result.created}
                  </div>
                </div>
                <div className='rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-3'>
                  <div className='text-xs text-amber-800'>Duplicates skipped</div>
                  <div className='mt-1 text-2xl font-semibold text-amber-800'>
                    {result.skipped}
                  </div>
                </div>
                <div className='rounded-md border border-red-500/40 bg-red-500/10 px-3 py-3'>
                  <div className='text-xs text-red-800'>Row errors</div>
                  <div className='mt-1 text-2xl font-semibold text-red-800'>
                    {result.errors.length}
                  </div>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className='rounded-xl border border-border/60 bg-card p-5 shadow-sm'>
                <h3 className='mb-2 text-sm font-semibold'>Errors by row</h3>
                <table className='min-w-full divide-y divide-border/60 text-sm'>
                  <thead className='text-xs uppercase text-muted-foreground'>
                    <tr>
                      <th className='w-16 px-3 py-2 text-left font-medium'>
                        Row
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/60'>
                    {result.errors.map((e, i) => (
                      <tr key={i}>
                        <td className='px-3 py-2 font-mono text-xs'>
                          {e.row}
                        </td>
                        <td className='px-3 py-2'>{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.created > 0 && (
              <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-800'>
                <IconCheck className='mr-1 inline h-4 w-4' />
                {result.created} article
                {result.created === 1 ? '' : 's'} added. Ownership tied to your
                account.
              </div>
            )}
          </div>
        )}
      </Layout.Body>
    </Layout>
  )
}
