import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useReadKonvey } from '@/api/generated/endpoints/konvey/konvey'
import { useListProjectRegionKonveys } from '@/api/generated/endpoints/project/project'
import { Field, Grid, PageTitle } from '@/components/resource'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/konvey')({
  component: KonveyPage,
})

// Konvey network load balancers of the current project, in the current region.
function KonveyPage() {
  const { project, region } = useScope()
  const enabled = !!project && !!region
  const konveys = useListProjectRegionKonveys(project ?? '', region ?? '', { query: { enabled } })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>Konvey Load Balancers</PageTitle>
      <Grid ids={konveys.data} loading={konveys.isPending && enabled} render={(id) => <KonveyCard id={id} />} />
    </div>
  )
}

function KonveyCard({ id }: { id: string }) {
  const { data: k } = useReadKonvey(id)
  if (!k) return <Skeleton className="h-48" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 break-all">
          {k.name ?? 'Konvey'}
          {k.failover && <Badge variant="secondary">Failover</Badge>}
        </CardTitle>
        {k.description && <CardDescription className="break-all">{k.description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-3">
        <dl>
          <Field label="Virtual IP"><span className="font-mono">{k.vip ?? '—'}</span></Field>
          <Field label="Failover">{k.failover ? 'Enabled' : 'Disabled'}</Field>
        </dl>
        {k.endpoints?.map((e) => (
          <div key={`${e.name}-${e.port}`} className="rounded-md border p-3 text-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium break-all">{e.name}</span>
              <Badge variant="outline" className="font-mono uppercase">
                {e.protocol}/{e.port}
              </Badge>
            </div>
            <div className="mt-2 flex items-start gap-1.5 font-mono text-xs">
              <ArrowRight className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
              <div className="grid min-w-0 gap-0.5">
                {e.backends?.hosts?.length
                  ? e.backends.hosts.map((h) => <span key={h} className="break-all">{h}:{e.backends.port}</span>)
                  : <span className="text-muted-foreground">no backends</span>}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
