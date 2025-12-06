import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GripVertical, X } from "lucide-react";
import { Node } from "./DiagramCanvas";

interface DiagramNodeProps {
    node: Node;
    isSelected: boolean;
    isConnecting: boolean;
    onSelect: () => void;
    onMove: (x: number, y: number) => void;
    onStartConnection: () => void;
    onDelete: () => void;
}

export function DiagramNode({
    node,
    isSelected,
    isConnecting,
    onSelect,
    onStartConnection,
    onDelete,
}: DiagramNodeProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: node.id,
        data: node,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: node.x,
        top: node.y,
    };

    return (
        <div
            ref={setNodeRef}
            style={{ position: "absolute", ...style }}
            className={cn(
                "w-[150px] z-10 transition-shadow",
                isSelected && "ring-2 ring-primary shadow-lg"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <Card className={cn("border-l-4", `border-l-[${node.color}]`)}>
                <CardContent className="p-3 flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move text-muted-foreground hover:text-foreground"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 font-medium text-sm truncate">{node.label}</div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </CardContent>
                {/* Connection Handle */}
                <div
                    className={cn(
                        "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border bg-background flex items-center justify-center cursor-crosshair hover:border-primary transition-colors",
                        isConnecting && "border-primary bg-primary/10"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onStartConnection();
                    }}
                >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
            </Card>
        </div>
    );
}
