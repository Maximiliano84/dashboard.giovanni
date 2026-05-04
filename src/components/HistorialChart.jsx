import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

export default function HistorialChart({ data }) {
    return (
        <div className="bg-white border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-700 mb-2">
                Rendimiento
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#f97316" // orange
                        strokeWidth={2}
                    />

                    <Line
                        type="monotone"
                        dataKey="gastos"
                        stroke="#ef4444" // red
                        strokeWidth={2}
                    />

                    <Line
                        type="monotone"
                        dataKey="ganancia"
                        stroke="#10b981" // green
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}