import { useState } from "react";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";

import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function CategoriesList({ items, onEdit, onChanged }) {
  const [toDelete, setToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setLoadingDelete(true);

      await deleteDoc(doc(db, "expense_categories", toDelete.id));

      toast.success("Categoría eliminada");

      onChanged && onChanged();

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
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 hover:bg-stone-50"
                >
                  <span className="font-medium text-stone-800">
                    {c.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(c)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(c)}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔴 MODAL UNIFICADO */}
      <ConfirmDeleteDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        loading={loadingDelete}
        title="Eliminar categoría"
        description={`Eliminar "${toDelete?.name}"`}
        onConfirm={handleDelete}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-sm text-stone-500">
      Sin categorías todavía
    </div>
  );
}