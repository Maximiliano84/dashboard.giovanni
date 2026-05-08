import { useState } from "react";
import { formatARS } from "../lib/api";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Pizza, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

// 🔥 Firebase
import { deleteVariety } from "../services/varietiesService";

// 🔥 MODAL GLOBAL
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function VarietiesList({ items, onAdd, onEdit, onChanged }) {
  const [toDelete, setToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setLoadingDelete(true);

      await deleteVariety(toDelete.id);

      toast.success("Variedad eliminada");

      setToDelete(null);

      onChanged && onChanged();
    } catch (err) {
      console.error("ERROR ELIMINANDO:", err);
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
            <EmptyState onAdd={onAdd} />
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((v) => (
                <VarietyRow
                  key={v.id}
                  variety={v}
                  onEdit={onEdit}
                  onRemove={() => setToDelete(v)} // 🔥 abrimos modal
                />
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
        title="Eliminar variedad"
        description={`Esto eliminará la pizza "${toDelete?.name}". Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ================= FILA =================
function VarietyRow({ variety, onEdit, onRemove }) {
  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition"
      data-testid={`fila-variedad-${variety.id}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <Pizza className="w-5 h-5 text-orange-600" />
        </div>

        <div className="min-w-0">
          <div className="font-medium text-stone-900 truncate">
            {variety.name}
          </div>

          <div className="text-xs text-stone-500">
            Precio unitario
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="font-mono-num font-semibold text-stone-900 mr-2">
          {formatARS(variety.price)}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(variety)}
          data-testid={`boton-editar-variedad-${variety.id}`}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          data-testid={`boton-eliminar-variedad-${variety.id}`}
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
        </Button>
      </div>
    </div>
  );
}

// ================= EMPTY =================
function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 mx-auto flex items-center justify-center">
        <Pizza className="w-6 h-6 text-orange-600" />
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">
        Empezá tu carta
      </h3>

      <p className="mt-1 text-sm text-stone-500">
        Agregá tu primera variedad para comenzar a registrar ventas.
      </p>

      <Button
        onClick={onAdd}
        className="mt-5 bg-orange-600 hover:bg-orange-700"
        data-testid="boton-primera-variedad"
      >
        <Plus className="w-4 h-4 mr-1" />
        Agregar variedad
      </Button>
    </div>
  );
}