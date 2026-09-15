import type { components } from '@/api/schema/markflow-backend'

/**
 * Local aliases onto the backend's generated OpenAPI component schemas — never redeclare these
 * shapes by hand, always alias the generated type so a backend contract change surfaces here as
 * a type error instead of silent drift.
 */
export type WorkflowStepInput = components['schemas']['WorkflowStepInput']
export type WorkflowStepResponse = components['schemas']['WorkflowStepResponse']
export type WorkflowTemplateResponse = components['schemas']['WorkflowTemplateResponse']
export type CreateWorkflowTemplateRequest = components['schemas']['CreateWorkflowTemplateRequest']
export type UpdateWorkflowTemplateRequest = components['schemas']['UpdateWorkflowTemplateRequest']
export type EmailTemplateResponse = components['schemas']['EmailTemplateResponse']
export type EmailTemplateVersionResponse = components['schemas']['EmailTemplateVersionResponse']

export type StepKind = WorkflowStepInput['kind']

export const STEP_KINDS: StepKind[] = ['email', 'call_task', 'sms', 'wait']

export const WAIT_UNITS: NonNullable<WorkflowStepInput['wait_unit']>[] = ['minutes', 'hours', 'days']

export const STEP_KIND_LABELS: Record<StepKind, string> = {
  email: 'Email',
  call_task: 'Call task',
  sms: 'SMS',
  wait: 'Wait',
}

export const STEP_KIND_DESCRIPTIONS: Record<StepKind, string> = {
  email: 'Send an email from an approved template version',
  call_task: 'Log a task for a human to place a call',
  sms: 'Send a text message',
  wait: 'Delay before the next step',
}
