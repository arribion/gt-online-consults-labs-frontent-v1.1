import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";

export function BalanceCard() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 shadow-card">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary-foreground/5" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-primary-foreground/70">
            Total Payed This Month
          </p>
          <button
            onClick={() => setVisible(!visible)}
            className="rounded-lg p-1.5 text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors">
            {visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mt-2">
          <span className="text-4xl font-bold text-primary-foreground tracking-tight">
            {visible ? (
              <p>
                <span className="text-gray-400">KES</span> 00,000.00
              </p>
            ) : (
              "•••••••••"
            )}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success-foreground">
            <TrendingUp className="h-3 w-3" />
            + 78
          </div>
          <span className="text-xs text-primary-foreground/50">
            Number of Tasks
          </span>
        </div>
      </div>
    </div>
  );
}
