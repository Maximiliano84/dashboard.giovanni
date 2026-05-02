import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const ACCENTS = {
  orange: {
    icon: "bg-orange-50 text-orange-600",
    border: "border-orange-200",
    top: "bg-orange-500"
  },
  rose: {
    icon: "bg-rose-50 text-rose-600",
    border: "border-rose-200",
    top: "bg-rose-500"
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-200",
    top: "bg-emerald-500"
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    border: "border-amber-200",
    top: "bg-amber-500"
  }
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "orange",
  trend,
  testid
}) {
  const styles = ACCENTS[accent] || ACCENTS.orange;

  return (
    <Card
      className={`
        relative overflow-hidden
        bg-white border ${styles.border}
        shadow-sm
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-1
      `}
      data-testid={testid}
    >
      {/* 🔥 línea superior de color */}
      <div className={`absolute top-0 left-0 w-full h-1 ${styles.top}`} />

      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {label}
          </div>

          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 text-2xl font-semibold text-stone-900">
          {value}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          {trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
          <span>{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}