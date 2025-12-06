import { useState } from "react";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Square,
  Circle,
  Triangle,
  Type,
  ArrowRight,
  Trash2,
  Download,
  Upload,
  Layers,
  MousePointer,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  MessageSquare, // For text node
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagramCanvas, Node, Connection } from "@/components/designer/DiagramCanvas";

const tools = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "rectangle", icon: Square, label: "Process" },
  { id: "circle", icon: Circle, label: "Start/End" },
  { id: "triangle", icon: Triangle, label: "Decision" },
  { id: "text", icon: MessageSquare, label: "Note" },
];

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--coral))",
  "hsl(var(--sunset))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

export function Designer() {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState(colors[0]);

  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "rectangle", x: 100, y: 100, label: "Start Process", color: "hsl(var(--primary))" },
    { id: "2", type: "circle", x: 400, y: 150, label: "End", color: "hsl(var(--coral))" },
  ]);
  const [connections, setConnections] = useState<Connection[]>([
    { id: "c1", from: "1", to: "2" }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const nodeId = active.id as string;

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            x: node.x + delta.x,
            y: node.y + delta.y,
          };
        }
        return node;
      })
    );
  };

  const handleNodeSelect = (id: string | null) => {
    if (connectingFrom && id && connectingFrom !== id) {
      // Create connection
      const newConnection: Connection = {
        id: `c-${Date.now()}`,
        from: connectingFrom,
        to: id,
      };
      setConnections([...connections, newConnection]);
      setConnectingFrom(null);
    } else {
      setSelectedNode(id);
      setConnectingFrom(null); // Cancel connection if clicking elsewhere
    }
  };

  const handleStartConnection = (id: string) => {
    setConnectingFrom(id);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    setSelectedNode(null);
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      label: type === "rectangle" ? "New Process" : type === "circle" ? "New Event" : "New Node",
      color: activeColor,
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Tools */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      activeTool === tool.id && "gradient-coral"
                    )}
                    onClick={() => {
                      setActiveTool(tool.id);
                      if (tool.id !== 'select') addNode(tool.id);
                    }}
                    title={tool.label}
                  >
                    <tool.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Color:</span>
                <div className="flex items-center gap-1">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "h-7 w-7 rounded-lg border-2 transition-all",
                        activeColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 px-3" onClick={() => { setNodes([]); setConnections([]); }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Canvas */}
          <Card className="border-border/50 overflow-hidden min-h-[600px] flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <DiagramCanvas
                nodes={nodes}
                connections={connections}
                selectedNode={selectedNode}
                connectingFrom={connectingFrom}
                onNodeSelect={handleNodeSelect}
                onNodeMove={() => { }} // handled by onDragEnd
                onStartConnection={handleStartConnection}
                onDeleteNode={handleDeleteNode}
              />
            </CardContent>
          </Card>

          {/* Properties Panel */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Nodes ({nodes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1">
                  {nodes.map((node, idx) => (
                    <button
                      key={node.id}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors text-left",
                        selectedNode === node.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <span className="capitalize">{node.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
