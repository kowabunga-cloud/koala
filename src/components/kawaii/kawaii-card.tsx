import { ArrowRight, Lock } from 'lucide-react'
import { useListKawaiiIpSecs, useReadKawaii, useReadKawaiiIpSec } from '@/api/generated/endpoints/kawaii/kawaii'
import { useReadSubnet } from '@/api/generated/endpoints/subnet/subnet'
import type { KawaiiDNatRule } from '@/api/generated/model'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KawaiiCard({ id }: { id: string }) {
  const { data: k } = useReadKawaii(id)
  const { data: ipsecs } = useListKawaiiIpSecs(id)

  if (!k) return <Skeleton className="h-48" />
  const zones = k.netip?.zones ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-all">{k.name ?? 'Kawaii gateway'}</CardTitle>
        {k.description && <CardDescription className="break-all">{k.description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">
        {zones.length > 0 && (
          <Section title="Virtual IPs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-1 font-normal">Zone</th>
                    <th className="pb-1 font-normal">Private</th>
                    <th className="pb-1 font-normal">Public</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {zones.map((z) => (
                    <tr key={z.zone} className="border-t">
                      <td className="py-1 pr-2 font-sans font-medium break-all">{z.zone}</td>
                      <td className="py-1 pr-2 break-all">{z.private}</td>
                      <td className="py-1 break-all">{z.public}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {!!k.dnat?.length && (
          <Section title="NAT forwarding">
            <ul className="grid gap-1 text-sm">
              {k.dnat.map((n, i) => <DNatRow key={i} rule={n} />)}
            </ul>
          </Section>
        )}

        {!!k.vpc_peerings?.length && (
          <Section title="VPC peerings">
            <div className="flex flex-wrap gap-1">
              {k.vpc_peerings.map((p) => <PeeringBadge key={p.subnet} subnetId={p.subnet} policy={p.policy} />)}
            </div>
          </Section>
        )}

        {!!ipsecs?.length && (
          <Section title="IPsec connections">
            <div className="grid gap-2">
              {ipsecs.map((iid) => <IpSecRow key={iid} kawaiiId={id} id={iid} />)}
            </div>
          </Section>
        )}
      </CardContent>
    </Card>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}

function DNatRow({ rule }: { rule: KawaiiDNatRule }) {
  return (
    <li className="flex flex-wrap items-center gap-1.5">
      <Badge variant="outline" className="uppercase">{rule.protocol ?? 'tcp'}</Badge>
      <span className="font-mono text-xs break-all">{rule.ports}</span>
      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="font-mono text-xs break-all">{rule.destination}</span>
    </li>
  )
}

function PeeringBadge({ subnetId, policy }: { subnetId: string; policy?: string }) {
  const { data: subnet } = useReadSubnet(subnetId)
  return (
    <Badge variant="secondary" className="max-w-full font-mono" title={subnet?.name}>
      <span className="truncate">{subnet?.cidr ?? subnetId}</span>
      {policy && <span className="font-sans opacity-60">{policy}</span>}
    </Badge>
  )
}

function IpSecRow({ kawaiiId, id }: { kawaiiId: string; id: string }) {
  const { data: c } = useReadKawaiiIpSec(kawaiiId, id)
  if (!c) return <Skeleton className="h-16" />
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center gap-1.5 font-medium">
        <Lock className="size-3.5 shrink-0" />
        <span className="break-all">{c.name}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 font-mono text-xs">
        <span className="break-all">{c.ip ?? '—'}</span>
        <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
        <span className="break-all">{c.remote_ip}</span>
        <span className="text-muted-foreground">({c.remote_subnet})</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Phase 1 {c.phase1_encryption_algorithm}/{c.phase1_integrity_algorithm} · Phase 2{' '}
        {c.phase2_encryption_algorithm}/{c.phase2_integrity_algorithm}
      </div>
    </div>
  )
}
