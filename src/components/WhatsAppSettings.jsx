import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

/** Build a wa.me URL using the saved WhatsApp number from backend settings. */
export async function buildWhatsAppUrl(message) {
  let num = "";
  try {
    const { data } = await api.get("/settings");
    num = data?.whatsapp_number || "";
  } catch (err) {
    // Graceful degradation: fall back to generic share if settings unavailable.
    console.warn("Failed to load WhatsApp settings, using generic share:", err);
  }
  const text = encodeURIComponent(message);
  return num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
}

export default function WhatsAppSettings({ open, onOpenChange, onSaved }) {
  const [number, setNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get("/settings").then((r) => setNumber(r.data?.whatsapp_number || ""));
  }, [open]);

  const save = async () => {
    setSubmitting(true);
    try {
      const cleaned = number.replace(/[^0-9]/g, "");
      if (cleaned && cleaned.length < 8) {
        toast.error("Número demasiado corto");
        return;
      }
      const { data } = await api.put("/settings", { whatsapp_number: cleaned });
      toast.success(cleaned ? "Número guardado" : "Número eliminado");
      onSaved && onSaved(data.whatsapp_number);
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-whatsapp">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp
          </DialogTitle>
          <DialogDescription>
            Guardá tu número (con código de país, sin +) para que los resúmenes vayan directo. Se sincroniza entre tus dispositivos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="wa-number">Número con código de país</Label>
            <Input
              id="wa-number"
              type="tel"
              inputMode="numeric"
              placeholder="Ej: 5491123456789"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              data-testid="input-whatsapp-numero"
            />
            <p className="text-xs text-stone-500 mt-1.5">
              Argentina: <span className="font-mono">54 9 11 1234 5678</span> → escribí <span className="font-mono">5491112345678</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="boton-cancelar-whatsapp">Cancelar</Button>
          <Button
            onClick={save}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="boton-guardar-whatsapp"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
