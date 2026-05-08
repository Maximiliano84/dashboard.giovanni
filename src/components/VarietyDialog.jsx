import { useState, useEffect } from "react";
import {
  createVariety,
  updateVariety,
} from "../services/varietiesService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export default function VarietyDialog({ open, onOpenChange, variety, onSaved }) {
  const editing = Boolean(variety);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (open) {
      setName(variety?.name ?? "");
      setPrice(variety?.price?.toString() ?? "");
    }
  }, [open, variety]);

  const submit = async (e) => {
    e.preventDefault();

    const p = parseFloat(price);

    if (!name.trim()) {
      return toast.error("El nombre es obligatorio");
    }

    if (isNaN(p) || p < 0) {
      return toast.error("Precio inválido");
    }

    try {
      if (editing) {
        await updateVariety(variety.id, {
          name,
          price: p,
        });

        toast.success("Variedad actualizada");
      } else {
        await createVariety({
          name,
          price: p,
          created_at: new Date(),
        });

        toast.success("Variedad agregada");
      }

      onSaved && onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error("ERROR FIREBASE:", err);
      toast.error("Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-variedad">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Editar variedad" : "Nueva variedad"}
          </DialogTitle>
          <DialogDescription>
            Definí el nombre y precio unitario en pesos argentinos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="v-name">Nombre</Label>
            <Input
              id="v-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Muzzarella"
              data-testid="input-nombre-variedad"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="v-price">Precio (ARS)</Label>
            <Input
              id="v-price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              data-testid="input-precio-variedad"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              data-testid="boton-cancelar-variedad"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="boton-guardar-variedad"
            >
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}