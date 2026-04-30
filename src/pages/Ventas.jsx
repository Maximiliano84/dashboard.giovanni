import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import NewSaleCard from "../components/NewSaleCard";
import SalesHistoryCard from "../components/SalesHistoryCard";

export default function Ventas() {
  const [varieties, setVarieties] = useState([]);
  const [sales, setSales] = useState([]);

  // ✅ cargar variedades
  const loadVarieties = async () => {
    const snap = await getDocs(collection(db, "varieties"));

    const data = snap.docs.map(doc => {
      const d = doc.data();

      const variety = varieties.find(v => v.id === d.variety_id);

      const unit_price = d.unit_price || variety?.price || 0;
      const quantity = d.quantity || 0;

      return {
        id: doc.id,
        ...d,
        variety_name: d.variety_name || variety?.name || "Sin nombre",
        unit_price,
        total: d.total || unit_price * quantity,
      };
    });

    console.log("VARIETIES:", data); // 👈 DEBUG
    setVarieties(data);
  };

  // ✅ cargar ventas ORDENADAS
  const loadSales = async () => {
    const q = query(
      collection(db, "sales"),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("SALES:", data); // 👈 DEBUG
    setSales(data);
  };

  // ✅ cargar todo
  const loadAll = async () => {
    await loadVarieties();
    await loadSales();
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ventas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <NewSaleCard varieties={varieties} onCreated={loadAll} />
        <SalesHistoryCard
          sales={sales}
          onDeleted={(id) => {
            setSales(prev => prev.filter(s => s.id !== id));
          }}
        />
      </div>
    </div>
  );
}