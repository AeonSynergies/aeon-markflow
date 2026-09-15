import { Navigate, Route, Routes } from 'react-router-dom'

import { ConnectGate } from '@/auth/ConnectGate'
import { WorkflowBuilderPage } from '@/features/workflow-builder/WorkflowBuilderPage'
import { WorkflowTemplatesListPage } from '@/features/workflow-builder/WorkflowTemplatesListPage'

export function App() {
  return (
    <ConnectGate>
      <Routes>
        <Route path="/" element={<Navigate to="/workflows" replace />} />
        <Route path="/workflows" element={<WorkflowTemplatesListPage />} />
        <Route path="/workflows/:templateId" element={<WorkflowBuilderPage />} />
      </Routes>
    </ConnectGate>
  )
}
