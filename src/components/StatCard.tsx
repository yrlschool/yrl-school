import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success";
}

const StatCard = ({ title, value, icon: Icon, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "bg-card border-border",
    primary: "gradient-primary text-primary-foreground border-transparent",
    success: "gradient-success text-success-foreground border-transparent",
  };

  return (
    <Card className={cn("p-3 sm:p-5 transition-all hover:shadow-lg border", variantStyles[variant])}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("text-[10px] sm:text-xs font-medium truncate", variant === "default" ? "text-muted-foreground" : "opacity-90")}>
            {title}
          </p>
          <h3 className={cn("text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1", variant === "default" ? "text-foreground" : "")}>
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20"
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
