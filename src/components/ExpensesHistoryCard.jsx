import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

import { Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ExpensesHistoryCard({ expenses, onDeleted }) {
  const [toDelete, setToDelete] = useState(null);

  const total = expenses.reduce(
    (acc, e) => acc + (e.amount || 0),
    0
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">
          Historial de gastos
        </CardTitle>

        <div className="text-xs text-stone-500">
          <span className="mr-2">{expenses.length} gastos</span> ·
          <span className="ml-2 font-semibold">
            {formatARS(total)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {expenses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {expenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                onDelete={() => setToDelete(e)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* 🔴 MODAL ELIMINAR */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés eliminar este gasto?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setToDelete(null)}
            >
              Cancelar
            </Button>

            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                try {
                  await deleteDoc(
                    doc(db, "expenses", toDelete.id)
                  );

                  toast.success("Gasto eliminado");

                  setToDelete(null);

                  onDeleted && onDeleted(); // 🔥 refresca lista
                } catch (err) {
                  console.error(err);
                  toast.error("Error al eliminar");
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ==========================
// FILA
// ==========================
function ExpenseRow({ expense, onDelete }) {
  const category =
    expense.category_name ||
    expense.category || // fallback viejo
    "Sin categoría";

  return (
    <div className="flex items-center justify-between p-4 hover:bg-stone-50">
      <div>
        {/* 🔥 CATEGORÍA (TÍTULO GRANDE) */}
        <div className="font-semibold text-stone-900 text-base">
          {category}
        </div>

        {/* 🟡 DESCRIPCIÓN (OPCIONAL) */}
        {expense.description && (
          <div className="text-sm text-stone-500">
            {expense.description}
          </div>
        )}

        {/* 🟡 FECHA */}
        <div className="text-xs text-stone-400 mt-1">
          {formatDateAR(expense.date)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-semibold">
          {formatARS(expense.amount)}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
        </Button>
      </div>
    </div>
  );
}

// ==========================
// EMPTY
// ==========================
function EmptyState() {
  return (
    <div className="text-center py-16">
      <Receipt className="w-8 h-8 mx-auto text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        Sin gastos registrados.
      </p>
    </div>
  );
}