import React, { useEffect, useState } from "react";
import { api, formatARS, formatDateAR, todayISO } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Share2, Printer, Receipt, TrendingUp, TrendingDown, Pizza, Settings } from "lucide-react";
import WhatsAppSettings, { buildWhatsAppUrl } from "./WhatsAppSettings";

export default function CierreCaja({ open, onOpenChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waSettingsOpen, setWaSettingsOpen] = useState(false);
  const [savedNumber, setSavedNumber] = useState("");
  const today = todayISO();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      api.get(`/stats/historical?date=${today}&period=day`),
      api.get("/settings"),
    ])
      .then(([res, set]) => {
        setData(res.data);
        setSavedNumber(set.data?.whatsapp_number || "");
      })
      .finally(() => setLoading(false));
  }, [open, today]);

  const shareWhatsApp = async () => {
    if (!data) return;
    const url = await buildWhatsAppUrl(buildCierreMessage(data));
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none" data-testid="dialog-cierre-caja">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-600" /> Cierre de caja
          </DialogTitle>
          <DialogDescription>Resumen completo del día. Compartilo o imprimilo al final del turno.</DialogDescription>
        </DialogHeader>

        {loading || !data ? (
          <div className="py-10 text-center text-stone-500" data-testid="cierre-loading">Calculando...</div>
        ) : (
          <CierreTicket data={data} />
        )}

        <DialogFooter className="gap-2 print:hidden flex-row sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWaSettingsOpen(true)}
            data-testid="boton-config-whatsapp"
            title="Configurar mi WhatsApp"
          >
            <Settings className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{savedNumber ? `+${savedNumber}` : "Configurar Nº"}</span>
            <span className="sm:hidden">⚙️</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.print()} disabled={!data} data-testid="boton-imprimir-cierre">
              <Printer className="w-4 h-4 mr-1" /> Imprimir
            </Button>
            <Button onClick={shareWhatsApp} disabled={!data} className="bg-emerald-600 hover:bg-emerald-700" data-testid="boton-whatsapp-cierre">
              <Share2 className="w-4 h-4 mr-1" /> WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <WhatsAppSettings open={waSettingsOpen} onOpenChange={setWaSettingsOpen} onSaved={setSavedNumber} />
    </Dialog>
  );
}

// ---------- helpers ----------
function buildCierreMessage(data) {
  const top = data.top_varieties[0];
  const lines = [
    `🍕 *Giovanni · Cierre de caja*`,
    `📅 ${formatDateAR(data.start)}`,
    "",
    `💰 Ventas: ${formatARS(data.total_sales)}  (${data.sales_count} op.)`,
    `🧾 Gastos: ${formatARS(data.total_expenses)}  (${data.expenses_count} reg.)`,
    `📈 Ganancia: ${formatARS(data.profit)}`,
    `🍕 Pizzas vendidas: ${data.quantity_sold}`,
  ];
  if (top) lines.push(`⭐ Más vendida: ${top.variety_name} (${top.quantity} u.)`);
  return lines.join("\n");
}

// ---------- ticket ----------
function CierreTicket({ data }) {
  const positive = data.profit >= 0;
  return (
    <div id="ticket-cierre" className="space-y-5">
      <TicketHeader date={data.start} />
      <TotalsRow totals={data} positive={positive} />
      <DetailRows data={data} positive={positive} />
      {data.sales.length > 0 && <SalesSection sales={data.sales} total={data.total_sales} />}
      {data.expenses.length > 0 && <ExpensesSection expenses={data.expenses} total={data.total_expenses} />}
      {data.sales.length === 0 && data.expenses.length === 0 && (
        <div className="text-center py-6 text-sm text-stone-500 border-t border-dashed border-stone-300">
          No hay movimientos cargados hoy.
        </div>
      )}
    </div>
  );
}

function TicketHeader({ date }) {
  return (
    <div className="text-center border-b border-dashed border-stone-300 pb-4">
      <div className="font-display text-2xl font-bold text-stone-900">Giovanni</div>
      <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mt-1">Pizza e Passione</div>
      <div className="font-mono-num text-sm text-stone-600 mt-2" data-testid="cierre-fecha">{formatDateAR(date)}</div>
    </div>
  );
}

function TotalsRow({ totals, positive }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <Box label="Ventas" value={formatARS(totals.total_sales)} color="text-orange-700" bg="bg-orange-50" testid="cierre-ventas" />
      <Box label="Gastos" value={formatARS(totals.total_expenses)} color="text-rose-700" bg="bg-rose-50" testid="cierre-gastos" />
      <Box
        label="Ganancia"
        value={formatARS(totals.profit)}
        color={positive ? "text-emerald-700" : "text-rose-700"}
        bg={positive ? "bg-emerald-50" : "bg-rose-50"}
        testid="cierre-ganancia"
      />
    </div>
  );
}

function DetailRows({ data, positive }) {
  const top = data.top_varieties[0];
  return (
    <div className="space-y-2 text-sm" data-testid="cierre-detalle">
      <Row label="Operaciones de venta" value={`${data.sales_count}`} />
      <Row label="Pizzas vendidas" value={`${data.quantity_sold} u.`} icon={Pizza} />
      <Row label="Gastos registrados" value={`${data.expenses_count}`} />
      {top && (
        <Row label="Pizza más vendida" value={`${top.variety_name} · ${top.quantity} u.`} icon={TrendingUp} highlight />
      )}
      <Row
        label="Resultado del día"
        value={positive ? "Positivo ✓" : "Negativo"}
        icon={positive ? TrendingUp : TrendingDown}
        highlight
      />
    </div>
  );
}

function SalesSection({ sales, total }) {
  return (
    <div className="border-t border-dashed border-stone-300 pt-4">
      <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">Ventas del día</div>
      <ul className="space-y-1 text-sm font-mono-num">
        {sales.map((s) => (
          <li key={s.id} className="flex justify-between gap-2" data-testid={`cierre-venta-${s.id}`}>
            <span className="text-stone-700 truncate">{s.variety_name} × {s.quantity}</span>
            <span className="text-stone-900 font-semibold whitespace-nowrap">{formatARS(s.total)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-2 pt-2 border-t border-stone-200 text-sm">
        <span className="font-semibold text-stone-700">Total ventas</span>
        <span className="font-mono-num font-bold text-stone-900">{formatARS(total)}</span>
      </div>
    </div>
  );
}

function ExpensesSection({ expenses, total }) {
  return (
    <div className="border-t border-dashed border-stone-300 pt-4">
      <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">Gastos del día</div>
      <ul className="space-y-1 text-sm font-mono-num">
        {expenses.map((g) => (
          <li key={g.id} className="flex justify-between gap-2" data-testid={`cierre-gasto-${g.id}`}>
            <span className="text-stone-700 truncate">{g.category_name}{g.description ? ` · ${g.description}` : ""}</span>
            <span className="text-rose-700 font-semibold whitespace-nowrap">{formatARS(g.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-2 pt-2 border-t border-stone-200 text-sm">
        <span className="font-semibold text-stone-700">Total gastos</span>
        <span className="font-mono-num font-bold text-rose-700">{formatARS(total)}</span>
      </div>
    </div>
  );
}

function Box({ label, value, color, bg, testid }) {
  return (
    <div className={`rounded-xl p-3 ${bg}`} data-testid={testid}>
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</div>
      <div className={`font-mono-num text-base font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, icon: Icon, highlight }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${highlight ? "border-y border-stone-100" : ""}`}>
      <span className="text-stone-600 flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-stone-400" />}
        {label}
      </span>
      <span className="font-mono-num font-medium text-stone-900">{value}</span>
    </div>
  );
}
