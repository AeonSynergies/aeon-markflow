import type { ComponentType } from 'react'
import { Handle, Position } from '@xyflow/react'
import { CalendarClock, Mail, MessageSquareText, Phone, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { describeStep, isStepComplete } from '../lib/steps'
import { STEP_KIND_LABELS, type StepKind, type WorkflowStepInput } from '../types'

const STEP_ICONS: Record<StepKind, ComponentType<{ className?: string }>> = {
  email: Mail,
  call_task: Phone,
  sms: MessageSquareText,
  wait: CalendarClock,
}

export interface StepNodeData {
  step: WorkflowStepInput
  index: number
  isSelected: boolean
  emailVersionLabel?: (versionId: string) => string | undefined
  onSelect: () => void
  onDelete: () => void
  [key: string]: unknown
}

export function StepNode({ data }: { data: StepNodeData }) {
  const { step, isSelected, emailVersionLabel, onSelect, onDelete } = data
  const Icon = STEP_ICONS[step.kind]
  const complete = isStepComplete(step)

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-border !border-none" />
      <Card
        onClick={onSelect}
        className={cn(
          'w-70 cursor-pointer gap-2 border-2 py-3 transition-colors',
          isSelected ? 'border-primary' : 'border-border hover:border-muted-foreground/40',
        )}
      >
        <CardHeader className="px-3">
          <CardTitle className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <Icon className="text-muted-foreground size-4" />
              {STEP_KIND_LABELS[step.kind]}
            </span>
            <span className="flex items-center gap-1">
              {!complete && (
                <Badge variant="destructive" className="text-[10px]">
                  Incomplete
                </Badge>
              )}
              <button
                type="button"
                aria-label={`Delete ${STEP_KIND_LABELS[step.kind]} step`}
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete()
                }}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm p-0.5"
              >
                <X className="size-3.5" />
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground px-3 text-xs">
          <p className="line-clamp-2">{describeStep(step, emailVersionLabel)}</p>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-border !border-none" />
    </>
  )
}
