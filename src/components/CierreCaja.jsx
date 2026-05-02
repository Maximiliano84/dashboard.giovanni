import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, formatDateAR } from "../lib/api";
import jsPDF from "jspdf";

export default function CierreCaja({ open, onOpenChange }) {
  const [data, setData] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const normalizeDate = (d) => {
    if (!d) return null;
    if (d?.toDate) return d.toDate().toISOString().slice(0, 10);
    if (typeof d === "string") return d;
    return null;
  };

  const load = async () => {
    const [salesSnap, expSnap] = await Promise.all([
      getDocs(collection(db, "sales")),
      getDocs(collection(db, "expenses")),
    ]);

    const sales = salesSnap.docs.map(d => d.data());
    const expenses = expSnap.docs.map(d => d.data());

    const ventasHoy = sales.filter(s => normalizeDate(s.date) === today);
    const gastosHoy = expenses.filter(e => normalizeDate(e.date) === today);

    const totalVentas = ventasHoy.reduce((acc, s) => acc + (s.total || 0), 0);
    const totalGastos = gastosHoy.reduce((acc, e) => acc + (e.amount || 0), 0);

    setData({
      ventas: totalVentas,
      gastos: totalGastos,
      ganancia: totalVentas - totalGastos,
      countVentas: ventasHoy.length,
      countGastos: gastosHoy.length,
    });
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  // 📄 PDF
  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Cierre de Caja", 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${formatDateAR(new Date())}`, 20, 30);

    doc.text(`Ventas: ${formatARS(data.ventas)}`, 20, 50);
    doc.text(`Gastos: ${formatARS(data.gastos)}`, 20, 60);
    doc.text(`Ganancia: ${formatARS(data.ganancia)}`, 20, 70);

    doc.text(`Operaciones ventas: ${data.countVentas}`, 20, 90);
    doc.text(`Operaciones gastos: ${data.countGastos}`, 20, 100);

    doc.save("cierre-caja.pdf");
  };

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Cierre de caja</h2>

        <div className="space-y-2 text-sm">
          <p>Ventas: <b>{formatARS(data.ventas)}</b></p>
          <p>Gastos: <b>{formatARS(data.gastos)}</b></p>
          <p>
            Ganancia:{" "}
            <b className={
              data.ganancia > 0
                ? "text-emerald-600"
                : data.ganancia < 0
                  ? "text-rose-600"
                  : "text-amber-600"
            }>
              {formatARS(data.ganancia)}
            </b>
          </p>

          <hr className="my-3" />

          <p>Ventas registradas: {data.countVentas}</p>
          <p>Gastos registrados: {data.countGastos}</p>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => onOpenChange(false)}
            className="px-3 py-1.5 rounded-lg bg-stone-100"
          >
            Cerrar
          </button>

          <button
            onClick={generarPDF}
            className="px-3 py-1.5 rounded-lg bg-orange-600 text-white"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}