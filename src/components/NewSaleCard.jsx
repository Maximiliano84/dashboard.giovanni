import { useMemo, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatARS, todayISO } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Pizza, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";


import { Link } from "react-router-dom";

export default function NewSaleCard({ varieties, onCreated }) {
  const [varietyId, setVarietyId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => varieties.find((v) => String(v.id) === String(varietyId)),
    [varieties, varietyId]
  );
  const total = selected ? selected.price * Math.max(0, parseInt(quantity || 0)) : 0;

  const submit = async (e) => {
    e.preventDefault();

    if (!varietyId) return toast.error("Elegí una variedad");

    const q = parseInt(quantity);
    if (!q || q <= 0) return toast.error("Cantidad inválida");

    const selected = varieties.find(v => v.id === varietyId);

    if (!selected) return toast.error("Variedad inválida");

    const unitPrice = selected.price;
    const total = unitPrice * q;

    setSubmitting(true);

    try {
      await addDoc(collection(db, "sales"), {
        variety_name: selected.name,
        created_at: new Date(),
        variety_id: varietyId,
        unit_price: unitPrice,
        quantity: q,
        total: total,
        date: date
      });

      toast.success("Venta registrada");

      setVarietyId("");
      setQuantity(1);
      setDate(todayISO());

      onCreated && onCreated();

    } catch (err) {
      console.error(err);
      toast.error("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col self-start">
      <CardHeader><CardTitle className="font-display text-base text-stone-800">Nueva venta</CardTitle></CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {varieties.length === 0 ? (
          <NoVarieties />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <VarietyField varieties={varieties} value={varietyId} onChange={setVarietyId} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qty">Cantidad</Label>
                <Input id="qty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="input-cantidad-venta" />
              </div>
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-fecha-venta" />
              </div>
            </div>

            <TotalPreview total={total} />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 hover:bg-orange-700"
              data-testid="boton-registrar-venta"
            >
              <Plus className="w-4 h-4 mr-1" /> {submitting ? "Registrando..." : "Registrar venta"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function VarietyField({ varieties, value, onChange }) {
  return (
    <div>
      <Label>Variedad</Label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md p-2"
      >
        <option value="">Elegí una pizza</option>

        {varieties.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} — ${v.price}
          </option>
        ))}
      </select>
    </div>
  );
}

function TotalPreview({ total }) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 flex items-center justify-between" data-testid="preview-total-venta">
      <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Total</span>
      <span className="font-mono-num text-xl font-semibold text-stone-900">{formatARS(total)}</span>
    </div>
  );
}

function NoVarieties() {
  return (
    <div className="text-center py-8">
      <Pizza className="w-8 h-8 mx-auto text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">Aún no tenés variedades cargadas.</p>
      <Link to="/variedades">
        <Button className="mt-4 bg-orange-600 hover:bg-orange-700" data-testid="boton-ir-variedades">
          Ir a Variedades <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
