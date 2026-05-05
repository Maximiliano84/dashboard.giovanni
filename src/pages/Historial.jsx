import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatARS } from "../lib/api";
import { Trash2 } from "lucide-react";
import HistorialChart from "../components/HistorialChart";

export default function Historial() {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const isSingleDay = from && to && from === to;
  const hasFilters = from || to;

  // ---------- helpers ----------
  const normalizeDate = (d) => {
    if (!d) return null;
    if (d?.toDate) return d.toDate().toISOString().slice(0, 10);
    if (typeof d === "string") return d.slice(0, 10);
    return null;
  };

  // ---------- load desde Firebase ----------
  const loadData = async () => {
    if (!hasFilters) {
      setItems([]);
      return;
    }

    try {
      let salesQuery = collection(db, "sales");
      let expensesQuery = collection(db, "expenses");

      // 🔥 aplicar filtros reales
      if (from && to) {
        salesQuery = query(
          salesQuery,
          where("date", ">=", from),
          where("date", "<=", to)
        );

        expensesQuery = query(
          expensesQuery,
          where("date", ">=", from),
          where("date", "<=", to)
        );
      }

      const [salesSnap, expSnap] = await Promise.all([
        getDocs(salesQuery),
        getDocs(expensesQuery),
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
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [from, to]);

  // ---------- filtro tipo ----------
  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      return true;
    });
  }, [items, typeFilter]);

  // ---------- resumen ----------
  const resumen = useMemo(() => {
    let ventas = 0;
    let gastos = 0;
    let pizzas = 0;

    filtered.forEach((i) => {
      if (i.type === "sale") {
        ventas += i.amount;
        pizzas += i.quantity || 0;
      } else {
        gastos += i.amount;
      }
    });

    return {
      ventas,
      gastos,
      ganancia: ventas - gastos,
      pizzas,
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

  // ---------- chart ----------
  const chartData = useMemo(() => {
    const map = {};

    filtered.forEach((i) => {
      if (!i.date) return;

      if (!map[i.date]) {
        map[i.date] = {
          date: i.date,
          ventas: 0,
          gastos: 0,
        };
      }

      if (i.type === "sale") {
        map[i.date].ventas += i.amount;
      } else {
        map[i.date].gastos += i.amount;
      }
    });

    return Object.values(map)
      .map((d) => ({
        ...d,
        ganancia: d.ventas - d.gastos,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // ---------- UI ----------
  return (
    <div className="space-y-6 fade-up">
      <h1 className="text-2xl font-bold">Historial</h1>

      {/* FILTROS */}
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
            setItems([]);
          }}
          className="text-sm text-stone-500 underline"
        >
          Limpiar
        </button>
      </div>

      {/* RESUMEN */}
      {hasFilters && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Ventas" value={formatARS(resumen.ventas)} color="emerald" />
            <SummaryCard title="Gastos" value={formatARS(resumen.gastos)} color="rose" />
            <SummaryCard
              title="Ganancia"
              value={formatARS(resumen.ganancia)}
              color={
                resumen.ganancia > 0
                  ? "emerald"
                  : resumen.ganancia < 0
                    ? "rose"
                    : "amber"
              }
            />
            <SummaryCard title="Pizzas vendidas" value={resumen.pizzas.toString()} color="orange" />
          </div>

          <HistorialChart data={chartData} />
        </>
      )}

      {/* TABLA SOLO 1 DIA */}
      {isSingleDay && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b hover:bg-stone-50">
                  <td className="p-3">{i.name}</td>
                  <td className="p-3 text-right">{i.quantity}</td>
                  <td
                    className={`p-3 text-right font-semibold ${i.type === "sale"
                      ? "text-emerald-600"
                      : "text-rose-600"
                      }`}
                  >
                    {i.type === "sale"
                      ? `+ ${formatARS(i.amount)}`
                      : `- ${formatARS(i.amount)}`}
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
      )}

      {!hasFilters && (
        <div className="text-center text-stone-400">
          Seleccioná una fecha para ver el historial
        </div>
      )}
    </div>
  );
}

// ---------- card ----------
function SummaryCard({ title, value, color }) {
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
    </div>
  );
}