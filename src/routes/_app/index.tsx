import { createFileRoute } from '@tanstack/react-router'
import type { UseQueryResult } from '@tanstack/react-query'
import { Copy, Database, Globe, HardDrive, Layers, MapPin, Server, AtSign, Wallet, type LucideIcon } from 'lucide-react'
import {
  useListProjectDnsRecords,
  useListProjectRegionKylos,
  useListProjectRegionVolumes,
  useListProjectZoneInstances,
  useReadProject,
  useReadProjectCost,
} from '@/api/generated/endpoints/project/project'
import {
  useListRegionStorageNFSs,
  useListRegionStoragePools,
  useListRegions,
  useReadRegion,
} from '@/api/generated/endpoints/region/region'
import { useListZoneKaktuses, useListZones, useReadZone } from '@/api/generated/endpoints/zone/zone'
import { PageTitle } from '@/components/resource'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { money } from '@/lib/format'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})

// Counts of everything visible in the current project / region / zone.
function Dashboard() {
  const { project, region, zone } = useScope()
  const p = project ?? ''
  const r = region ?? ''
  const z = zone ?? ''

  const regionName = useReadRegion(r, { query: { enabled: !!region } }).data?.name
  const zoneName = useReadZone(z, { query: { enabled: !!zone } }).data?.name
  const projectName = useReadProject(p, { query: { enabled: !!project } }).data?.name

  const regions = useListRegions()
  const zones = useListZones()
  const kaktuses = useListZoneKaktuses(z, { query: { enabled: !!zone } })
  const pools = useListRegionStoragePools(r, { query: { enabled: !!region } })
  const nfs = useListRegionStorageNFSs(r, undefined, { query: { enabled: !!region } })

  const records = useListProjectDnsRecords(p, { query: { enabled: !!project } })
  const instances = useListProjectZoneInstances(p, z, { query: { enabled: !!project && !!zone } })
  const volumes = useListProjectRegionVolumes(p, r, { query: { enabled: !!project && !!region } })
  const kylos = useListProjectRegionKylos(p, r, undefined, { query: { enabled: !!project && !!region } })
  const cost = useReadProjectCost(p, { query: { enabled: !!project } })

  return (
    <div className="grid min-w-0 gap-6">
      <PageTitle>Dashboard</PageTitle>

      <Section title="Platform">
        <Stat icon={Globe} label="Regions" query={regions} />
        <Stat icon={MapPin} label="Zones" query={zones} />
      </Section>

      <Section title="Infrastructure" scope={[regionName, zoneName]}>
        <Stat icon={Server} label="Kaktus hypervisors" hint={zoneName} query={kaktuses} />
        <Stat icon={HardDrive} label="Block storage pools" hint={regionName} query={pools} />
        <Stat icon={Layers} label="NFS storage pools" hint={regionName} query={nfs} />
      </Section>

      <Section title={projectName ? `Project ${projectName}` : 'Project'}>
        <Stat icon={AtSign} label="DNS records" query={records} />
        <Stat icon={Copy} label="Kompute instances" hint={zoneName} query={instances} />
        <Stat icon={HardDrive} label="Block storage volumes" hint={regionName} query={volumes} />
        <Stat icon={Database} label="Kylo elastic volumes" hint={regionName} query={kylos} />
        <Card className="sm:col-span-2 xl:col-span-4">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Wallet className="size-4" /> Estimated monthly cost
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums break-all">
              {cost.isPending && !!project ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                money(cost.data?.price, cost.data?.currency)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </Section>
    </div>
  )
}

function Section({ title, scope, children }: { title: string; scope?: (string | undefined)[]; children: React.ReactNode }) {
  const where = scope?.filter(Boolean).join(' · ')
  return (
    <section className="grid gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        {title}
        {where && <span className="font-normal"> — {where}</span>}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  )
}

function Stat({
  icon: Icon,
  label,
  hint,
  query,
}: {
  icon: LucideIcon
  label: string
  hint?: string
  query: Pick<UseQueryResult<string[]>, 'data' | 'isLoading' | 'isError'>
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        {query.isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <span className="text-3xl font-semibold tabular-nums">{query.isError ? '—' : (query.data?.length ?? '—')}</span>
        )}
        {hint && <span className="truncate text-xs text-muted-foreground">in {hint}</span>}
      </CardContent>
    </Card>
  )
}
