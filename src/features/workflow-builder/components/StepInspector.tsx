import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApprovedEmailVersions } from '../hooks/useApprovedEmailVersions'
import { STEP_KIND_LABELS, WAIT_UNITS, type WorkflowStepInput } from '../types'

interface StepInspectorProps {
  step: WorkflowStepInput
  index: number
  onChange: (step: WorkflowStepInput) => void
  onDelete: () => void
  onClose: () => void
}

export function StepInspector({ step, index, onChange, onDelete, onClose }: StepInspectorProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 border-l p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Step {index + 1}</p>
          <h2 className="text-sm font-semibold">{STEP_KIND_LABELS[step.kind]}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {step.kind === 'email' && (
        <EmailStepFields step={step} onChange={onChange} />
      )}
      {step.kind === 'call_task' && <CallTaskStepFields step={step} onChange={onChange} />}
      {step.kind === 'sms' && <SmsStepFields step={step} onChange={onChange} />}
      {step.kind === 'wait' && <WaitStepFields step={step} onChange={onChange} />}

      <Button variant="destructive" size="sm" onClick={onDelete} className="mt-auto">
        Delete step
      </Button>
    </aside>
  )
}

function EmailStepFields({
  step,
  onChange,
}: {
  step: WorkflowStepInput
  onChange: (step: WorkflowStepInput) => void
}) {
  const { options, isLoading, isError, labelForVersionId } = useApprovedEmailVersions()
  const groups = new Map<string, typeof options>()
  for (const option of options) {
    const key = option.template._id ?? option.template.name ?? 'template'
    groups.set(key, [...(groups.get(key) ?? []), option])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Approved template version</Label>
        <Select
          value={step.email_template_version_id ?? ''}
          onValueChange={(value) => onChange({ ...step, email_template_version_id: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={isLoading ? 'Loading approved versions…' : 'Select a version'}
            />
          </SelectTrigger>
          <SelectContent>
            {[...groups.entries()].map(([templateId, templateOptions]) => (
              <SelectGroup key={templateId}>
                <SelectLabel>{templateOptions[0]?.template.name}</SelectLabel>
                {templateOptions.map((option) => (
                  <SelectItem key={option.version._id} value={option.version._id ?? ''}>
                    v{option.version.version_number} — {option.version.subject_line}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        {isError && (
          <p className="text-destructive text-xs">Couldn't load approved template versions.</p>
        )}
        {!isLoading && options.length === 0 && !isError && (
          <p className="text-muted-foreground text-xs">
            No APPROVED template versions yet — approve one in the template review flow first.
          </p>
        )}
        {step.email_template_version_id && (
          <Badge variant="success" className="w-fit">
            Pinned to {labelForVersionId(step.email_template_version_id) ?? 'this version'}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sending-domain">Sending domain</Label>
        <Input
          id="sending-domain"
          placeholder="sales@aeonsynergies.com"
          value={step.sending_domain ?? ''}
          onChange={(event) => onChange({ ...step, sending_domain: event.target.value })}
        />
      </div>
    </div>
  )
}

function CallTaskStepFields({
  step,
  onChange,
}: {
  step: WorkflowStepInput
  onChange: (step: WorkflowStepInput) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="call-task-instructions">Instructions for the caller</Label>
      <textarea
        id="call-task-instructions"
        rows={6}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        value={step.call_task_instructions ?? ''}
        onChange={(event) => onChange({ ...step, call_task_instructions: event.target.value })}
      />
    </div>
  )
}

function SmsStepFields({
  step,
  onChange,
}: {
  step: WorkflowStepInput
  onChange: (step: WorkflowStepInput) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="sms-body">Message</Label>
      <textarea
        id="sms-body"
        rows={4}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        value={step.sms_body ?? ''}
        onChange={(event) => onChange({ ...step, sms_body: event.target.value })}
      />
    </div>
  )
}

function WaitStepFields({
  step,
  onChange,
}: {
  step: WorkflowStepInput
  onChange: (step: WorkflowStepInput) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="wait-amount">Delay before the next step</Label>
      <div className="flex gap-2">
        <Input
          id="wait-amount"
          type="number"
          min={1}
          className="w-24"
          value={step.wait_amount ?? ''}
          onChange={(event) => onChange({ ...step, wait_amount: Number(event.target.value) })}
        />
        <Select
          value={step.wait_unit ?? 'days'}
          onValueChange={(value) => onChange({ ...step, wait_unit: value as (typeof WAIT_UNITS)[number] })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WAIT_UNITS.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
