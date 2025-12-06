export interface DiagramConnectionProps {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}

export function DiagramConnection({ fromX, fromY, toX, toY }: DiagramConnectionProps) {
    // Simple Bezier curve
    const controlPointOffset = Math.abs(toX - fromX) / 2;
    const path = `M ${fromX} ${fromY} C ${fromX + controlPointOffset} ${fromY}, ${toX - controlPointOffset} ${toY}, ${toX} ${toY}`;

    return (
        <g>
            <path
                d={path}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
                className="animate-in fade-in duration-500"
            />
            <circle cx={toX} cy={toY} r="3" fill="hsl(var(--primary))" />
        </g>
    );
}
