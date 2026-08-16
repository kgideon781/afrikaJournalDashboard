import { useContext, useEffect, useMemo, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import { BASE_URL } from '@/config'
import {
  IconAlertTriangle,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import AuthContext from '../../AuthContext'

const MANAGED_ROLES = ['Author', 'Reviewer', 'Editor'] as const
type Role = (typeof MANAGED_ROLES)[number]

interface RegisteredUser {
  id: number
  email: string
  user_name: string
  phone_number?: string | null
  location?: string | null
  start_date?: string | null
  is_staff?: boolean
  is_superuser?: boolean
  is_active?: boolean
  approved?: boolean
  roles?: string[]
}

interface Page {
  count: number
  next: string | null
  previous: string | null
  results: RegisteredUser[]
}

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

const Badge = ({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'green' | 'amber' | 'red' | 'primary' | 'purple'
}) => {
  const styles =
    tone === 'green'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
      : tone === 'amber'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
        : tone === 'red'
          ? 'border-red-500/40 bg-red-500/10 text-red-700'
          : tone === 'primary'
            ? 'border-primary/40 bg-primary/10 text-primary'
            : tone === 'purple'
              ? 'border-purple-500/40 bg-purple-500/10 text-purple-700'
              : 'border-border/60 bg-muted/40 text-muted-foreground'
  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs ' +
        styles
      }
    >
      {children}
    </span>
  )
}

// ─── Manage modal ────────────────────────────────────────────────────────────

interface ManageModalProps {
  user: RegisteredUser
  currentUserId: number | undefined
  onClose: () => void
  onSaved: (updated: RegisteredUser) => void
}

const ManageUserModal = ({
  user,
  currentUserId,
  onClose,
  onSaved,
}: ManageModalProps) => {
  const isSelf = currentUserId != null && currentUserId === user.id
  const initialRoles: Role[] = (user.roles || []).filter((r): r is Role =>
    (MANAGED_ROLES as readonly string[]).includes(r)
  )

  const [isActive, setIsActive] = useState(Boolean(user.is_active))
  const [isStaff, setIsStaff] = useState(Boolean(user.is_staff))
  const [isSuperuser, setIsSuperuser] = useState(Boolean(user.is_superuser))
  const [approved, setApproved] = useState(Boolean(user.approved))
  const [roles, setRoles] = useState<Role[]>(initialRoles)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleRole = (r: Role) =>
    setRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    )

  const handleSetSuperuser = (checked: boolean) => {
    if (checked && !isSuperuser) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(
        `Promote ${user.email} to SUPERUSER?\n\nThis grants full god-mode access ` +
          `to every part of the platform, bypassing all permission checks. ` +
          `Also auto-enables Staff so the account can reach /admin.`
      )
      if (!ok) return
      setIsSuperuser(true)
      setIsStaff(true)
    } else {
      setIsSuperuser(checked)
    }
  }

  const buildPayload = () => {
    const payload: Record<string, unknown> = {}
    if (isActive !== Boolean(user.is_active)) payload.is_active = isActive
    if (isStaff !== Boolean(user.is_staff)) payload.is_staff = isStaff
    if (isSuperuser !== Boolean(user.is_superuser))
      payload.is_superuser = isSuperuser
    if (approved !== Boolean(user.approved)) payload.approved = approved

    const prevRoles = new Set(initialRoles)
    const nextRoles = new Set(roles)
    const changed =
      prevRoles.size !== nextRoles.size ||
      [...prevRoles].some((r) => !nextRoles.has(r))
    if (changed) payload.roles = roles
    return payload
  }

  const hasChanges = Object.keys(buildPayload()).length > 0

  const save = async () => {
    setError(null)
    const payload = buildPayload()
    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }
    const tokensRaw = localStorage.getItem('authTokens')
    const token = tokensRaw ? JSON.parse(tokensRaw).access : null
    if (!token) {
      setError('Not authenticated.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/api/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Backend returns field-level {field: message} on 400.
        const msg =
          typeof body === 'object' && body
            ? Object.values(body)
                .map((v) => (Array.isArray(v) ? v.join(' ') : String(v)))
                .join(' · ')
            : `HTTP ${res.status}`
        throw new Error(msg || `HTTP ${res.status}`)
      }
      onSaved(body as RegisteredUser)
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
    disabled,
    disabledReason,
  }: {
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
    disabledReason?: string
  }) => (
    <label
      className={
        'flex items-start gap-3 rounded-md border border-border/60 p-3 ' +
        (disabled ? 'opacity-60' : 'cursor-pointer hover:bg-muted/40')
      }
    >
      <input
        type='checkbox'
        className='mt-0.5 h-4 w-4 rounded border-border/60 accent-primary'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className='min-w-0'>
        <div className='text-sm font-medium'>{label}</div>
        <div className='text-xs text-muted-foreground'>{description}</div>
        {disabled && disabledReason && (
          <div className='mt-1 text-xs text-amber-600'>{disabledReason}</div>
        )}
      </div>
    </label>
  )

  return (
    <div
      role='dialog'
      aria-modal='true'
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onClose}
    >
      <div
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-start justify-between border-b border-border/60 p-5'>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold'>Manage user</h2>
            <p className='mt-0.5 truncate text-sm text-muted-foreground'>
              {user.user_name} · {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
            aria-label='Close'
          >
            <IconX className='h-5 w-5' />
          </button>
        </div>

        {isSelf && (
          <div className='m-5 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800'>
            <IconAlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
            <span>
              This is your own account. You can't strip your own Active, Staff,
              or Superuser flags — ask another admin to do it if you need to.
            </span>
          </div>
        )}

        <div className='space-y-5 p-5'>
          <section>
            <h3 className='mb-2 text-sm font-semibold text-foreground'>
              Access flags
            </h3>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Toggle
                label='Approved'
                description='Required before the user can log in.'
                checked={approved}
                onChange={setApproved}
              />
              <Toggle
                label='Active'
                description='If off, the account cannot authenticate at all.'
                checked={isActive}
                onChange={setIsActive}
                disabled={isSelf && Boolean(user.is_active)}
                disabledReason={
                  isSelf && Boolean(user.is_active)
                    ? "Can't deactivate yourself."
                    : undefined
                }
              />
              <Toggle
                label='Staff'
                description='Access to /admin, pending journals, users list.'
                checked={isStaff}
                onChange={setIsStaff}
                disabled={isSelf && Boolean(user.is_staff)}
                disabledReason={
                  isSelf && Boolean(user.is_staff)
                    ? "Can't revoke your own Staff."
                    : undefined
                }
              />
              <Toggle
                label='Superuser'
                description='God mode: bypasses every permission check.'
                checked={isSuperuser}
                onChange={handleSetSuperuser}
                disabled={isSelf && Boolean(user.is_superuser)}
                disabledReason={
                  isSelf && Boolean(user.is_superuser)
                    ? "Can't revoke your own Superuser."
                    : undefined
                }
              />
            </div>
          </section>

          <section>
            <h3 className='mb-2 text-sm font-semibold text-foreground'>
              Roles
            </h3>
            <p className='mb-2 text-xs text-muted-foreground'>
              Determines what the user can do in the peer-review flow.
            </p>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
              {MANAGED_ROLES.map((r) => (
                <label
                  key={r}
                  className='flex cursor-pointer items-center gap-2 rounded-md border border-border/60 p-3 text-sm hover:bg-muted/40'
                >
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded border-border/60 accent-primary'
                    checked={roles.includes(r)}
                    onChange={() => toggleRole(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </section>

          {error && (
            <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700'>
              {error}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-border/60 p-4'>
          <button
            onClick={onClose}
            disabled={saving}
            className='rounded-md border border-border/60 bg-card px-4 py-2 text-sm hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !hasChanges}
            className='inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60'
          >
            {saving && <IconLoader2 className='h-4 w-4 animate-spin' />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Users list page ─────────────────────────────────────────────────────────

export default function UsersList() {
  const authContext = useContext(AuthContext)
  const currentUserId: number | undefined = authContext?.user?.user_id

  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [managingUser, setManagingUser] = useState<RegisteredUser | null>(null)

  const getToken = () => {
    const t = localStorage.getItem('authTokens')
    return t ? JSON.parse(t).access : null
  }

  const load = async (targetPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(
        `${BASE_URL}/api/users/?page=${targetPage}&page_size=25`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('You need staff access to view registered users.')
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const data: Page = await res.json()
      setUsers(data.results ?? [])
      setCount(data.count ?? 0)
      setNextUrl(data.next)
      setPrevUrl(data.previous)
      setPage(targetPage)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const allRoles = useMemo(() => {
    const s = new Set<string>()
    users.forEach((u) => (u.roles || []).forEach((r) => s.add(r)))
    return Array.from(s).sort()
  }, [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (q) {
        const hay = [
          u.email,
          u.user_name,
          u.phone_number,
          u.location,
          ...(u.roles || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (roleFilter !== 'all' && !(u.roles || []).includes(roleFilter)) {
        return false
      }
      if (statusFilter === 'superuser' && !u.is_superuser) return false
      if (statusFilter === 'staff' && !u.is_staff) return false
      if (statusFilter === 'inactive' && u.is_active) return false
      if (statusFilter === 'unapproved' && u.approved) return false
      if (statusFilter === 'approved' && !u.approved) return false
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const onSaved = (updated: RegisteredUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  return (
    <Layout>
      <Layout.Body className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8'>
        <div className='mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              Registered users
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Everyone with an account on the Afrika Journals platform. Staff
              view only. Click Manage to change access flags or roles.
            </p>
          </div>
          <button
            onClick={() => load(page)}
            className='inline-flex items-center gap-1.5 self-start rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40 md:self-auto'
          >
            <IconRefresh className='h-4 w-4' />
            Refresh
          </button>
        </div>

        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative w-full sm:max-w-md'>
            <IconSearch className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search by email, name, phone, location, role…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className='rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm'
          >
            <option value='all'>All roles</option>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm'
          >
            <option value='all'>All statuses</option>
            <option value='superuser'>Superuser</option>
            <option value='staff'>Staff</option>
            <option value='approved'>Approved</option>
            <option value='unapproved'>Unapproved</option>
            <option value='inactive'>Inactive</option>
          </select>
        </div>

        {error && (
          <div className='mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        <div className='overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm'>
          <table className='min-w-full divide-y divide-border/60 text-sm'>
            <thead className='bg-muted/40 text-xs uppercase text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 text-left font-medium'>User</th>
                <th className='px-4 py-3 text-left font-medium'>Roles</th>
                <th className='px-4 py-3 text-left font-medium'>Contact</th>
                <th className='px-4 py-3 text-left font-medium'>Location</th>
                <th className='px-4 py-3 text-left font-medium'>Status</th>
                <th className='px-4 py-3 text-left font-medium'>Registered</th>
                <th className='px-4 py-3 text-left font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-8 text-center text-muted-foreground'
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-8 text-center text-muted-foreground'
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className='hover:bg-muted/40'>
                    <td className='px-4 py-3'>
                      <div className='font-medium text-foreground'>
                        {u.user_name}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {u.email}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-1'>
                        {(u.roles && u.roles.length > 0) ? (
                          u.roles.map((r) => (
                            <Badge key={r} tone='primary'>
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className='text-xs text-muted-foreground'>
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {u.phone_number || '—'}
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {u.location || '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-1'>
                        {u.is_superuser && <Badge tone='purple'>Superuser</Badge>}
                        {u.is_staff && <Badge tone='amber'>Staff</Badge>}
                        {u.is_active ? (
                          <Badge tone='green'>Active</Badge>
                        ) : (
                          <Badge tone='red'>Inactive</Badge>
                        )}
                        {u.approved ? (
                          <Badge tone='green'>Approved</Badge>
                        ) : (
                          <Badge tone='amber'>Unapproved</Badge>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {formatDate(u.start_date)}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => setManagingUser(u)}
                        className='rounded-md border border-primary/40 bg-background px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10'
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
          <div>
            Showing {filtered.length} of {count} users
            {(search || roleFilter !== 'all' || statusFilter !== 'all') &&
              ' (filtered)'}
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => load(page - 1)}
              disabled={!prevUrl || loading}
              className='rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40 disabled:opacity-40'
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => load(page + 1)}
              disabled={!nextUrl || loading}
              className='rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/40 disabled:opacity-40'
            >
              Next
            </button>
          </div>
        </div>

        {managingUser && (
          <ManageUserModal
            user={managingUser}
            currentUserId={currentUserId}
            onClose={() => setManagingUser(null)}
            onSaved={onSaved}
          />
        )}
      </Layout.Body>
    </Layout>
  )
}
