import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatARS, formatDateAR } from "../lib/api";
import { Pizza } from "lucide-react";

export default function RecentSalesList({ sales }) {
  if (sales.length === 0) {
    return <div className="h-64 flex items-center justify-center text-sm text-stone-400">Todavía no registraste ventas.</div>;
  }
  return (
    <ul className="divide-y divide-stone-100">
      {sales.map((s) => (
        <li key={s.id} className="flex items-center justify-between py-2.5 text-sm" data-testid={`venta-reciente-${s.id}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Pizza className="w-4 h-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-stone-800 truncate">{s.variety_name}</div>
              <div className="text-xs text-stone-500">
                {formatDateAR(s.date)} · {s.quantity} u. × {formatARS(s.unit_price)}
              </div>
            </div>
          </div>
          <div className="font-mono-num font-semibold text-stone-900">{formatARS(s.total)}</div>
        </li>
      ))}
    </ul>
  );
}

export function RecentSalesCard({ sales }) {
  return (
    <Card className="lg:col-span-2" data-testid="card-ventas-recientes">
      <CardHeader><CardTitle className="font-display text-base text-stone-800">Ventas recientes</CardTitle></CardHeader>
      <CardContent>
        <RecentSalesList sales={sales} />
      </CardContent>
    </Card>
  );
}
