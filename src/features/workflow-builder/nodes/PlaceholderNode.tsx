import * as React from 'react'
import { Handle, Position } from '@xyflow/react'
import { CalendarClock, Mail, MessageSquareText, Phone, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { STEP_KIND_LABELS, STEP_KINDS, type StepKind } from '../types'
import { STEP_KIND_DRAG_TYPE } from '../lib/dnd'

const STEP_ICONS: Record<StepKind, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  call_task: Phone,
  sms: MessageSquareText,
  wait: CalendarClock,
}

export interface PlaceholderNodeData {
  index: number
  onInsert: (kind: StepKind, index: number) => void
  [key: string]: unknown
}

export function PlaceholderNode({ data }: { data: PlaceholderNodeData }) {
  const [open, setOpen] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)

  return (
    <div className="flex w-70 flex-col items-center">
      <Handle type="target" position={Position.Top} className="!invisible" />
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes(STEP_KIND_DRAG_TYPE)) {
              event.preventDefault()
              setIsDragOver(true)
            }
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(event) => {
            const kind = event.dataTransfer.getData(STEP_KIND_DRAG_TYPE) as StepKind | ''
            setIsDragOver(false)
            if (kind) {
              event.preventDefault()
              data.onInsert(kind, data.index)
            }
          }}
          className={cn(
            'text-muted-foreground hover:border-primary hover:text-primary flex size-7 items-center justify-center rounded-full border-2 border-dashed transition-colors',
            isDragOver && 'border-primary text-primary bg-primary/10 scale-110',
          )}
          aria-label="Insert a step here"
        >
          <Plus className="size-4" />
        </button>
      ) : (
        <div className="bg-popover flex items-center gap-1 rounded-md border p-1 shadow-sm">
          {STEP_KINDS.map((kind) => {
            const Icon = STEP_ICONS[kind]
            return (
              <button
                key={kind}
                type="button"
                title={STEP_KIND_LABELS[kind]}
                onClick={() => {
                  data.onInsert(kind, data.index)
                  setOpen(false)
                }}
                className="hover:bg-accent hover:text-accent-foreground text-muted-foreground flex size-8 items-center justify-center rounded"
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!invisible" />
    </div>
  )
}
