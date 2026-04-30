import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { formatARS, formatDateAR } from "../lib/api";

const PERIODS = ["today", "week", "month", "year"];
const PERIOD_LABELS = { today: "Hoy", week: "Semana", month: "Mes", year: "Año" };

export default function PeriodSummary({ summary }) {
  return (
    <Tabs defaultValue="month" className="w-full" data-testid="tabs-resumen-periodo">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-xl font-semibold text-stone-800">Resumen por periodo</h2>
        <TabsList className="bg-stone-100">
          {PERIODS.map((p) => (
            <TabsTrigger key={p} value={p} data-testid={`tab-resumen-${p}`}>{PERIOD_LABELS[p]}</TabsTrigger>
          ))}
        </TabsList>
      </div>
      {PERIODS.map((p) => (
        <TabsContent key={p} value={p} className="mt-4">
          <PeriodGrid p={summary[p]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PeriodGrid({ p }) {
  const positive = p.profit >= 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid={`resumen-${p.period}`}>
      <SummaryRow
        label="Ventas"
        value={formatARS(p.total_sales)}
        sub={`${p.sales_count} operaciones · ${p.quantity_sold} pizzas`}
        color="text-orange-700"
        bg="bg-orange-50"
      />
      <SummaryRow
        label="Gastos"
        value={formatARS(p.total_expenses)}
        sub={`${p.expenses_count} registrados`}
        color="text-rose-700"
        bg="bg-rose-50"
      />
      <SummaryRow
        label="Ganancia neta"
        value={formatARS(p.profit)}
        sub={p.start === p.end ? formatDateAR(p.start) : `${formatDateAR(p.start)} → ${formatDateAR(p.end)}`}
        color={positive ? "text-emerald-700" : "text-rose-700"}
        bg={positive ? "bg-emerald-50" : "bg-rose-50"}
      />
    </div>
  );
}

function SummaryRow({ label, value, sub, color, bg }) {
  return (
    <div className={`rounded-xl border border-stone-200 p-4 ${bg}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</div>
      <div className={`mt-2 font-mono-num text-2xl font-semibold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-stone-500">{sub}</div>
    </div>
  );
}
