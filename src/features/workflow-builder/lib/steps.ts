import type { StepKind, WorkflowStepInput } from '../types'

/** A freshly-dragged-in step, before the human has filled in its kind-specific fields. */
export function createDefaultStep(kind: StepKind): WorkflowStepInput {
  switch (kind) {
    case 'email':
      return { kind, sending_domain: '', email_template_version_id: undefined }
    case 'call_task':
      return { kind, call_task_instructions: '' }
    case 'sms':
      return { kind, sms_body: '' }
    case 'wait':
      return { kind, wait_amount: 1, wait_unit: 'days' }
  }
}

/** One line describing a step's current configuration, for the node card and the step list. */
export function describeStep(
  step: WorkflowStepInput,
  emailVersionLabel?: (versionId: string) => string | undefined,
): string {
  switch (step.kind) {
    case 'email': {
      if (!step.email_template_version_id) return 'No template version selected'
      return emailVersionLabel?.(step.email_template_version_id) ?? 'Approved version selected'
    }
    case 'call_task':
      return step.call_task_instructions?.trim() || 'No instructions yet'
    case 'sms':
      return step.sms_body?.trim() || 'No message yet'
    case 'wait':
      return step.wait_amount ? `Wait ${step.wait_amount} ${step.wait_unit ?? 'days'}` : 'No delay set'
  }
}

/** A step is ready to save once its kind-specific required fields (per WorkflowStepInput) are filled in. */
export function isStepComplete(step: WorkflowStepInput): boolean {
  switch (step.kind) {
    case 'email':
      return Boolean(step.email_template_version_id && step.sending_domain?.trim())
    case 'call_task':
      return Boolean(step.call_task_instructions?.trim())
    case 'sms':
      return Boolean(step.sms_body?.trim())
    case 'wait':
      return Boolean(step.wait_amount && step.wait_amount > 0 && step.wait_unit)
  }
}
