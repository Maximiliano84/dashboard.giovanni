import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

export default function FormDialog({
    open,
    onOpenChange,

    title,

    children,

    confirmText = "Guardar",
    cancelText = "Cancelar",

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
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {children}

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="px-3 py-2 text-sm rounded-lg hover:bg-stone-100"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}