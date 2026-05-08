import { formatARS } from "../../lib/api";

export default function CostSummaryCards({ rentabilidad }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-stone-500">
                    Ganancia promedio
                </p>

                <p className="text-xl font-bold text-emerald-600">
                    {formatARS(
                        rentabilidad.promedioGanancia
                    )}
                </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-stone-500">
                    Margen promedio
                </p>

                <p className="text-xl font-bold text-orange-600">
                    {rentabilidad.margenPromedio.toFixed(1)}%
                </p>
            </div>
        </div>
    );
}