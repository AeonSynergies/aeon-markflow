import type { ComponentType } from 'react'
import { CalendarClock, Mail, MessageSquareText, Phone } from 'lucide-react'

import { STEP_KIND_DESCRIPTIONS, STEP_KIND_LABELS, STEP_KINDS, type StepKind } from '../types'
import { STEP_KIND_DRAG_TYPE } from '../lib/dnd'

const STEP_ICONS: Record<StepKind, ComponentType<{ className?: string }>> = {
  email: Mail,
  call_task: Phone,
  sms: MessageSquareText,
  wait: CalendarClock,
}

export function StepPalette() {
  return (
    <aside className="w-64 shrink-0 border-r p-4">
      <h2 className="mb-1 text-sm font-semibold">Steps</h2>
      <p className="text-muted-foreground mb-4 text-xs">
        Drag a step onto the sequence, or click a + between steps.
      </p>
      <div className="flex flex-col gap-2">
        {STEP_KINDS.map((kind) => {
          const Icon = STEP_ICONS[kind]
          return (
            <div
              key={kind}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(STEP_KIND_DRAG_TYPE, kind)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              className="bg-card hover:border-primary/50 flex cursor-grab items-start gap-2 rounded-md border p-3 active:cursor-grabbing"
            >
              <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{STEP_KIND_LABELS[kind]}</p>
                <p className="text-muted-foreground text-xs">{STEP_KIND_DESCRIPTIONS[kind]}</p>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
