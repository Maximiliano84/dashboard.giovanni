import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SalesHistoryCard({ sales, onDeleted }) {
  // ✅ ordenar por fecha (por si acaso)
  const sortedSales = [...sales].sort((a, b) => {
    const aDate = a.created_at?.seconds
      ? a.created_at.seconds
      : new Date(a.created_at).getTime();

    const bDate = b.created_at?.seconds
      ? b.created_at.seconds
      : new Date(b.created_at).getTime();

    return bDate - aDate;
  });

  // ✅ total seguro
  const total = sortedSales.reduce((acc, s) => {
    const unit = s.unit_price ?? (s.total && s.quantity ? s.total / s.quantity : 0);
    const t = s.total ?? unit * s.quantity;
    return acc + (t || 0);
  }, 0);

  const remove = (sale) => {
    toast("¿Eliminar venta?", {
      description: sale.variety_name || "Pizza",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteDoc(doc(db, "sales", sale.id));
            toast.success("Venta eliminada");

            // 🔥 clave
            onDeleted && onDeleted(sale.id);

          } catch (err) {
            console.error(err);
            toast.error("Error al eliminar");
          }
        },
      },
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base text-stone-800">Historial</CardTitle>
        <div className="text-xs text-stone-500">
          <span className="mr-2">{sortedSales.length} ventas</span>·
          <span className="ml-2 font-semibold text-stone-700">{formatARS(total)}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {sortedSales.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-stone-500 border-b bg-stone-50">
                  <th className="text-left p-3">Variedad</th>
                  <th className="text-right p-3">Precio</th>
                  <th className="text-right p-3">Cant.</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-left p-3 hidden sm:table-cell">Fecha</th>
                  <th className="p-3"></th>
                </tr>
              </thead>

              <tbody>
                {sortedSales.map((s) => {
                  // ✅ fallback inteligente
                  const unit =
                    s.unit_price ??
                    (s.total && s.quantity ? s.total / s.quantity : 0);

                  const total =
                    s.total ??
                    unit * s.quantity;

                  return (
                    <tr key={s.id} className="border-b hover:bg-stone-50">
                      <td className="p-3 font-medium text-stone-800">
                        {s.variety_name || "Sin nombre"}
                      </td>

                      <td className="p-3 text-right">
                        {formatARS(unit)}
                      </td>

                      <td className="p-3 text-right">
                        {s.quantity}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        {formatARS(total)}
                      </td>

                      <td className="p-3 text-stone-500 hidden sm:table-cell">
                        {formatDateAR(s.date)}
                      </td>

                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(s)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Receipt className="w-8 h-8 mx-auto text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        Sin ventas registradas todavía.
      </p>
    </div>
  );
}