import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

import { todayISO } from "../lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

import { Receipt, Plus } from "lucide-react";
import { toast } from "sonner";

export default function NewExpenseCard({ categories, onCreated }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const submit = async (e) => {
    e.preventDefault();

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return toast.error("Monto inválido");
    }

    if (!categoryId) {
      return toast.error("Elegí una categoría");
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "expenses"), {
        description,
        amount: value,
        date,
        category_id: categoryId,
        category_name: selectedCategory.name, // 🔥 clave
        created_at: new Date(),
      });

      toast.success("Gasto registrado");

      // reset
      setDescription("");
      setAmount("");
      setCategoryId("");
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
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Nuevo gasto</CardTitle>
      </CardHeader>

      <CardContent>
        {categories.length === 0 ? (
          <EmptyState />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {/* CATEGORÍA */}
            <div>
              <Label>Categoría</Label>

              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí una categoría" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* DESCRIPCIÓN */}
            <div>
              <Label>Descripción</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}

              />
            </div>

            {/* MONTO */}
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>



            {/* FECHA */}
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* BOTÓN */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {submitting ? "Guardando..." : "Registrar gasto"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================
// EMPTY STATE
// ==========================
function EmptyState() {
  return (
    <div className="text-center py-8">
      <Receipt className="w-8 h-8 mx-auto text-stone-400" />
      <p className="text-sm text-stone-500 mt-3">
        Primero creá categorías para cargar gastos.
      </p>
    </div>
  );
}