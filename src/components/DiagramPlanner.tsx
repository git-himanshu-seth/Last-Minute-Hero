import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyEdgeChanges, 
  applyNodeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
  Panel,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Network, 
  Wand2, 
  Plus, 
  Download, 
  Trash2, 
  Save,
  MousePointer2,
  Settings,
  Type,
  Layout,
  Layers,
  Settings2,
  Maximize2,
  Diamond,
  Circle,
  Play,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Link,
  Clock,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskNode, StepNode, DecisionNode, StartEndNode, ImageNode } from './DiagramNodes';

const nodeTypes: NodeTypes = {
  task: TaskNode,
  step: StepNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  image: ImageNode
};

export const DiagramPlanner: React.FC = () => {
  const { 
    tasks, 
    showToast, 
    strategyPlans, 
    addStrategyPlan, 
    updateStrategyPlan, 
    removeStrategyPlan 
  } = useApp();
  
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [activeTool, setActiveTool] = useState('select');
  const [planName, setPlanName] = useState('New Strategy Map');
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const loadPlan = (plan: any) => {
    setCurrentPlanId(plan.id);
    setPlanName(plan.name);
    setNodes(plan.nodes || []);
    setEdges(plan.edges || []);
    setShowLoadPanel(false);
    showToast(`Loaded: ${plan.name}`, 'info');
  };

  const handleSave = async () => {
    try {
      if (currentPlanId) {
        const plan = strategyPlans.find(p => p.id === currentPlanId);
        if (plan) {
          await updateStrategyPlan({
            ...plan,
            name: planName,
            nodes,
            edges
          });
        }
      } else {
        const newPlan = await addStrategyPlan(planName, nodes, edges);
        setCurrentPlanId(newPlan.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save plan', 'error');
    }
  };

  const addManualNode = (type: string = 'step', initialData: any = {}) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: type === 'task' ? 'New Task' : 
               type === 'decision' ? 'Decision?' : 
               type === 'image' ? 'New Image' : 'New Step',
        category: type === 'task' ? 'General' : undefined,
        hours: type === 'task' ? 2 : undefined,
        ...initialData
      },
      type,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addManualNode('image', { imageUrl: dataUrl, label: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateWithAI = async () => {
    if (!description && !selectedTask) {
      showToast('Please provide a description or select a task.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const taskObj = tasks.find(t => t.id === selectedTask);
      const finalDesc = selectedTask 
        ? `Task: ${taskObj?.title}. Description: ${taskObj?.description}. ${description}`
        : description;

      const res = await fetch('/api/gemini/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: finalDesc })
      });

      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      if (!data || !Array.isArray(data.nodes)) {
        throw new Error('AI returned invalid diagram data');
      }
      
      setNodes(data.nodes.map((n: any) => ({
        ...n,
        // Ensure nodes have correct type and position
        type: n.type || 'task',
        position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          ...n.data,
          label: n.data?.label || 'Untitled Node'
        }
      })));
      setEdges(data.edges || []);
      showToast('Diagram generated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'AI failed to generate diagram. Using fallback layout.', 'error');
      // Simple fallback
      setNodes([
        { id: '1', position: { x: 0, y: 0 }, type: 'task', data: { label: 'Start Strategy' } },
        { id: '2', position: { x: 300, y: 0 }, type: 'task', data: { label: 'Define Goals' } }
      ]);
      setEdges([{ id: 'e1-2', source: '1', target: '2' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  const [showSettings, setShowSettings] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState({
    showGrid: true,
    gridVariant: 'lines' as 'lines' | 'dots' | 'cross',
    snapToGrid: true
  });

  const selectedNode = nodes.find(n => n.selected);

  const savePlan = () => {
    handleSave();
  };

  const saveToLocalStorage = () => {
    try {
      const data = JSON.stringify({ name: planName, nodes, edges });
      localStorage.setItem(`diagram_plan_${currentPlanId || 'default'}`, data);
      showToast('Plan saved to local storage successfully!', 'success');
    } catch (error) {
      console.error('Failed to save to local storage', error);
      showToast('Failed to save to local storage', 'error');
    }
  };

  const shareViaEmail = () => {
    const data = JSON.stringify({ name: planName, nodes, edges }, null, 2);
    // Construct text representation for the email body
    const bodyText = `Check out my AI Strategy Plan: ${planName}\n\nHere is the raw plan data:\n${data}\n`;
    const subject = `AI Strategy Plan: ${planName}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Create an anchor tag and click it to open the default email client
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.click();
    showToast('Opening email client...', 'success');
  };

  const exportAsImage = async () => {
    if (!flowContainerRef.current) return;
    
    const { toPng } = await import('html-to-image');
    showToast('Preparing snapshot...', 'success');
    
    try {
      const dataUrl = await toPng(flowContainerRef.current, {
        backgroundColor: '#0a0a0a',
        quality: 1,
        pixelRatio: 2,
        filter: (node) => {
          const className = (node as HTMLElement).className;
          if (typeof className === 'string' && (className.includes('react-flow__controls') || className.includes('react-flow__panel'))) {
            return false;
          }
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `strategy-export-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      showToast('Export successful!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed.', 'error');
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    showToast('Canvas cleared.', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-border-main">
      {/* Figma-style Toolbar */}
      <div className="h-14 border-b border-border-main bg-sidebar-bg flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-bold">
              D
            </div>
            <div className="flex flex-col">
              <input 
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-primary-text outline-none focus:border-b border-accent/30 w-32 sm:w-48"
              />
              <span className="text-[10px] text-secondary-text">{currentPlanId ? 'Cloud Synced' : 'Draft'}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-border-main mx-2" />
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowLoadPanel(!showLoadPanel)}
              className={`p-2 rounded-lg transition ${showLoadPanel ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Browse Plans"
            >
              <Layout className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-lg transition ${activeTool === 'select' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Select (V)"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setActiveTool('task');
                addManualNode('task');
              }}
              className={`p-2 rounded-lg transition ${activeTool === 'task' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Add Task (T)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setActiveTool('decision');
                addManualNode('decision');
              }}
              className={`p-2 rounded-lg transition ${activeTool === 'decision' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Add Decision (D)"
            >
              <Diamond className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setActiveTool('startEnd');
                addManualNode('startEnd');
              }}
              className={`p-2 rounded-lg transition ${activeTool === 'startEnd' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Add Start/End"
            >
              <Play className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setActiveTool('image');
                fileInputRef.current?.click();
              }}
              className={`p-2 rounded-lg transition ${activeTool === 'image' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`} 
              title="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-surface border border-border-main rounded-lg mr-2">
            <span className="text-[10px] font-mono text-secondary-text uppercase">Layers:</span>
            <span className="text-[10px] font-mono text-primary-text font-bold">{nodes.length}</span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 rounded-lg transition ${showSettings ? 'text-accent bg-accent/10' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`}
            title="Canvas Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={clearCanvas} className="p-2 rounded-lg text-secondary-text hover:text-red-400 hover:bg-red-400/5 transition" title="Clear All">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={exportAsImage} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-main text-secondary-text hover:text-primary-text transition text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={shareViaEmail} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-main text-secondary-text hover:text-primary-text transition text-xs font-medium">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={saveToLocalStorage} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-black font-bold text-xs hover:opacity-90 transition shadow-lg shadow-accent/20">
            <Save className="w-3.5 h-3.5" /> Save Plan
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Panel */}
        <div className="w-72 border-r border-border-main bg-sidebar-bg p-4 flex flex-col gap-6 overflow-y-auto shrink-0 scrollbar-hide">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest">
              <Wand2 className="w-3.5 h-3.5" /> AI Autopilot
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-secondary-text uppercase font-bold tracking-wider">Target Mission</label>
                <select 
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full bg-surface border border-border-main rounded-lg px-3 py-2 text-xs text-primary-text outline-none focus:border-accent/50 appearance-none transition"
                >
                  <option value="">-- Manual Mode --</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-secondary-text uppercase font-bold tracking-wider">Strategy Context</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Map out a cloud migration strategy with security checks..."
                  className="w-full bg-surface border border-border-main rounded-lg px-3 py-2 text-xs text-primary-text outline-none focus:border-accent/50 min-h-[80px] resize-none transition"
                />
              </div>

              <button 
                onClick={generateWithAI}
                disabled={isGenerating}
                className={`w-full py-2.5 rounded-xl bg-accent text-black font-bold text-xs flex items-center justify-center gap-2 transition ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 shadow-lg shadow-accent/10'}`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Network className="w-3.5 h-3.5" />
                    Generate Strategy Map
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-border-main" />

          <div className="mt-auto pt-6 border-t border-border-main space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest">
              <Maximize2 className="w-3.5 h-3.5" /> Node Inspector
            </div>
            
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Node Label</label>
                  <input 
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    className="w-full bg-surface border border-border-main rounded-lg px-3 py-2 text-xs text-primary-text outline-none focus:border-accent/50 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Image URL (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={selectedNode.data.imageUrl || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { imageUrl: e.target.value })}
                      className="flex-1 bg-surface border border-border-main rounded-lg px-3 py-2 text-[10px] text-primary-text outline-none focus:border-accent/50 transition"
                      placeholder="https://..."
                    />
                    <button className="p-2 rounded-lg bg-surface border border-border-main hover:bg-white/5 transition text-secondary-text">
                      <Link className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {selectedNode.type === 'task' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Category</label>
                        <input 
                          type="text"
                          value={selectedNode.data.category || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { category: e.target.value })}
                          className="w-full bg-surface border border-border-main rounded-lg px-3 py-1.5 text-[10px] text-primary-text outline-none focus:border-accent/50 transition"
                          placeholder="e.g. Design"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Hours</label>
                        <input 
                          type="number"
                          value={selectedNode.data.hours || 0}
                          onChange={(e) => updateNodeData(selectedNode.id, { hours: parseInt(e.target.value) || 0 })}
                          className="w-full bg-surface border border-border-main rounded-lg px-3 py-1.5 text-[10px] text-primary-text outline-none focus:border-accent/50 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Risk Level</label>
                      <select 
                        value={selectedNode.data.riskLevel || 'low'}
                        onChange={(e) => updateNodeData(selectedNode.id, { riskLevel: e.target.value })}
                        className="w-full bg-surface border border-border-main rounded-lg px-3 py-1.5 text-[10px] text-primary-text outline-none focus:border-accent/50 appearance-none transition"
                      >
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                        <option value="critical">Critical Risk</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Status</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateNodeData(selectedNode.id, { status: 'completed' })}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border transition text-[9px] font-bold uppercase tracking-wider ${selectedNode.data.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-surface border-border-main text-secondary-text hover:bg-white/5'}`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </button>
                        <button 
                          onClick={() => updateNodeData(selectedNode.id, { status: 'pending' })}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border transition text-[9px] font-bold uppercase tracking-wider ${selectedNode.data.status !== 'completed' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-surface border-border-main text-secondary-text hover:bg-white/5'}`}
                        >
                          <Clock className="w-3 h-3" /> Wait
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Description</label>
                      <textarea 
                        value={selectedNode.data.description || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                        className="w-full bg-surface border border-border-main rounded-lg px-3 py-2 text-[10px] text-primary-text outline-none focus:border-accent/50 min-h-[60px] resize-none transition"
                        placeholder="Detailed instructions..."
                      />
                    </div>
                  </>
                )}

                <button 
                  onClick={() => {
                    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
                  }}
                  className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider transition border border-red-500/20 shadow-sm"
                >
                  Delete Selected Node
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface/50 border border-dashed border-border-main text-[10px] text-secondary-text italic leading-relaxed text-center">
                Select a node on the canvas to inspect metadata or manually override strategy steps.
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-background" ref={flowContainerRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            snapToGrid={canvasSettings.snapToGrid}
            fitView
            colorMode="dark"
          >
            <Controls className="!bg-surface !border-border-main !rounded-lg !shadow-xl !text-primary-text" />
            {canvasSettings.showGrid && (
              <Background color="var(--border-main)" variant={canvasSettings.gridVariant} gap={25} size={1} />
            )}
            
            {showLoadPanel && (
              <Panel position="top-left" className="bg-surface/90 backdrop-blur-md border border-border-main p-4 rounded-xl shadow-2xl min-w-[280px] mt-2 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Your Strategy Plans</span>
                  <button onClick={() => setShowLoadPanel(false)} className="text-secondary-text hover:text-primary-text">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  <button 
                    onClick={() => {
                      setCurrentPlanId(null);
                      setPlanName('New Strategy Map');
                      setNodes([]);
                      setEdges([]);
                      setShowLoadPanel(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border-main hover:border-accent/50 hover:bg-accent/5 transition text-left group"
                  >
                    <div className="w-8 h-8 rounded bg-surface border border-border-main flex items-center justify-center text-secondary-text group-hover:text-accent">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-text">Create New Map</div>
                      <div className="text-[9px] text-secondary-text">Start from a clean canvas</div>
                    </div>
                  </button>
                  {strategyPlans.map((plan) => (
                    <div key={plan.id} className="group relative">
                      <button 
                        onClick={() => loadPlan(plan)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition text-left ${currentPlanId === plan.id ? 'bg-accent/5 border-accent/30' : 'bg-surface border-border-main hover:border-border-main/80'}`}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${currentPlanId === plan.id ? 'bg-accent text-black font-bold' : 'bg-sidebar-bg text-secondary-text'}`}>
                          {plan.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-bold text-primary-text truncate">{plan.name}</div>
                          <div className="text-[9px] text-secondary-text">Updated {new Date(plan.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStrategyPlan(plan.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition text-secondary-text hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {showSettings && (
              <Panel position="top-right" className="bg-surface/90 backdrop-blur-md border border-border-main p-4 rounded-xl shadow-2xl min-w-[200px] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Canvas Settings</span>
                  <button onClick={() => setShowSettings(false)} className="text-secondary-text hover:text-primary-text">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-text">Show Grid</span>
                    <button 
                      onClick={() => setCanvasSettings(s => ({ ...s, showGrid: !s.showGrid }))}
                      className={`w-8 h-4 rounded-full transition ${canvasSettings.showGrid ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition ${canvasSettings.showGrid ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Grid Style</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['lines', 'dots', 'cross'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setCanvasSettings(s => ({ ...s, gridVariant: v as any }))}
                          className={`py-1 text-[9px] rounded border transition ${canvasSettings.gridVariant === v ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/5 border-transparent text-secondary-text hover:bg-white/10'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border-main">
                    <span className="text-xs text-primary-text">Snap to Grid</span>
                    <button 
                      onClick={() => setCanvasSettings(s => ({ ...s, snapToGrid: !s.snapToGrid }))}
                      className={`w-8 h-4 rounded-full transition ${canvasSettings.snapToGrid ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition ${canvasSettings.snapToGrid ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </Panel>
            )}

            <Panel position="bottom-right" className="bg-surface/80 backdrop-blur border border-border-main p-2 rounded-lg text-[9px] font-mono text-secondary-text flex gap-3">
              <span>N: {nodes.length}</span>
              <span>E: {edges.length}</span>
              <span className="text-accent">● AI CORE READY</span>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
