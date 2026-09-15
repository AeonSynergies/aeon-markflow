import { useQueries, useQuery } from '@tanstack/react-query'

import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import type { EmailTemplateResponse, EmailTemplateVersionResponse } from '../types'

export interface ApprovedVersionOption {
  template: EmailTemplateResponse
  version: EmailTemplateVersionResponse
}

/**
 * Every APPROVED EmailTemplateVersion across the org's EmailTemplates, grouped by template —
 * the full set a human may pin a workflow email step to. Never includes DRAFT/PENDING_APPROVAL/
 * REJECTED/RESUBMITTED versions: those aren't safe to pin (see CLAUDE.md's "never latest" rule —
 * only a version that has actually cleared review is a safe pin target).
 */
export function useApprovedEmailVersions() {
  const { session } = useAuth()
  const orgId = session?.orgId

  const templatesQuery = useQuery({
    queryKey: ['email-templates', orgId],
    queryFn: async () => {
      const { data, error } = await api.GET('/orgs/{orgId}/email-templates', {
        params: { path: { orgId: orgId! } },
      })
      if (error) throw error
      return data
    },
    enabled: Boolean(orgId),
  })

  const templates = templatesQuery.data ?? []

  const versionQueries = useQueries({
    queries: templates.map((template) => ({
      queryKey: ['email-template-versions', orgId, template._id, 'APPROVED'],
      queryFn: async () => {
        const { data, error } = await api.GET('/orgs/{orgId}/email-templates/{templateId}/versions', {
          params: {
            path: { orgId: orgId!, templateId: template._id! },
            query: { status: 'APPROVED' },
          },
        })
        if (error) throw error
        return data
      },
      enabled: Boolean(orgId && template._id),
    })),
  })

  const isLoading = templatesQuery.isLoading || versionQueries.some((q) => q.isLoading)
  const isError = templatesQuery.isError || versionQueries.some((q) => q.isError)

  const options: ApprovedVersionOption[] = templates.flatMap((template, index) => {
    const versions = versionQueries[index]?.data ?? []
    return versions.map((version) => ({ template, version }))
  })

  const labelForVersionId = (versionId: string): string | undefined => {
    const match = options.find((option) => option.version._id === versionId)
    if (!match) return undefined
    return `${match.template.name} — v${match.version.version_number} — ${match.version.subject_line}`
  }

  return { options, isLoading, isError, labelForVersionId }
}
