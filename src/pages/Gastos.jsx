import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

import NewExpenseCard from "../components/NewExpenseCard";
import ExpensesHistoryCard from "../components/ExpensesHistoryCard";

export default function Gastos() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // ======================
  // CARGAR CATEGORÍAS
  // ======================
  const loadCategories = async () => {
    const snap = await getDocs(collection(db, "expense_categories"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setCategories(data);
  };

  // ======================
  // CARGAR GASTOS
  // ======================
  const loadExpenses = async () => {
    const q = query(
      collection(db, "expenses"),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setExpenses(data);
  };

  // ======================
  // CARGAR TODO
  // ======================
  const loadAll = async () => {
    await loadCategories();
    await loadExpenses();
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-6 fade-up" data-testid="page-gastos">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
          Operaciones
        </p>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Gastos
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          Cargá los costos de tu negocio para conocer la rentabilidad real.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <NewExpenseCard
          categories={categories}
          onCreated={loadAll}
        />

        <ExpensesHistoryCard
          expenses={expenses}
          onDeleted={loadAll}
        />
      </div>
    </div>
  );
}