import * as React from 'react'
import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useApprovedEmailVersions } from '../hooks/useApprovedEmailVersions'
import { PlaceholderNode, type PlaceholderNodeData } from '../nodes/PlaceholderNode'
import { StepNode, type StepNodeData } from '../nodes/StepNode'
import type { StepKind, WorkflowStepInput } from '../types'

const ROW_HEIGHT = 140
const NODE_X = 0

const nodeTypes = { step: StepNode, placeholder: PlaceholderNode }

interface WorkflowCanvasProps {
  steps: WorkflowStepInput[]
  selectedIndex: number | null
  onSelect: (index: number | null) => void
  onInsert: (kind: StepKind, index: number) => void
  onDelete: (index: number) => void
}

export function WorkflowCanvas({ steps, selectedIndex, onSelect, onInsert, onDelete }: WorkflowCanvasProps) {
  const { labelForVersionId } = useApprovedEmailVersions()

  const { nodes, edges } = React.useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let previousId: string | null = null

    for (let i = 0; i <= steps.length; i++) {
      const placeholderId = `insert-${i}`
      const placeholderData: PlaceholderNodeData = { index: i, onInsert }
      nodes.push({
        id: placeholderId,
        type: 'placeholder',
        position: { x: NODE_X + 105, y: i * ROW_HEIGHT },
        data: placeholderData,
        draggable: false,
        selectable: false,
        // React Flow's base stylesheet sets pointer-events: none on nodes that are neither
        // selectable nor draggable — this node needs neither, but does need clicks/drops.
        style: { pointerEvents: 'auto' },
      })
      if (previousId) {
        edges.push({ id: `${previousId}-${placeholderId}`, source: previousId, target: placeholderId })
      }
      previousId = placeholderId

      if (i < steps.length) {
        const stepId = `step-${i}`
        const stepData: StepNodeData = {
          step: steps[i],
          index: i,
          isSelected: selectedIndex === i,
          emailVersionLabel: labelForVersionId,
          onSelect: () => onSelect(i),
          onDelete: () => onDelete(i),
        }
        nodes.push({
          id: stepId,
          type: 'step',
          position: { x: NODE_X, y: i * ROW_HEIGHT + 40 },
          data: stepData,
          draggable: false,
        })
        edges.push({ id: `${previousId}-${stepId}`, source: previousId, target: stepId })
        previousId = stepId
      }
    }

    return { nodes, edges }
  }, [steps, selectedIndex, onSelect, onInsert, onDelete, labelForVersionId])

  return (
    <div className="bg-muted/30 h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  )
}
