import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: 'primary' | 'success' | 'destructive' | 'warning' | 'info';
}

const variantConfig = {
  primary: { icon: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400" },
  success: { icon: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400" },
  destructive: { icon: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400" },
  warning: { icon: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400" },
  info: { icon: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800 dark:text-cyan-400" },
};

const StatCard = ({ title, value, icon, trend, trendUp, variant = 'primary' }: StatCardProps) => {
  const { icon: iconClass } = variantConfig[variant];

  return (
    <Card className="bg-card text-card-foreground border shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
          <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0", iconClass)}>
            {icon}
          </div>
        </div>
        <div className="text-lg font-black text-foreground tracking-tight leading-none" style={{ fontFamily: "var(--font-heading)" }}>
          {value}
        </div>
        {trend && (
          <p className={cn("text-[10px] font-bold mt-1.5 flex items-center gap-1", trendUp ? "text-emerald-600" : "text-red-500")}>
            <span className={cn("inline-flex items-center justify-center w-3 h-3 rounded text-[8px]", trendUp ? "bg-emerald-100 dark:bg-emerald-900" : "bg-red-100 dark:bg-red-900")}>
              {trendUp ? "↑" : "↓"}
            </span>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
