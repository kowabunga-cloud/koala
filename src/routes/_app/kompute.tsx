import { createFileRoute } from '@tanstack/react-router'
import { CircleCheck, CircleX, Cpu, HardDrive, MemoryStick, Network } from 'lucide-react'
import { useReadAdapter } from '@/api/generated/endpoints/adapter/adapter'
import { useReadInstance, useReadInstanceState } from '@/api/generated/endpoints/instance/instance'
import { useListProjectZoneInstances } from '@/api/generated/endpoints/project/project'
import { useReadVolume } from '@/api/generated/endpoints/volume/volume'
import { InstanceActions } from '@/components/kompute/instance-actions'
import { Grid, PageTitle } from '@/components/resource'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { humanSize } from '@/lib/format'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/kompute')({
  component: KomputePage,
})

// Instance power state is polled, as it changes asynchronously after power actions.
const STATE_POLL_MS = 5_000

function KomputePage() {
  const { project, zone } = useScope()
  const instances = useListProjectZoneInstances(project ?? '', zone ?? '', {
    query: { enabled: !!project && !!zone },
  })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>
        Kompute Instances
        {instances.data && <Badge variant="secondary" className="ml-2 align-middle">{instances.data.length}</Badge>}
      </PageTitle>
      <Grid
        ids={instances.data}
        loading={instances.isPending && !!project && !!zone}
        render={(id) => <InstanceCard id={id} />}
      />
    </div>
  )
}

function InstanceCard({ id }: { id: string }) {
  const { data: i } = useReadInstance(id)
  const { data: state } = useReadInstanceState(id, {
    // stop polling once the state can't be read (e.g. 404 when Kahuna has no state for it)
    query: { refetchInterval: (q) => (q.state.status === 'error' ? false : STATE_POLL_MS) },
  })

  if (!i) return <Skeleton className="h-56" />
  const running = state?.state === 'Running'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 break-all">
          {i.name}
          {state && (
            <Badge variant={running ? 'default' : 'destructive'} title={state.reason}>
              {running ? <CircleCheck /> : <CircleX />}
              {state.state}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="break-all">{i.description}</CardDescription>
        <CardAction>
          <InstanceActions id={id} name={i.name} running={running} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <Cpu className="size-3.5 text-muted-foreground" /> {i.vcpus} vCPUs
          </span>
          <span className="inline-flex items-center gap-1">
            <MemoryStick className="size-3.5 text-muted-foreground" /> {humanSize(i.memory)}
          </span>
        </div>
        <Section icon={<Network />} title="Network">
          {i.adapters?.length ? i.adapters.map((aid) => <AdapterRow key={aid} id={aid} />) : <Empty />}
        </Section>
        <Section icon={<HardDrive />} title="Volumes">
          {i.volumes?.length ? i.volumes.map((vid) => <VolumeRow key={vid} id={vid} />) : <Empty />}
        </Section>
      </CardContent>
    </Card>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-1 text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {title}
      </div>
      <ul className="grid gap-1">{children}</ul>
    </div>
  )
}

function Empty() {
  return <li className="text-muted-foreground">—</li>
}

function AdapterRow({ id }: { id: string }) {
  const { data: a } = useReadAdapter(id)
  if (!a) return <li><Skeleton className="h-5" /></li>
  return (
    <li className="flex flex-wrap justify-between gap-x-3 rounded-md border px-2 py-1 font-mono text-xs">
      <span className="break-all">{a.mac ?? '—'}</span>
      <span className="break-all font-medium">{a.addresses?.join(', ')}</span>
    </li>
  )
}

function VolumeRow({ id }: { id: string }) {
  const { data: v } = useReadVolume(id)
  if (!v) return <li><Skeleton className="h-5" /></li>
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 rounded-md border px-2 py-1 text-xs">
      <span className="min-w-0 font-medium break-all">{v.name}</span>
      <span className="text-muted-foreground">
        <span className="uppercase">{v.type}</span> · {humanSize(v.size)}
      </span>
    </li>
  )
}
