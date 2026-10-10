import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, ExternalLink, Monitor, Play, Power, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  getReadInstanceStateQueryKey,
  useReadInstanceRemoteConnection,
  useRebootInstance,
  useStartInstance,
  useStopInstance,
} from '@/api/generated/endpoints/instance/instance'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Action = 'reboot' | 'start' | 'stop' | 'remote'

const CONFIRM: Record<Exclude<Action, 'remote'>, { title: string; verb: string; done: string }> = {
  reboot: { title: 'Reboot instance', verb: 'Reboot', done: 'Reboot requested' },
  start: { title: 'Power on instance', verb: 'Power on', done: 'Power-on requested' },
  stop: { title: 'Power off instance', verb: 'Power off', done: 'Power-off requested' },
}

// Power actions (with confirmation) and remote console access for a single instance.
export function InstanceActions({ id, name, running }: { id: string; name: string; running: boolean }) {
  const [action, setAction] = useState<Action | null>(null)
  const queryClient = useQueryClient()

  const after = (done: string) => ({
    mutation: {
      onSuccess: () => {
        toast.success(`${done} for ${name}`)
        queryClient.invalidateQueries({ queryKey: getReadInstanceStateQueryKey(id) })
      },
    },
  })
  const reboot = useRebootInstance(after(CONFIRM.reboot.done))
  const start = useStartInstance(after(CONFIRM.start.done))
  const stop = useStopInstance(after(CONFIRM.stop.done))
  const mutations = { reboot, start, stop }
  const busy = reboot.isPending || start.isPending || stop.isPending

  return (
    <div className="flex gap-1">
      <IconButton label="Reboot" disabled={busy} onClick={() => setAction('reboot')}>
        <RotateCw />
      </IconButton>
      {running ? (
        <IconButton label="Power off" disabled={busy} onClick={() => setAction('stop')}>
          <Power />
        </IconButton>
      ) : (
        <IconButton label="Power on" disabled={busy} onClick={() => setAction('start')}>
          <Play />
        </IconButton>
      )}
      <IconButton label="Remote access" onClick={() => setAction('remote')}>
        <Monitor />
      </IconButton>

      <AlertDialog open={action !== null && action !== 'remote'} onOpenChange={(open) => !open && setAction(null)}>
        {action && action !== 'remote' && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{CONFIRM[action].title}</AlertDialogTitle>
              <AlertDialogDescription className="break-all">
                Do you really want to {CONFIRM[action].verb.toLowerCase()} <strong>{name}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => mutations[action].mutate({ instanceId: id })}>
                {CONFIRM[action].verb}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>

      <RemoteAccessDialog id={id} name={name} open={action === 'remote'} onClose={() => setAction(null)} />
    </div>
  )
}

function IconButton(props: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={props.label} disabled={props.disabled} onClick={props.onClick}>
          {props.children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{props.label}</TooltipContent>
    </Tooltip>
  )
}

function RemoteAccessDialog({ id, name, open, onClose }: { id: string; name: string; open: boolean; onClose: () => void }) {
  // only fetched once the dialog is opened
  const { data, isPending, error } = useReadInstanceRemoteConnection(id, { query: { enabled: open } })
  const url = data?.url

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remote access</AlertDialogTitle>
          <AlertDialogDescription className="break-all">
            SPICE console for <strong>{name}</strong>. Open it with a SPICE client such as remote-viewer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md border bg-muted/50 p-2 font-mono text-xs break-all">
          {isPending ? 'Loading…' : error ? error.message : url}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button
            variant="outline"
            disabled={!url}
            onClick={() => url && navigator.clipboard.writeText(url).then(() => toast.success('URL copied'))}
          >
            <Copy /> Copy
          </Button>
          <Button asChild disabled={!url}>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink /> Open
            </a>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
