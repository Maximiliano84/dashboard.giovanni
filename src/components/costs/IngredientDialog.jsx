import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

export default function IngredientDialog({
    open,
    onOpenChange,
    value,
    onChange,
    onConfirm,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Nuevo ingrediente
                    </DialogTitle>
                </DialogHeader>

                <input
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    placeholder="Ej: muzzarella"
                    className="border rounded px-3 py-2 w-full"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onConfirm();
                        }
                    }}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="px-3 py-2 text-sm rounded-lg hover:bg-stone-100"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Agregar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}