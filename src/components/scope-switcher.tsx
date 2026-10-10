import { useEffect } from 'react'
import { useListProjects, useReadProject } from '@/api/generated/endpoints/project/project'
import { useListRegionZones, useListRegions, useReadRegion } from '@/api/generated/endpoints/region/region'
import { useReadZone } from '@/api/generated/endpoints/zone/zone'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setScope, useScope, type Scope } from '@/lib/scope'

// Header selectors for the current project, region and zone.
export function ScopeSwitcher() {
  const scope = useScope()
  const projects = useListProjects()
  const regions = useListRegions()
  const zones = useListRegionZones(scope.region ?? '', { query: { enabled: !!scope.region } })

  useDefault('project', scope.project, projects.data)
  useDefault('region', scope.region, regions.data)
  useDefault('zone', scope.zone, zones.data)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Picker label="Project" value={scope.project} ids={projects.data} onChange={(project) => setScope({ project })}>
        {(id) => <ProjectName id={id} />}
      </Picker>
      <Picker label="Region" value={scope.region} ids={regions.data} onChange={(region) => setScope({ region })}>
        {(id) => <RegionName id={id} />}
      </Picker>
      <Picker label="Zone" value={scope.zone} ids={zones.data} onChange={(zone) => setScope({ zone })}>
        {(id) => <ZoneName id={id} />}
      </Picker>
    </div>
  )
}

// Select the first available entry when nothing (or something stale) is selected.
function useDefault(key: keyof Scope, value: string | undefined, ids: string[] | undefined) {
  useEffect(() => {
    if (ids && ids.length > 0 && (!value || !ids.includes(value))) setScope({ [key]: ids[0] })
  }, [key, value, ids])
}

function Picker(props: {
  label: string
  value?: string
  ids?: string[]
  onChange: (id: string) => void
  children: (id: string) => React.ReactNode
}) {
  return (
    <Select value={props.value ?? ''} onValueChange={props.onChange} disabled={!props.ids?.length}>
      <SelectTrigger size="sm" className="min-w-32" aria-label={props.label}>
        <SelectValue placeholder={props.label} />
      </SelectTrigger>
      <SelectContent>
        {props.ids?.map((id) => (
          <SelectItem key={id} value={id}>
            {props.children(id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ProjectName({ id }: { id: string }) {
  return <>{useReadProject(id).data?.name ?? id}</>
}
function RegionName({ id }: { id: string }) {
  return <>{useReadRegion(id).data?.name ?? id}</>
}
function ZoneName({ id }: { id: string }) {
  return <>{useReadZone(id).data?.name ?? id}</>
}
