import { Trash2 } from "lucide-react";
import { formatARS } from "../../lib/api";

export default function PizzaCostCard({
    variety,
    items,
    cost,
    onIngredientCostChange,
    onDeleteIngredient,
    onOpenAddIngredient,
}) {
    const profit = variety.price - cost;

    const margin =
        variety.price > 0
            ? (profit / variety.price) * 100
            : 0;

    return (
        <div className="bg-white border rounded-xl p-4">
            <h2 className="font-bold">
                {variety.name}
            </h2>

            {items.map((it, idx) => (
                <div
                    key={idx}
                    className="flex justify-between items-center"
                >
                    <span>{it.name}</span>

                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={it.cost}
                            onChange={(e) =>
                                onIngredientCostChange(
                                    idx,
                                    Number(e.target.value) || 0
                                )
                            }
                            className="border rounded px-2 py-1 w-20 text-right"
                        />

                        <button
                            onClick={() =>
                                onDeleteIngredient({
                                    index: idx,
                                    name: it.name,
                                })
                            }
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={onOpenAddIngredient}
                className="text-orange-600 text-sm mt-2"
            >
                + Agregar ingrediente
            </button>

            <hr className="my-2" />

            <p>
                Precio: {formatARS(variety.price)}
            </p>

            <p>
                Costo: {formatARS(cost)}
            </p>

            <p className="text-green-600 font-semibold">
                Ganancia: {formatARS(profit)}
            </p>

            <p
                className={`text-sm font-semibold ${margin >= 50
                        ? "text-emerald-600"
                        : margin >= 30
                            ? "text-amber-600"
                            : "text-red-600"
                    }`}
            >
                Margen: {margin.toFixed(1)}%
            </p>
        </div>
    );
}