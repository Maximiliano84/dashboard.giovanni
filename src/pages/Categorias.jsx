import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import CategoriesList from "../components/CategoriesList";
import CategoryDialog from "../components/CategoryDialog";

import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

export default function Categorias() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const snap = await getDocs(collection(db, "expense_categories"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setOpen(true);
  };

  return (
    <div className="space-y-6 fade-up bg-white" data-testid="page-categorias">

      {/* HEADER */}
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Configuración
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Categorías
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Organizá los gastos para entender mejor tu rentabilidad.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva categoría
        </Button>
      </header>

      {/* 🔥 CONTENEDOR REAL */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <CategoriesList
          items={items}
          onEdit={openEdit}
          onChanged={load}
        />
      </div>

      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        category={editing}
        onSaved={load}
      />
    </div>
  );
}