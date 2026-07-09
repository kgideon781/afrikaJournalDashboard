// Shared status pill helper — reused across manuscript queues + list pages.
export const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  revision: 'Revision requested',
  accepted: 'Accepted',
  rejected: 'Rejected',
  published: 'Published',
}

export function statusPillClasses(status: string): string {
  switch (status) {
    case 'submitted':
      return 'bg-primary/15 text-primary ring-1 ring-primary/40'
    case 'under_review':
      return 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/40'
    case 'revision':
      return 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/40'
    case 'accepted':
    case 'published':
      return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
    case 'rejected':
      return 'bg-red-500/15 text-red-300 ring-1 ring-red-500/40'
    default:
      return 'bg-muted text-muted-foreground ring-1 ring-border/60'
  }
}
