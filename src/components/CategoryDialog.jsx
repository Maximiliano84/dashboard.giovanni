import { useEffect, useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

export default function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}) {
  const editing = Boolean(category);
  const [name, setName] = useState("");

  // 🔥 cargar datos al abrir (sin bugs)
  useEffect(() => {
    if (open) {
      setName(category?.name || "");
    }
  }, [open, category]);

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Nombre obligatorio");
    }

    try {
      if (editing) {
        await updateDoc(doc(db, "expense_categories", category.id), {
          name: name.trim(),
        });

        toast.success("Categoría actualizada");
      } else {
        await addDoc(collection(db, "expense_categories"), {
          name: name.trim(),
          created_at: new Date(),
        });

        toast.success("Categoría creada");
      }

      onSaved && onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">

          <Input
            autoFocus
            placeholder="Ej: Harina"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4">

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {editing ? "Guardar" : "Crear"}
            </Button>

          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}