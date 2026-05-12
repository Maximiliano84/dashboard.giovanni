import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const formatARS = (n) => {
  const value = Number(n || 0);
  return "$ " + value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};

export function formatDateAR(date) {
  if (!date) return "-";

  // Firestore Timestamp
  if (typeof date?.toDate === "function") {
    return date
      .toDate()
      .toLocaleDateString("es-AR");
  }

  // String YYYY-MM-DD
  if (typeof date === "string") {
    const [year, month, day] =
      date.split("-");

    const d = new Date(
      year,
      month - 1,
      day
    );

    return d.toLocaleDateString(
      "es-AR"
    );
  }

  // Date normal
  return new Date(date)
    .toLocaleDateString("es-AR");
}

export const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
};
