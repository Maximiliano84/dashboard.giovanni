import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { formatARS, formatDateAR } from "../lib/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, PieChart, Pie, Legend,
} from "recharts";

export const CHART_COLORS = ["#ea580c", "#16a34a", "#f59e0b", "#0ea5e9", "#9333ea", "#dc2626", "#0891b2"];

// Stable references – defined at module scope to avoid re-creating on every render
const AREA_MARGIN = { left: 0, right: 8, top: 8, bottom: 0 };
const BAR_MARGIN = { left: 8, right: 8 };
const TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 };
const PIE_TOOLTIP_STYLE = { borderRadius: 12, fontSize: 12 };
const LEGEND_STYLE = { fontSize: 12 };
const AXIS_TICK_X = { fontSize: 11, fill: "#78716c" };
const AXIS_TICK_Y = { fontSize: 11, fill: "#78716c" };
const AXIS_TICK_BAR_Y = { fontSize: 12, fill: "#44403c" };
const AXIS_LINE_X = { stroke: "#e7e5e4" };
const BAR_RADIUS = [0, 6, 6, 0];

const formatTickDate = (v) => v.slice(8, 10) + "/" + v.slice(5, 7);
const formatTickAmount = (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;
const trendTooltipFormatter = (value, name) => [
  formatARS(value),
  name === "sales" ? "Ventas" : name === "expenses" ? "Gastos" : "Ganancia",
];
const topVarietiesFormatter = (value, _name, payload) => [
  `${value} unidades · ${formatARS(payload.payload.revenue)}`,
  payload.payload.variety_name,
];
const emptyLabelFormatter = () => "";

export function TrendChart({ data, title = "Tendencia últimos 30 días", testid }) {
  const gradientSalesId = `g-sales-${testid}`;
  const gradientExpId = `g-exp-${testid}`;
  return (
    <Card data-testid={testid}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-display text-base text-stone-800">{title}</CardTitle>
        <TrendingUp className="w-4 h-4 text-stone-400" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={AREA_MARGIN}>
              <defs>
                <linearGradient id={gradientSalesId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={gradientExpId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTickDate}
                tick={AXIS_TICK_X}
                axisLine={AXIS_LINE_X}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={AXIS_TICK_Y}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={formatTickAmount}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={trendTooltipFormatter}
                labelFormatter={formatDateAR}
              />
              <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={2} fill={`url(#${gradientSalesId})`} />
              <Area type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} fill={`url(#${gradientExpId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopVarietiesChart({ data, title = "Top variedades", testid }) {
  return (
    <Card data-testid={testid}>
      <CardHeader><CardTitle className="font-display text-base text-stone-800">{title}</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty text="Aún no hay ventas." />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={BAR_MARGIN}>
                <CartesianGrid stroke="#f5f5f4" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK_X} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="variety_name" tick={AXIS_TICK_BAR_Y} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={topVarietiesFormatter}
                  labelFormatter={emptyLabelFormatter}
                />
                <Bar dataKey="quantity" radius={BAR_RADIUS}>
                  {data.map((entry, idx) => (
                    <Cell key={entry.variety_id} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExpensesPieChart({ data, title = "Gastos por categoría", testid }) {
  return (
    <Card data-testid={testid}>
      <CardHeader><CardTitle className="font-display text-base text-stone-800">{title}</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty text="Sin gastos cargados." />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="category_name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.map((entry, idx) => (
                    <Cell key={entry.category_id} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatARS} contentStyle={PIE_TOOLTIP_STYLE} />
                <Legend wrapperStyle={LEGEND_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartEmpty({ text }) {
  return <div className="h-64 min-h-[256px] flex items-center justify-center text-sm text-stone-400">{text}</div>;
}
