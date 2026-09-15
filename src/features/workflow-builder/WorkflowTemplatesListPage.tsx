import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflowTemplatesQuery } from './hooks/useWorkflowTemplates'

export function WorkflowTemplatesListPage() {
  const templatesQuery = useWorkflowTemplatesQuery()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Workflows</h1>
          <p className="text-muted-foreground text-sm">Email / call / SMS / wait sequences</p>
        </div>
        <Button asChild>
          <Link to="/workflows/new">New workflow</Link>
        </Button>
      </div>

      {templatesQuery.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {templatesQuery.isError && (
        <p className="text-destructive text-sm">Couldn't load workflow templates.</p>
      )}

      <div className="flex flex-col gap-2">
        {templatesQuery.data?.map((template) => (
          <Link key={template._id} to={`/workflows/${template._id}`}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {template.requires_warmup && <Badge variant="outline">Warmup</Badge>}
                  <Badge variant="secondary">{template.steps?.length ?? 0} steps</Badge>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {templatesQuery.data?.length === 0 && (
          <p className="text-muted-foreground text-sm">No workflows yet — create one.</p>
        )}
      </div>
    </div>
  )
}
