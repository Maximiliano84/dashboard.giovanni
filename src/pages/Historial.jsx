import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";
import { Trash2 } from "lucide-react";

export default function Historial() {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all"); // all | sale | expense
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");   // YYYY-MM-DD

  // ---------- helpers ----------
  const normalizeDate = (d) => {
    if (!d) return null;
    if (d?.toDate) return d.toDate().toISOString().slice(0, 10);
    if (typeof d === "string") return d.slice(0, 10);
    return null;
  };

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  // ---------- load ----------
  const loadData = async () => {
    const [salesSnap, expSnap] = await Promise.all([
      getDocs(collection(db, "sales")),
      getDocs(collection(db, "expenses")),
    ]);

    const sales = salesSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        type: "sale",
        name: d.variety_name || "Venta",
        quantity: d.quantity || 0,
        amount: d.total || 0,
        date: normalizeDate(d.date || d.created_at),
      };
    });

    const expenses = expSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        type: "expense",
        name: d.category_name || "Gasto",
        quantity: "-",
        amount: d.amount || 0,
        date: normalizeDate(d.date || d.created_at),
      };
    });

    const merged = [...sales, ...expenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setItems(merged);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------- filtros ----------
  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (!inRange(i.date)) return false;
      return true;
    });
  }, [items, typeFilter, from, to]);

  // ---------- resumen ----------
  const resumen = useMemo(() => {
    let ventas = 0;
    let gastos = 0;
    let countSales = 0;
    let countExpenses = 0;

    filtered.forEach((i) => {
      if (i.type === "sale") {
        ventas += i.amount;
        countSales++;
      } else {
        gastos += i.amount;
        countExpenses++;
      }
    });

    return {
      ventas,
      gastos,
      ganancia: ventas - gastos,
      countSales,
      countExpenses,
    };
  }, [filtered]);

  // ---------- eliminar ----------
  const remove = async (item) => {
    const ok = window.confirm("¿Eliminar registro?");
    if (!ok) return;

    const collectionName = item.type === "sale" ? "sales" : "expenses";
    await deleteDoc(doc(db, collectionName, item.id));

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6 fade-up">
      <h1 className="text-2xl font-bold">Historial</h1>

      {/* 🔍 FILTROS */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-stone-500">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block border rounded-lg px-3 py-1.5"
          >
            <option value="all">Todos</option>
            <option value="sale">Ventas</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-stone-500">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block border rounded-lg px-3 py-1.5"
          />
        </div>

        <div>
          <label className="text-xs text-stone-500">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block border rounded-lg px-3 py-1.5"
          />
        </div>

        <button
          onClick={() => {
            setTypeFilter("all");
            setFrom("");
            setTo("");
          }}
          className="text-sm text-stone-500 underline"
        >
          Limpiar
        </button>
      </div>

      {/* 📊 RESUMEN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Ventas" value={formatARS(resumen.ventas)} sub={`${resumen.countSales} ops`} color="emerald" />
        <SummaryCard title="Gastos" value={formatARS(resumen.gastos)} sub={`${resumen.countExpenses} ops`} color="rose" />
        <SummaryCard
          title="Ganancia"
          value={formatARS(resumen.ganancia)}
          sub={
            resumen.ganancia > 0
              ? "Positivo"
              : resumen.ganancia < 0
                ? "Negativo"
                : "Sin movimientos"
          }
          color={
            resumen.ganancia > 0
              ? "emerald"
              : resumen.ganancia < 0
                ? "rose"
                : "amber"
          }
        />
        <SummaryCard title="Movimientos" value={filtered.length.toString()} sub="total" color="orange" />
      </div>

      {/* 📋 TABLA */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-right">Cant.</th>
              <th className="p-3 text-right">Monto</th>
              <th className="p-3 text-left">Fecha</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b hover:bg-stone-50">
                <td className="p-3">{i.type === "sale" ? "Venta" : "Gasto"}</td>
                <td className="p-3 font-medium">{i.name}</td>
                <td className="p-3 text-right">{i.quantity}</td>
                <td
                  className={`p-3 text-right font-semibold ${i.type === "sale"
                      ? "text-emerald-600"
                      : "text-rose-600"
                    }`}
                >
                  {i.type === "sale" ? "+" : "-"} {formatARS(i.amount)}
                </td>
                <td className="p-3 text-stone-500">
                  {formatDateAR(i.date)}
                </td>
                <td className="p-3">
                  <button onClick={() => remove(i)}>
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-stone-500">
            Sin resultados
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- mini card resumen ----------
function SummaryCard({ title, value, sub, color }) {
  const colors = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-xs text-stone-500">{title}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-stone-400">{sub}</p>
    </div>
  );
}