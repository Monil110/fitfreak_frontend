import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  variant?: "default" | "accent";
}

const StatCard = ({ label, value, unit, icon: Icon, variant = "default" }: StatCardProps) => {
  return (
    <div className={cn(
      "rounded-xl p-4 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10",
      variant === "accent" 
        ? "bg-accent/10 border-accent/20 hover:border-accent/40" 
        : "bg-secondary border-border hover:border-accent/30"
    )}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={cn("w-4 h-4", variant === "accent" ? "text-accent" : "text-muted-foreground")} />}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export default StatCard;
