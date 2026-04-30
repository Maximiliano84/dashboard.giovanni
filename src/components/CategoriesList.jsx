import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Tags, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function CategoriesList({ items, onEdit, onChanged }) {

  const remove = async (cat) => {
    if (!window.confirm(`¿Eliminar "${cat.name}"?`)) return;

    await deleteDoc(doc(db, "expense_categories", cat.id));
    toast.success("Categoría eliminada");
    onChanged && onChanged();
  };

  return (
    <Card>
      <CardContent className="p-0">

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {items.map((c) => (
              <CategoryRow
                key={c.id}
                category={c}
                onEdit={onEdit}
                onRemove={remove}
              />
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}

// ==========================
// FILA
// ==========================
function CategoryRow({ category, onEdit, onRemove }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-stone-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <Tags className="w-5 h-5 text-orange-600" />
        </div>

        <div className="font-medium text-stone-900">
          {category.name}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
          <Pencil className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => onRemove(category)}>
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
      <Tags className="w-8 h-8 mx-auto text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        No hay categorías cargadas.
      </p>
    </div>
  );
}