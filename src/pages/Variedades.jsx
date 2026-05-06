import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

import VarietyDialog from "../components/VarietyDialog";
import VarietiesList from "../components/VarietiesList";

export default function Variedades() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ================= LOAD =================
  const load = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "varieties"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(list);
    } catch (err) {
      console.error("Error cargando variedades:", err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ================= ACTIONS =================
  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (variety) => {
    setEditing(variety);
    setOpen(true);
  };

  return (
    <div className="space-y-6 fade-up" data-testid="page-variedades">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Catálogo
          </p>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Variedades
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Gestioná las pizzas y precios disponibles para registrar ventas.
          </p>
        </div>

        <Button
          onClick={openCreate}
          data-testid="boton-nueva-variedad"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva variedad
        </Button>
      </header>

      <VarietiesList
        items={items}
        onAdd={openCreate}
        onEdit={openEdit}
        onChanged={load} // 🔥 clave para refrescar después de eliminar
      />

      <VarietyDialog
        open={open}
        onOpenChange={setOpen}
        variety={editing}
        onSaved={load}
      />
    </div>
  );
}