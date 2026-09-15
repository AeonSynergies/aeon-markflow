import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepInspector } from './components/StepInspector'
import { StepPalette } from './components/StepPalette'
import { WorkflowCanvas } from './components/WorkflowCanvas'
import {
  useCreateWorkflowTemplateMutation,
  useUpdateWorkflowTemplateMutation,
  useWorkflowTemplateQuery,
} from './hooks/useWorkflowTemplates'
import { createDefaultStep, isStepComplete } from './lib/steps'
import type { StepKind, WorkflowStepInput, WorkflowTemplateResponse } from './types'

/** Loads the template (if editing) before the form mounts, so the form's state only ever needs
 * to be seeded once — no effect-driven sync required. */
export function WorkflowBuilderPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const isNew = !templateId || templateId === 'new'
  const templateQuery = useWorkflowTemplateQuery(isNew ? undefined : templateId)

  if (isNew) {
    return <WorkflowBuilderForm key="new" isNew templateId={undefined} initialTemplate={undefined} />
  }

  if (templateQuery.isLoading) {
    return <p className="text-muted-foreground p-6 text-sm">Loading workflow…</p>
  }

  if (templateQuery.isError || !templateQuery.data) {
    return <p className="text-destructive p-6 text-sm">Couldn't load this workflow.</p>
  }

  return (
    <WorkflowBuilderForm
      key={templateId}
      isNew={false}
      templateId={templateId}
      initialTemplate={templateQuery.data}
    />
  )
}

interface WorkflowBuilderFormProps {
  isNew: boolean
  templateId: string | undefined
  initialTemplate: WorkflowTemplateResponse | undefined
}

function WorkflowBuilderForm({ isNew, templateId, initialTemplate }: WorkflowBuilderFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateWorkflowTemplateMutation()
  const updateMutation = useUpdateWorkflowTemplateMutation(templateId ?? '')

  const [name, setName] = React.useState(initialTemplate?.name ?? '')
  const [requiresWarmup, setRequiresWarmup] = React.useState(initialTemplate?.requires_warmup ?? false)
  const [steps, setSteps] = React.useState<WorkflowStepInput[]>(initialTemplate?.steps ?? [])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const handleInsert = React.useCallback((kind: StepKind, index: number) => {
    setSteps((current) => {
      const next = [...current]
      next.splice(index, 0, createDefaultStep(kind))
      return next
    })
    setSelectedIndex(index)
  }, [])

  const handleDelete = React.useCallback((index: number) => {
    setSteps((current) => current.filter((_, i) => i !== index))
    setSelectedIndex((current) => (current === index ? null : current))
  }, [])

  const handleStepChange = React.useCallback((index: number, step: WorkflowStepInput) => {
    setSteps((current) => current.map((existing, i) => (i === index ? step : existing)))
  }, [])

  const allStepsComplete = steps.length > 0 && steps.every(isStepComplete)
  const isSaving = createMutation.isPending || updateMutation.isPending
  const canSave = name.trim().length > 0 && allStepsComplete && !isSaving

  async function handleSave() {
    if (!canSave) return
    const body = { name: name.trim(), requires_warmup: requiresWarmup, steps }
    if (isNew) {
      const created = await createMutation.mutateAsync(body)
      if (created?._id) navigate(`/workflows/${created._id}`, { replace: true })
    } else {
      await updateMutation.mutateAsync(body)
    }
  }

  const selectedStep = selectedIndex !== null ? steps[selectedIndex] : null

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="workflow-name" className="sr-only">
            Workflow name
          </Label>
          <Input
            id="workflow-name"
            placeholder="Untitled workflow"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-64"
          />
          <label className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={requiresWarmup}
              onChange={(event) => setRequiresWarmup(event.target.checked)}
            />
            Requires domain warmup
          </label>
        </div>
        <div className="flex items-center gap-2">
          {!allStepsComplete && steps.length > 0 && (
            <span className="text-muted-foreground text-xs">Finish every step to save</span>
          )}
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? 'Saving…' : isNew ? 'Create workflow' : 'Save changes'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <StepPalette />
        <div className="min-w-0 flex-1">
          <WorkflowCanvas
            steps={steps}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onInsert={handleInsert}
            onDelete={handleDelete}
          />
        </div>
        {selectedStep && selectedIndex !== null && (
          <StepInspector
            key={selectedIndex}
            step={selectedStep}
            index={selectedIndex}
            onChange={(step) => handleStepChange(selectedIndex, step)}
            onDelete={() => handleDelete(selectedIndex)}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </div>
    </div>
  )
}
