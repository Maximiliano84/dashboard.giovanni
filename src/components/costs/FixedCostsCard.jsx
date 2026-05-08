import { Trash2 } from "lucide-react";

export default function FixedCostsCard({
    fixedCosts,
    totalFixed,
    formatARS,
    onAdd,
    onUpdate,
    onDelete,
}) {
    return (
        <div className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="font-bold">
                    Costos fijos
                </h2>

                <button
                    onClick={onAdd}
                    className="text-orange-600 text-sm"
                >
                    + Agregar
                </button>
            </div>

            {fixedCosts.map((c, idx) => (
                <div
                    key={idx}
                    className="flex justify-between items-center"
                >
                    <span>{c.name}</span>

                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={c.cost}
                            onChange={(e) =>
                                onUpdate(
                                    idx,
                                    Number(e.target.value) || 0
                                )
                            }
                            className="border rounded px-2 py-1 w-24 text-right"
                        />

                        <button
                            onClick={() =>
                                onDelete({
                                    index: idx,
                                    name: c.name,
                                })
                            }
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                </div>
            ))}

            <p className="font-semibold">
                Total fijo:{" "}
                {formatARS(totalFixed)}
            </p>
        </div>
    );
}