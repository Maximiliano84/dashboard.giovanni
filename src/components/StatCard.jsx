import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const ACCENTS = {
  orange: "bg-orange-50 text-orange-600",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
};

export default function StatCard({ label, value, sub, icon: Icon, accent = "orange", trend, testid }) {
  return (
    <Card className="hover:shadow-md hover:-translate-y-[2px] transition-all" data-testid={testid}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ACCENTS[accent]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 font-mono-num text-2xl font-semibold text-stone-900">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          {trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
          <span>{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
