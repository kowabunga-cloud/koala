import { useQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { useListProjectDnsRecords } from '@/api/generated/endpoints/project/project'
import { getReadDnsRecordQueryOptions } from '@/api/generated/endpoints/record/record'
import type { DnsRecord } from '@/api/generated/model'
import { PageTitle } from '@/components/resource'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/records')({
  component: RecordsPage,
})

const fqdn = (r: DnsRecord) => (r.domain ? `${r.name}.${r.domain}` : r.name)

// Kiwi DNS records of the current project.
function RecordsPage() {
  const { project } = useScope()
  const ids = useListProjectDnsRecords(project ?? '', { query: { enabled: !!project } })
  // one request per record, in parallel; rows appear as they arrive
  const records = useQueries({
    queries: (ids.data ?? []).map((id) => getReadDnsRecordQueryOptions(id)),
    combine: (results) => ({
      data: results.flatMap((r) => (r.data ? [r.data] : [])),
      pending: results.some((r) => r.isPending),
    }),
  })

  const [filter, setFilter] = useState('')
  const [desc, setDesc] = useState(false)

  const needle = filter.trim().toLowerCase()
  const rows = records.data
    .filter((r) => !needle || [fqdn(r), r.description ?? '', ...(r.addresses ?? [])].some((v) => v.toLowerCase().includes(needle)))
    .sort((a, b) => fqdn(a).localeCompare(fqdn(b)) * (desc ? -1 : 1))

  const loading = (ids.isPending && !!project) || (records.pending && records.data.length === 0)

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle
        actions={
          <Input
            placeholder="Filter records…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64"
          />
        }
      >
        Kiwi DNS Records
      </PageTitle>
      <Card className="py-0">
        <CardContent className="px-0">
          {loading ? (
            <div className="grid gap-2 p-4">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">
                    <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setDesc(!desc)}>
                      Record {desc ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                  </TableHead>
                  <TableHead>Addresses</TableHead>
                  <TableHead className="pr-4">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((r) => (
                    <TableRow key={r.id ?? fqdn(r)}>
                      <TableCell className="pl-4 align-top font-mono whitespace-normal break-all">{fqdn(r)}</TableCell>
                      <TableCell className="align-top">
                        <div className="grid gap-0.5 font-mono text-xs">
                          {(r.addresses ?? []).map((a) => <span key={a}>{a}</span>)}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-48 pr-4 align-top whitespace-normal text-muted-foreground">
                        {r.description}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      {filter ? 'No matching records.' : 'Nothing here yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
