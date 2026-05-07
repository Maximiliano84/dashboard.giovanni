import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Receipt, Trash2 } from "lucide-react";

import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { toast } from "sonner";

export default function ExpensesHistoryCard({ expenses = [], onDeleted }) {
  const [toDelete, setToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // 🔥 ordenar por fecha (seguro)
  const sortedExpenses = [...expenses].sort((a, b) => {
    const aDate = a?.created_at?.seconds
      ? a.created_at.seconds * 1000
      : new Date(a?.created_at || 0).getTime();

    const bDate = b?.created_at?.seconds
      ? b.created_at.seconds * 1000
      : new Date(b?.created_at || 0).getTime();

    return bDate - aDate;
  });

  // 🔥 total seguro
  const total = sortedExpenses.reduce(
    (acc, e) => acc + (Number(e.amount) || 0),
    0
  );

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setLoadingDelete(true);

      await deleteDoc(doc(db, "expenses", toDelete.id));

      toast.success("Gasto eliminado");

      onDeleted && onDeleted();

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
      <Card className="lg:col-span-2 max-h-[438px] flex flex-col">
        {/* HEADER */}
        <CardHeader className="flex-row items-center justify-between border-b shrink-0">
          <CardTitle className="text-base text-stone-800">
            Historial de hoy
          </CardTitle>

          <div className="text-xs text-stone-500">
            <span className="mr-2">
              {sortedExpenses.length} gastos
            </span>
            ·
            <span className="ml-2 font-semibold text-stone-700">
              {formatARS(total)}
            </span>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex-1 overflow-y-auto p-0">
          {sortedExpenses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="divide-y">
                {sortedExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-4 hover:bg-stone-50"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">
                        {e.category_name || "Sin categoría"}
                      </div>

                      {e.description && (
                        <div className="text-sm text-stone-500">
                          {e.description}
                        </div>
                      )}

                      <div className="text-xs text-stone-400 mt-1">
                        {formatDateAR(e.date)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="font-semibold">
                        {formatARS(e.amount)}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setToDelete(e)}
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}




        </CardContent>
      </Card >

      {/* 🔴 MODAL UNIFICADO */}
      < ConfirmDeleteDialog
        open={!!toDelete
        }
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={loadingDelete}
        title="Eliminar gasto"
        description={`¿Eliminar ${toDelete?.category_name || "este gasto"
          }?`}
      />
    </>
  );
}

// ================= EMPTY =================
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Receipt className="w-8 h-8 text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        Sin gastos registrados.
      </p>
    </div>
  );
}