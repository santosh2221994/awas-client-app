import { useCanvasStore } from '../stores/useCanvasStore';

export function useCanvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const viewport = useCanvasStore((s) => s.viewport);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const addNode = useCanvasStore((s) => s.addNode);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const addEdge = useCanvasStore((s) => s.addEdge);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const initializeFlow = useCanvasStore((s) => s.initializeFlow);

  function addAgentNode(position) {
    const id = crypto.randomUUID();
    addNode({
      id,
      type: 'agent',
      position,
      data: { label: 'New Agent', role: '', goal: '', backstory: '' },
    });
    return id;
  }

  function addTaskNode(position) {
    const id = crypto.randomUUID();
    addNode({
      id,
      type: 'task',
      position,
      data: { label: 'New Task', description: '', expectedOutput: '' },
    });
    return id;
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    viewport,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNode,
    removeNode,
    updateNodeData,
    addEdge,
    setSelectedNode,
    setViewport,
    initializeFlow,
    addAgentNode,
    addTaskNode,
  };
}
