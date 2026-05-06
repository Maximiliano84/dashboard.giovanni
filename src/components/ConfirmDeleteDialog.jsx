import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";

import { Button } from "./ui/button";

export default function ConfirmDeleteDialog({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "Confirmar",
    description = "¿Estás seguro?",
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}