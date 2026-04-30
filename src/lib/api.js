import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const formatARS = (n) => {
  const value = Number(n || 0);
  return "$ " + value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};

export function formatDateAR(date) {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR");
}

export const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
};
