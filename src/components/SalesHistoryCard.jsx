import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Receipt, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { toast } from "sonner";

export default function SalesHistoryCard({ sales, onDeleted }) {
  const [toDelete, setToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const sortedSales = [...sales].sort((a, b) => {
    const aDate = a.created_at?.seconds
      ? a.created_at.seconds
      : new Date(a.created_at).getTime();

    const bDate = b.created_at?.seconds
      ? b.created_at.seconds
      : new Date(b.created_at).getTime();

    return bDate - aDate;
  });

  const total = sortedSales.reduce((acc, s) => {
    const unit =
      s.unit_price ?? (s.total && s.quantity ? s.total / s.quantity : 0);

    const t = s.total ?? unit * s.quantity;

    return acc + (t || 0);
  }, 0);

  const totalPizzas = sortedSales.reduce((acc, s) => {
    return acc + (s.quantity || 0);
  }, 0);

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setLoadingDelete(true);

      await deleteDoc(doc(db, "sales", toDelete.id));

      toast.success("Venta eliminada");

      onDeleted && onDeleted(toDelete.id);

      setToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <Card className="lg:col-span-2 max-h-[360px] flex flex-col">
        <CardHeader className="flex-row items-center justify-between border-b shrink-0">
          <CardTitle className="text-base text-stone-800">
            Historial de hoy
          </CardTitle>

          <div className="text-xs text-stone-500">
            <span className="mr-2">{totalPizzas} pizzas</span>
            <span className="ml-2 font-semibold text-stone-700">
              {formatARS(total)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-0 flex-1 overflow-y-auto">
          {sortedSales.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="divide-y">
                {sortedSales.map((s) => {
                  const unit =
                    s.unit_price ??
                    (s.total && s.quantity
                      ? s.total / s.quantity
                      : 0);

                  const total = s.total ?? unit * s.quantity;

                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 hover:bg-stone-50"
                    >
                      {/* LEFT */}
                      <div>
                        <p className="font-medium text-stone-800">
                          {s.variety_name || "Sin nombre"}
                        </p>

                        <p className="text-xs text-stone-500">
                          {s.quantity} unidades · {formatARS(unit)}
                        </p>

                        <p className="text-[11px] text-stone-400">
                          {formatDateAR(s.date)}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-stone-900">
                          {formatARS(total)}
                        </p>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(s)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔴 MODAL UNIFICADO */}
      <ConfirmDeleteDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        loading={loadingDelete}
        title="Eliminar venta"
        description={`Eliminar ${toDelete?.variety_name || "venta"
          }`}
        onConfirm={handleDelete}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Receipt className="w-8 h-8 text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        Sin ventas registradas todavía.
      </p>
    </div>
  );
}