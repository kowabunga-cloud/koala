import { createFileRoute } from '@tanstack/react-router'
import { useListProjectRegionKawaiis } from '@/api/generated/endpoints/project/project'
import { KawaiiCard } from '@/components/kawaii/kawaii-card'
import { Grid, PageTitle } from '@/components/resource'
import { useScope } from '@/lib/scope'

export const Route = createFileRoute('/_app/kawaii')({
  component: KawaiiPage,
})

// Kawaii internet gateways of the current project, in the current region.
function KawaiiPage() {
  const { project, region } = useScope()
  const enabled = !!project && !!region
  const kawaiis = useListProjectRegionKawaiis(project ?? '', region ?? '', { query: { enabled } })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>Kawaii Gateways</PageTitle>
      <Grid ids={kawaiis.data} loading={kawaiis.isPending && enabled} render={(id) => <KawaiiCard id={id} />} />
    </div>
  )
}
