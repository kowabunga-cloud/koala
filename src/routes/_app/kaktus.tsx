import { useQueries, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Cpu, HardDrive, Network, Server, Wrench } from 'lucide-react'
import { Netmask } from 'netmask'
import { getReadAdapterQueryOptions } from '@/api/generated/endpoints/adapter/adapter'
import {
  getReadKaktusQueryKey,
  useDisableKaktusMaintenance,
  useEnableKaktusMaintenance,
  useListKaktusInstances,
  useReadKaktus,
  useReadKaktusCaps,
} from '@/api/generated/endpoints/kaktus/kaktus'
import { useReadStorageNFS, useListStorageNFSKylos } from '@/api/generated/endpoints/nfs/nfs'
import {
  useListStoragePoolTemplates,
  useListStoragePoolVolumes,
  useReadStoragePool,
} from '@/api/generated/endpoints/pool/pool'
import {
  useListRegionStorageNFSs,
  useListRegionStoragePools,
  useListRegionVNets,
} from '@/api/generated/endpoints/region/region'
import { useListSubnetAdapters, useReadSubnet } from '@/api/generated/endpoints/subnet/subnet'
import { useReadTemplate } from '@/api/generated/endpoints/template/template'
import { useListVNetSubnets, useReadVNet } from '@/api/generated/endpoints/vnet/vnet'
import { useListZoneKaktuses } from '@/api/generated/endpoints/zone/zone'
import { Badge } from '@/components/ui/badge'
import { Field, Grid, PageTitle, Tab } from '@/components/resource'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { auth } from '@/lib/auth'
import { humanSize, money } from '@/lib/format'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/kaktus')({
  beforeLoad: () => {
    if (auth.role() !== 'superAdmin') throw redirect({ to: '/' })
  },
  component: KaktusPage,
})

// The API lists IDs, then each object is read on its own. Each card below fetches its own data,
// so TanStack Query de-duplicates, caches and refreshes them independently.
function KaktusPage() {
  const { region, zone } = useScope()
  const kaktuses = useListZoneKaktuses(zone ?? '', { query: { enabled: !!zone } })
  const pools = useListRegionStoragePools(region ?? '', { query: { enabled: !!region } })
  const nfs = useListRegionStorageNFSs(region ?? '', undefined, { query: { enabled: !!region } })
  const vnets = useListRegionVNets(region ?? '', { query: { enabled: !!region } })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>Kaktus Hypervisors</PageTitle>
      <Tabs defaultValue="hosts" className="min-w-0">
        {/* scrolls sideways on narrow screens instead of wrapping */}
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <TabsList className="w-max">
          <Tab value="hosts" icon={<Server />} label="Hosts" count={kaktuses.data?.length} />
          <Tab value="pools" icon={<HardDrive />} label="Block Storage" count={pools.data?.length} />
          <Tab value="nfs" icon={<HardDrive />} label="NFS Storage" count={nfs.data?.length} />
          <Tab value="vnets" icon={<Network />} label="Virtual Networks" count={vnets.data?.length} />
        </TabsList>
        </div>
        <TabsContent value="hosts">
          <Grid ids={kaktuses.data} loading={kaktuses.isPending && !!zone} render={(id) => <KaktusCard id={id} />} />
        </TabsContent>
        <TabsContent value="pools">
          <Grid ids={pools.data} loading={pools.isPending && !!region} render={(id) => <PoolCard id={id} />} />
        </TabsContent>
        <TabsContent value="nfs">
          <Grid ids={nfs.data} loading={nfs.isPending && !!region} render={(id) => <NfsCard id={id} />} />
        </TabsContent>
        <TabsContent value="vnets">
          <Grid ids={vnets.data} loading={vnets.isPending && !!region} render={(id) => <VNetCard id={id} />} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Hosts

function KaktusCard({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const { data: k } = useReadKaktus(id)
  const { data: caps } = useReadKaktusCaps(id)
  const { data: instances } = useListKaktusInstances(id)

  // after toggling maintenance, refetch this kaktus so the badge updates
  const refresh = { mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getReadKaktusQueryKey(id) }) } }
  const enable = useEnableKaktusMaintenance(refresh)
  const disable = useDisableKaktusMaintenance(refresh)
  const busy = enable.isPending || disable.isPending

  if (!k) return <Skeleton className="h-48" />
  const cpu = caps?.cpu

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 break-all">
          {k.name}
          {k.maintenance && <Badge variant="outline">Maintenance</Badge>}
        </CardTitle>
        <CardDescription className="break-all">{k.description}</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => (k.maintenance ? disable : enable).mutate({ kaktusId: id })}
          >
            <Wrench />
            {k.maintenance ? 'End maintenance' : 'Maintenance'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl>
          <Field label="CPU">
            {cpu ? (
              <span className="break-all">
                <Cpu className="mr-1 inline size-3.5 align-[-2px]" />
                {cpu.vendor} {cpu.model} ({cpu.arch}), {cpu.cores}c/{cpu.threads}t
              </span>
            ) : '—'}
          </Field>
          <Field label="Memory">{humanSize(caps?.memory)}</Field>
          <Field label="Instances">{instances?.length ?? '—'}</Field>
          <Field label="Overcommit (CPU / RAM)">
            {k.overcommit_cpu_ratio ?? '—'}× / {k.overcommit_memory_ratio ?? '—'}×
          </Field>
          <Field label="Monthly cost">
            {k.cpu_cost && k.memory_cost ? money(k.cpu_cost.price + k.memory_cost.price, k.cpu_cost.currency) : '—'}
          </Field>
        </dl>
      </CardContent>
    </Card>
  )
}

// Block storage

function PoolCard({ id }: { id: string }) {
  const { data: p } = useReadStoragePool(id)
  const { data: volumes } = useListStoragePoolVolumes(id)
  const { data: templates } = useListStoragePoolTemplates(id)

  if (!p) return <Skeleton className="h-48" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-all">{p.name}</CardTitle>
        <CardDescription>{p.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <dl>
          <Field label="Ceph pool">{p.pool}</Field>
          <Field label="Volumes">{volumes?.length ?? '—'}</Field>
          <Field label="Monthly cost">{money(p.cost?.price, p.cost?.currency)}</Field>
        </dl>
        {!!templates?.length && (
          <div className="flex flex-wrap gap-1">
            {templates.map((tid) => <TemplateBadge key={tid} id={tid} />)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TemplateBadge({ id }: { id: string }) {
  const { data: t } = useReadTemplate(id)
  if (!t) return null
  return (
    <Badge variant="secondary" title={t.description}>
      {t.name}
      {t.os && <span className="uppercase opacity-60">{t.os}</span>}
    </Badge>
  )
}

// NFS storage

function NfsCard({ id }: { id: string }) {
  const { data: n } = useReadStorageNFS(id)
  const { data: kylos } = useListStorageNFSKylos(id)

  if (!n) return <Skeleton className="h-48" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-all">{n.name}</CardTitle>
        <CardDescription>{n.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl>
          <Field label="Endpoint">{n.endpoint}</Field>
          <Field label="Filesystem">{n.fs ?? '—'}</Field>
          <Field label="Volumes">{kylos?.length ?? '—'}</Field>
          <Field label="Ganesha backends">
            {n.backends?.map((b) => <div key={b} className="font-mono text-xs">{b}:{n.port}</div>) ?? '—'}
          </Field>
        </dl>
      </CardContent>
    </Card>
  )
}

// Virtual networks

function VNetCard({ id }: { id: string }) {
  const { data: v } = useReadVNet(id)
  const { data: subnets } = useListVNetSubnets(id)

  if (!v) return <Skeleton className="h-48" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 break-all">
          {v.name}
          <Badge variant={v.private ? 'secondary' : 'default'}>{v.private ? 'Private' : 'Public'}</Badge>
        </CardTitle>
        <CardDescription>{v.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <dl>
          <Field label="VLAN">{v.vlan || 0}</Field>
          <Field label="Interface">{v.interface}</Field>
        </dl>
        {subnets?.map((sid) => <SubnetRow key={sid} id={sid} />)}
      </CardContent>
    </Card>
  )
}

function SubnetRow({ id }: { id: string }) {
  const { data: s } = useReadSubnet(id)
  const { data: adapterIds } = useListSubnetAdapters(id)
  // one request per adapter: fetched in parallel, and only the total is kept
  const allocated = useQueries({
    queries: (adapterIds ?? []).map((aid) => getReadAdapterQueryOptions(aid)),
    combine: (results) => results.reduce((n, r) => n + (r.data?.addresses?.length ?? 0), 0),
  })

  if (!s) return <Skeleton className="h-16" />
  const size = subnetSize(s.cidr)
  const pct = size ? Math.min(100, Math.round((allocated / size) * 100)) : 0

  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex justify-between font-mono">
        <span className="break-all">{s.cidr}</span>
        <span className="text-muted-foreground">gw {s.gateway}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {allocated} / {size ?? '?'} IPs allocated · DNS {s.dns ?? s.gateway}
        {!!s.extra_routes?.length && ` · routes ${s.extra_routes.join(', ')}`}
      </div>
    </div>
  )
}

function subnetSize(cidr: string): number | undefined {
  try {
    return new Netmask(cidr).size
  } catch {
    return undefined
  }
}
