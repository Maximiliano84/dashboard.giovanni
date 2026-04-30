import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";

import { ShoppingCart, Wallet, Coins, Pizza, Receipt } from "lucide-react";
import { Button } from "../components/ui/button";
import StatCard from "../components/StatCard";
import { TrendChart, TopVarietiesChart } from "../components/Charts";
import { RecentSalesCard } from "../components/RecentSalesList";
import CierreCaja from "../components/CierreCaja";

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cierreOpen, setCierreOpen] = useState(false);
  const [period, setPeriod] = useState("today");

  const today = new Date().toISOString().slice(0, 10);

  // ======================
  // NORMALIZAR FECHA
  // ======================
  const normalizeDate = (d) => {
    if (!d) return null;
    if (typeof d === "string") return d;
    if (d?.toDate) return d.toDate().toISOString().slice(0, 10);
    return null;
  };

  // ======================
  // HELPERS DE PERIODO
  // ======================
  const isSameDay = (dateStr) => dateStr === today;

  const isThisWeek = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();

    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - now.getDay());

    return d >= firstDay && d <= now;
  };

  const isThisMonth = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();

    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isThisYear = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();

    return d.getFullYear() === now.getFullYear();
  };

  const filterByPeriod = (item) => {
    const d = normalizeDate(item.date);
    if (!d) return false;

    if (period === "today") return isSameDay(d);
    if (period === "week") return isThisWeek(d);
    if (period === "month") return isThisMonth(d);
    if (period === "year") return isThisYear(d);

    return false;
  };

  // ======================
  // CARGA FIREBASE
  // ======================
  const loadData = async () => {
    try {
      const [salesSnap, varSnap, expSnap] = await Promise.all([
        getDocs(collection(db, "sales")),
        getDocs(collection(db, "varieties")),
        getDocs(collection(db, "expenses")),
      ]);

      const varietiesData = varSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const salesData = salesSnap.docs.map((doc) => {
        const d = doc.data();

        const variety = varietiesData.find(
          (v) => v.id === d.variety_id
        );

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

      const expensesData = expSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSales(salesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-stone-500">Cargando...</div>;

  // ======================
  // MÉTRICAS FILTRADAS
  // ======================
  const ventasFiltradas = sales.filter(filterByPeriod);
  const gastosFiltrados = expenses.filter(filterByPeriod);

  const totalVentas = ventasFiltradas.reduce((acc, s) => acc + s.total, 0);
  const totalGastos = gastosFiltrados.reduce(
    (acc, e) => acc + (e.amount || 0),
    0
  );

  const ganancia = totalVentas - totalGastos;

  const pizzas = ventasFiltradas.reduce(
    (acc, s) => acc + (s.quantity || 0),
    0
  );

  // ======================
  // TREND
  // ======================
  const trendMap = {};

  ventasFiltradas.forEach((sale) => {
    const date = normalizeDate(sale.date);
    if (!date) return;

    if (!trendMap[date]) {
      trendMap[date] = { date, sales: 0 };
    }

    trendMap[date].sales += sale.total;
  });

  const trendData = Object.values(trendMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // ======================
  // TOP VARIEDADES
  // ======================
  const topMap = {};

  ventasFiltradas.forEach((sale) => {
    const name = sale.variety_name || "Sin nombre";

    if (!topMap[name]) {
      topMap[name] = { quantity: 0 };
    }

    topMap[name].quantity += sale.quantity;
  });

  const topVarieties = Object.entries(topMap)
    .map(([name, data]) => ({
      variety_name: name,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // ======================
  // RECIENTES
  // ======================
  const recentSales = [...sales]
    .sort((a, b) => {
      const da = a.created_at?.toDate
        ? a.created_at.toDate()
        : new Date(a.created_at);

      const db = b.created_at?.toDate
        ? b.created_at.toDate()
        : new Date(b.created_at);

      return db - da;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 fade-up">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Panel general
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Tu pizzería de un vistazo
          </h1>

          {/* FILTROS */}
          <div className="flex gap-2 mt-3">
            {[
              { key: "today", label: "Hoy" },
              { key: "week", label: "Semana" },
              { key: "month", label: "Mes" },
              { key: "year", label: "Año" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm ${period === p.key
                    ? "bg-orange-600 text-white"
                    : "bg-stone-100 text-stone-600"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-stone-500">
            Hoy: {formatDateAR(new Date())}
          </div>

          <Button
            onClick={() => setCierreOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Receipt className="w-4 h-4 mr-1" />
            Cierre de caja
          </Button>
        </div>
      </header>

      <CierreCaja open={cierreOpen} onOpenChange={setCierreOpen} />

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ventas hoy"
          value={formatARS(totalVentas)}
          sub={`${ventasFiltradas.length} operaciones`}
          icon={ShoppingCart}
          accent="orange"
        />

        <StatCard
          label="Gastos hoy"
          value={formatARS(totalGastos)}
          sub={`${gastosFiltrados.length} registrados`}
          icon={Wallet}
          accent="rose"
        />

        <StatCard
          label="Ganancia hoy"
          value={formatARS(ganancia)}
          sub={ganancia >= 0 ? "Positivo" : "Negativo"}
          icon={Coins}
          accent={ganancia >= 0 ? "emerald" : "rose"}
        />

        <StatCard
          label="Pizzas vendidas hoy"
          value={pizzas.toString()}
          sub="unidades"
          icon={Pizza}
          accent="amber"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart data={trendData} />
        </div>
        <TopVarietiesChart data={topVarieties} />
      </div>

      {/* RECIENTES */}
      <RecentSalesCard sales={recentSales} />
    </div>
  );
}