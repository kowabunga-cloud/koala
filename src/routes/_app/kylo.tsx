import { createFileRoute } from '@tanstack/react-router'
import { useReadKylo } from '@/api/generated/endpoints/kylo/kylo'
import { useListProjectRegionKylos } from '@/api/generated/endpoints/project/project'
import { Field, Grid, PageTitle } from '@/components/resource'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { humanSize } from '@/lib/format'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/kylo')({
  component: KyloPage,
})

function KyloPage() {
  const { project, region } = useScope()
  const kylos = useListProjectRegionKylos(project ?? '', region ?? '', undefined, {
    query: { enabled: !!project && !!region },
  })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>
        Kylo Elastic Volumes
        {kylos.data && <Badge variant="secondary" className="ml-2 align-middle">{kylos.data.length}</Badge>}
      </PageTitle>
      <Grid ids={kylos.data} loading={kylos.isPending && !!project && !!region} render={(id) => <KyloCard id={id} />} />
    </div>
  )
}

function KyloCard({ id }: { id: string }) {
  const { data: k } = useReadKylo(id)
  if (!k) return <Skeleton className="h-40" />

  // NFS export path, as clients mount it
  const mount = k.endpoint ? `${k.endpoint}:/${k.name}` : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 break-all">
          {k.name}
          {k.access && <Badge variant={k.access === 'RW' ? 'default' : 'secondary'}>{k.access}</Badge>}
        </CardTitle>
        <CardDescription className="break-all">{k.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl>
          <Field label="Mount">
            {mount ? <code className="font-mono text-xs break-all">{mount}</code> : '—'}
          </Field>
          <Field label="NFS versions">{k.protocols?.length ? k.protocols.map((p) => `v${p}`).join(', ') : '—'}</Field>
          <Field label="Used">{humanSize(k.size)}</Field>
        </dl>
      </CardContent>
    </Card>
  )
}
