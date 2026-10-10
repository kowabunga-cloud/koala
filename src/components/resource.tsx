import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TabsTrigger } from '@/components/ui/tabs'

// Building blocks shared by resource pages: tab with count, card grid with loading/empty states, label/value row.

export function Tab({ value, icon, label, count }: { value: string; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <TabsTrigger value={value}>
      {icon}
      {label}
      {count !== undefined && <Badge variant="secondary">{count}</Badge>}
    </TabsTrigger>
  )
}

export function Grid({ ids, loading, render }: { ids?: string[]; loading: boolean; render: (id: string) => React.ReactNode }) {
  if (loading) return <CardGrid>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</CardGrid>
  if (!ids?.length) return <p className="py-8 text-center text-muted-foreground">Nothing here yet.</p>
  return <CardGrid>{ids.map((id) => <div key={id}>{render(id)}</div>)}</CardGrid>
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words">{children}</dd>
    </div>
  )
}

export function PageTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      {actions}
    </div>
  )
}
