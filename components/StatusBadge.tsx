import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    isOn: boolean;
    className?: string;
}

export default function StatusBadge({ isOn, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "border-2 font-mono uppercase tracking-wider",
                isOn
                    ? "border-[var(--color-aviation-green)] text-[var(--color-aviation-green)] bg-[var(--color-aviation-green)]/10"
                    : "border-[var(--color-aviation-red)] text-[var(--color-aviation-red)] bg-[var(--color-aviation-red)]/10",
                className
            )}
        >
            <span
                className={cn(
                    "mr-2 h-2 w-2 rounded-full",
                    isOn ? "bg-[var(--color-aviation-green)] shadow-[0_0_8px_var(--color-aviation-green)]" : "bg-[var(--color-aviation-red)]"
                )}
            />
            {isOn ? "Operational" : "Offline"}
        </Badge>
    );
}
