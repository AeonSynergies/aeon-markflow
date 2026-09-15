import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import type { CreateWorkflowTemplateRequest, UpdateWorkflowTemplateRequest } from '../types'

function useOrgId(): string {
  const { session } = useAuth()
  if (!session) throw new Error('useOrgId called without an active session')
  return session.orgId
}

export function useWorkflowTemplatesQuery() {
  const orgId = useOrgId()
  return useQuery({
    queryKey: ['workflow-templates', orgId],
    queryFn: async () => {
      const { data, error } = await api.GET('/orgs/{orgId}/workflow-templates', {
        params: { path: { orgId } },
      })
      if (error) throw error
      return data
    },
  })
}

export function useWorkflowTemplateQuery(templateId: string | undefined) {
  const orgId = useOrgId()
  return useQuery({
    queryKey: ['workflow-template', orgId, templateId],
    queryFn: async () => {
      const { data, error } = await api.GET('/orgs/{orgId}/workflow-templates/{templateId}', {
        params: { path: { orgId, templateId: templateId! } },
      })
      if (error) throw error
      return data
    },
    enabled: Boolean(templateId),
  })
}

export function useCreateWorkflowTemplateMutation() {
  const orgId = useOrgId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateWorkflowTemplateRequest) => {
      const { data, error } = await api.POST('/orgs/{orgId}/workflow-templates', {
        params: { path: { orgId } },
        body,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workflow-templates', orgId] })
    },
  })
}

export function useUpdateWorkflowTemplateMutation(templateId: string) {
  const orgId = useOrgId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateWorkflowTemplateRequest) => {
      const { data, error } = await api.PATCH('/orgs/{orgId}/workflow-templates/{templateId}', {
        params: { path: { orgId, templateId } },
        body,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workflow-templates', orgId] })
      void queryClient.invalidateQueries({ queryKey: ['workflow-template', orgId, templateId] })
    },
  })
}
