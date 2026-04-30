import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

/** Generic data-fetching hook with stable refresh callback */
function useResource(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(path);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [path, ...deps]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

// 🔥 DASHBOARD MOCKEADO (SIN BACKEND)
export function useDashboardData() {
  const [state, setState] = useState({
    summary: null,
    trends: [],
    topVarieties: [],
    breakdown: [],
    recentSales: [],
  });

  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      setState({
        summary: {
          today: {
            start: new Date().toISOString(),
            total_sales: 15000,
            sales_count: 12,
            total_expenses: 4000,
            expenses_count: 3,
            profit: 11000,
            quantity_sold: 28,
          },
          week: {
            total_sales: 80000,
            total_expenses: 25000,
            profit: 55000,
            sales_count: 60,
            quantity_sold: 120,
            expenses_count: 15,
          },
          month: {
            total_sales: 300000,
            total_expenses: 100000,
            profit: 200000,
            sales_count: 240,
            quantity_sold: 500,
            expenses_count: 60,
          },
        },
        trends: [
          { date: "01/04", sales: 10000 },
          { date: "02/04", sales: 12000 },
          { date: "03/04", sales: 8000 },
          { date: "04/04", sales: 15000 },
        ],
        topVarieties: [
          {
            variety_id: 1,
            variety_name: "Muzzarella",
            quantity: 40,
            revenue: 40000,
          },
          {
            variety_id: 2,
            variety_name: "Napolitana",
            quantity: 25,
            revenue: 25000,
          },
          {
            variety_id: 3,
            variety_name: "Fugazzeta",
            quantity: 20,
            revenue: 20000,
          },
        ],
        breakdown: [
          {
            category_id: 1,
            category_name: "Ingredientes",
            amount: 3000,
          },
          {
            category_id: 2,
            category_name: "Servicios",
            amount: 1000,
          },
        ],
        recentSales: [
          {
            id: 1,
            total: 2500,
            quantity: 3,
            date: new Date().toISOString(),
          },
          {
            id: 2,
            total: 1800,
            quantity: 2,
            date: new Date().toISOString(),
          },
        ],
      });

      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, loading, refresh };
}

// 🔽 LO DEMÁS LO DEJAMOS IGUAL (para futuro backend)

export function useHistoricalData(date, period) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(
        `/stats/historical?date=${date}&period=${period}`
      );
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [date, period]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

export function useVarieties() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "varieties"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(list);
    } catch (err) {
      console.error("Error loading varieties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, refresh: load };
}

export function useExpenseCategories() {
  return useResource("/expense-categories");
}

export function useSalesList(limit = 200) {
  return useResource(`/sales?limit=${limit}`, [limit]);
}

export function useExpensesList(limit = 200) {
  return useResource(`/expenses?limit=${limit}`, [limit]);
}

export function useSettings() {
  const [data, setData] = useState({ whatsapp_number: "" });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/settings");
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (whatsapp_number) => {
    const { data: res } = await api.put("/settings", { whatsapp_number });
    setData(res);
    return res;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings: data, loading, refresh, save };
}