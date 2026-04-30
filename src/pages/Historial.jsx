import React, { useState } from "react";
import { formatARS, formatDateAR, todayISO } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { ShoppingCart, Wallet, Coins, Pizza, Receipt, Share2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { TrendChart, TopVarietiesChart, ExpensesPieChart } from "../components/Charts";
import { useHistoricalData } from "../hooks/useApi";
import { buildWhatsAppUrl } from "../components/WhatsAppSettings";

const PERIOD_LABELS = { day: "Día", week: "Semana", month: "Mes" };

export default function Historial() {
  const [date, setDate] = useState(todayISO());
  const [period, setPeriod] = useState("day");
  const { data, loading } = useHistoricalData(date, period);

  const shareWhatsApp = async () => {
    if (!data) return;
    const message = buildHistorialMessage(data);
    const url = await buildWhatsAppUrl(message);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 fade-up" data-testid="page-historial">
      <HistorialHeader onShare={shareWhatsApp} disabled={!data} />

      <Card>
        <CardContent className="p-4 md:p-5">
          <FilterBar date={date} setDate={setDate} period={period} setPeriod={setPeriod} data={data} />
        </CardContent>
      </Card>

      {loading || !data ? (
        <div className="text-stone-500" data-testid="historial-loading">Cargando...</div>
      ) : (
        <>
          <KpiRow data={data} />

          {data.daily.length > 1 && (
            <TrendChart
              data={data.daily}
              title={`Detalle por día — ${PERIOD_LABELS[data.period]}`}
              testid="card-historial-tendencia"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopVarietiesChart data={data.top_varieties} title="Top variedades" testid="card-historial-top-variedades" />
            <ExpensesPieChart data={data.expenses_breakdown} title="Gastos por categoría" testid="card-historial-gastos-categoria" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesListCard sales={data.sales} />
            <ExpensesListCard expenses={data.expenses} />
          </div>
        </>
      )}
    </div>
  );
}

// ---------- helpers ----------
function buildHistorialMessage(data) {
  const periodLabel = PERIOD_LABELS[data.period];
  const range = data.start === data.end
    ? formatDateAR(data.start)
    : `${formatDateAR(data.start)} → ${formatDateAR(data.end)}`;
  const top = data.top_varieties[0];
  const lines = [
    `🍕 *Giovanni · Resumen ${periodLabel.toLowerCase()}*`,
    `📅 ${range}`,
    "",
    `💰 Ventas: ${formatARS(data.total_sales)}  (${data.sales_count} op.)`,
    `🧾 Gastos: ${formatARS(data.total_expenses)}  (${data.expenses_count} reg.)`,
    `📈 Ganancia: ${formatARS(data.profit)}`,
    `🍕 Pizzas vendidas: ${data.quantity_sold}`,
  ];
  if (top) lines.push(`⭐ Más vendida: ${top.variety_name} (${top.quantity} u.)`);
  return lines.join("\n");
}

// ---------- sub components ----------
function HistorialHeader({ onShare, disabled }) {
  return (
    <header className="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Reportes</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">Historial</h1>
        <p className="text-sm text-stone-500 mt-1">Elegí una fecha y un periodo para ver los datos exactos.</p>
      </div>
      <Button
        onClick={onShare}
        disabled={disabled}
        className="bg-emerald-600 hover:bg-emerald-700"
        data-testid="boton-compartir-whatsapp"
      >
        <Share2 className="w-4 h-4 mr-1" /> Compartir por WhatsApp
      </Button>
    </header>
  );
}

function FilterBar({ date, setDate, period, setPeriod, data }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="md:w-56">
        <Label htmlFor="hist-date">Fecha</Label>
        <Input
          id="hist-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          data-testid="input-fecha-historial"
        />
      </div>
      <div className="flex-1">
        <Label className="block">Periodo</Label>
        <Tabs value={period} onValueChange={setPeriod} className="mt-1.5" data-testid="tabs-periodo-historial">
          <TabsList className="bg-stone-100">
            <TabsTrigger value="day" data-testid="tab-historial-dia">Día</TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-historial-semana">Semana</TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-historial-mes">Mes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {data && (
        <div className="text-sm text-stone-600 md:text-right" data-testid="rango-historial">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Rango</span>
          <span className="font-mono-num">
            {formatDateAR(data.start)}
            {data.start !== data.end && ` → ${formatDateAR(data.end)}`}
          </span>
        </div>
      )}
    </div>
  );
}

function KpiRow({ data }) {
  const positive = data.profit >= 0;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard testid="hist-stat-ventas" label="Ventas" value={formatARS(data.total_sales)} sub={`${data.sales_count} operaciones`} icon={ShoppingCart} accent="orange" />
      <StatCard testid="hist-stat-gastos" label="Gastos" value={formatARS(data.total_expenses)} sub={`${data.expenses_count} registrados`} icon={Wallet} accent="rose" />
      <StatCard testid="hist-stat-ganancia" label="Ganancia neta" value={formatARS(data.profit)} sub={positive ? "Positivo" : "Negativo"} icon={Coins} accent={positive ? "emerald" : "rose"} />
      <StatCard testid="hist-stat-pizzas" label="Pizzas vendidas" value={data.quantity_sold.toString()} sub="unidades" icon={Pizza} accent="amber" />
    </div>
  );
}

function SalesListCard({ sales }) {
  return (
    <Card data-testid="card-historial-ventas-lista">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display text-base text-stone-800">Ventas del periodo</CardTitle>
        <span className="text-xs text-stone-500">{sales.length} registros</span>
      </CardHeader>
      <CardContent className="p-0">
        {sales.length === 0 ? (
          <div className="text-center py-10">
            <Receipt className="w-7 h-7 mx-auto text-stone-400" />
            <p className="text-sm text-stone-500 mt-2">Sin ventas.</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 max-h-96 overflow-auto">
            {sales.map((s) => (
              <li key={s.id} className="flex items-center justify-between p-3 text-sm" data-testid={`historial-venta-${s.id}`}>
                <div className="min-w-0">
                  <div className="font-medium text-stone-800 truncate">{s.variety_name}</div>
                  <div className="text-xs text-stone-500">{formatDateAR(s.date)} · {s.quantity} u. × {formatARS(s.unit_price)}</div>
                </div>
                <div className="font-mono-num font-semibold text-stone-900 ml-2">{formatARS(s.total)}</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ExpensesListCard({ expenses }) {
  return (
    <Card data-testid="card-historial-gastos-lista">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display text-base text-stone-800">Gastos del periodo</CardTitle>
        <span className="text-xs text-stone-500">{expenses.length} registros</span>
      </CardHeader>
      <CardContent className="p-0">
        {expenses.length === 0 ? (
          <div className="text-center py-10">
            <Wallet className="w-7 h-7 mx-auto text-stone-400" />
            <p className="text-sm text-stone-500 mt-2">Sin gastos.</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 max-h-96 overflow-auto">
            {expenses.map((g) => (
              <li key={g.id} className="flex items-start justify-between p-3 text-sm gap-3" data-testid={`historial-gasto-${g.id}`}>
                <div className="min-w-0">
                  <div className="font-medium text-stone-800 truncate">{g.category_name}</div>
                  <div className="text-xs text-stone-500">{formatDateAR(g.date)}{g.description ? ` · ${g.description}` : ""}</div>
                </div>
                <div className="font-mono-num font-semibold text-rose-700 whitespace-nowrap">{formatARS(g.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
