import { useEffect, useState, useMemo } from "react";
import {
    collection,
    getDocs,
    updateDoc,
    addDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";
import { formatARS } from "../lib/api";

import { Trash2 } from "lucide-react";

import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";

export default function Costos() {
    const [varieties, setVarieties] = useState([]);
    const [recipes, setRecipes] = useState({});
    const [settingsId, setSettingsId] = useState(null);
    const [fixedCosts, setFixedCosts] = useState([]);
    const [sales, setSales] = useState([]);

    // ================= MODALES =================
    const [openAdd, setOpenAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [activePizza, setActivePizza] = useState(null);

    const [openFixed, setOpenFixed] = useState(false);
    const [newFixed, setNewFixed] = useState("");

    // ================= DELETE =================
    const [toDeleteIngredient, setToDeleteIngredient] = useState(null);
    const [toDeleteFixed, setToDeleteFixed] = useState(null);

    // ================= LOAD =================
    useEffect(() => {
        const load = async () => {
            const [vSnap, rSnap, sSnap, salesSnap] = await Promise.all([
                getDocs(collection(db, "varieties")),
                getDocs(collection(db, "recipes")),
                getDocs(collection(db, "settings")),
                getDocs(collection(db, "sales")),
            ]);

            const v = vSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            const r = {};

            rSnap.docs.forEach((d) => {
                const data = d.data();

                r[data.variety_id] = {
                    id: d.id,
                    items: data.items || [],
                };
            });

            let fc = [];
            let sid = null;

            if (sSnap.docs.length > 0) {
                const data = sSnap.docs[0];

                fc = data.data().fixed_costs || [];
                sid = data.id;
            }

            const s = salesSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            setVarieties(v);
            setRecipes(r);
            setFixedCosts(fc);
            setSettingsId(sid);
            setSales(s);
        };

        load();
    }, []);

    // ================= FIXED COSTS =================
    const updateFixedCosts = async (newCosts) => {
        setFixedCosts(newCosts);

        if (settingsId) {
            await updateDoc(doc(db, "settings", settingsId), {
                fixed_costs: newCosts,
            });
        } else {
            const ref = await addDoc(collection(db, "settings"), {
                fixed_costs: newCosts,
            });

            setSettingsId(ref.id);
        }
    };

    const totalFixed = fixedCosts.reduce(
        (acc, c) => acc + (c.cost || 0),
        0
    );

    // ================= RECIPES =================
    const updateRecipe = async (varietyId, items) => {
        const rec = recipes[varietyId];

        if (rec?.id) {
            await updateDoc(doc(db, "recipes", rec.id), {
                items,
            });

            setRecipes((prev) => ({
                ...prev,
                [varietyId]: {
                    ...rec,
                    items,
                },
            }));
        } else {
            const ref = await addDoc(collection(db, "recipes"), {
                variety_id: varietyId,
                items,
            });

            setRecipes((prev) => ({
                ...prev,
                [varietyId]: {
                    id: ref.id,
                    items,
                },
            }));
        }
    };

    const getCost = (items = []) => {
        const local = items.reduce(
            (acc, i) => acc + (i.cost || 0),
            0
        );

        return local + totalFixed;
    };

    // ================= RENTABILIDAD =================
    const rentabilidad = useMemo(() => {
        let totalVentas = 0;
        let totalGanancia = 0;
        let totalPizzas = 0;

        sales.forEach((s) => {
            const variety = varieties.find(
                (v) => v.id === s.variety_id
            );

            if (!variety) return;

            const items = recipes[variety.id]?.items || [];
            const costo = getCost(items);

            const precio =
                s.unit_price || variety.price || 0;

            const cantidad = s.quantity || 0;

            const ingreso = precio * cantidad;
            const ganancia =
                (precio - costo) * cantidad;

            totalVentas += ingreso;
            totalGanancia += ganancia;
            totalPizzas += cantidad;
        });

        return {
            promedioGanancia: totalPizzas
                ? totalGanancia / totalPizzas
                : 0,

            margenPromedio: totalVentas
                ? (totalGanancia / totalVentas) * 100
                : 0,
        };
    }, [sales, varieties, recipes, totalFixed]);

    // ================= ADD INGREDIENT =================
    const handleAddIngredient = async () => {
        if (!newName.trim()) return;

        const rec = recipes[activePizza]?.items || [];

        await updateRecipe(activePizza, [
            ...rec,
            {
                name: newName,
                cost: 0,
            },
        ]);

        setNewName("");
        setOpenAdd(false);
    };

    // ================= ADD FIXED =================
    const handleAddFixed = async () => {
        if (!newFixed.trim()) return;

        await updateFixedCosts([
            ...fixedCosts,
            {
                name: newFixed,
                cost: 0,
            },
        ]);

        setNewFixed("");
        setOpenFixed(false);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                Costos
            </h1>

            {/* RESUMEN */}
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
                        {rentabilidad.margenPromedio.toFixed(
                            1
                        )}
                        %
                    </p>
                </div>
            </div>

            {/* COSTOS FIJOS */}
            <div className="bg-white border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold">
                        Costos fijos
                    </h2>

                    <button
                        onClick={() => setOpenFixed(true)}
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
                                onChange={(e) => {
                                    const arr = [...fixedCosts];

                                    arr[idx].cost =
                                        Number(e.target.value) || 0;

                                    updateFixedCosts(arr);
                                }}
                                className="border rounded px-2 py-1 w-24 text-right"
                            />

                            <button
                                onClick={() =>
                                    setToDeleteFixed({
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

            {/* PIZZAS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {varieties.map((v) => {
                    const items =
                        recipes[v.id]?.items || [];

                    const cost = getCost(items);

                    const profit = v.price - cost;

                    const margin =
                        v.price > 0
                            ? (profit / v.price) * 100
                            : 0;

                    return (
                        <div
                            key={v.id}
                            className="bg-white border rounded-xl p-4"
                        >
                            <h2 className="font-bold">
                                {v.name}
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
                                            onChange={(e) => {
                                                const rec = [...items];

                                                rec[idx].cost =
                                                    Number(e.target.value) || 0;

                                                updateRecipe(v.id, rec);
                                            }}
                                            className="border rounded px-2 py-1 w-20 text-right"
                                        />

                                        <button
                                            onClick={() =>
                                                setToDeleteIngredient({
                                                    varietyId: v.id,
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
                                onClick={() => {
                                    setActivePizza(v.id);
                                    setOpenAdd(true);
                                }}
                                className="text-orange-600 text-sm mt-2"
                            >
                                + Agregar ingrediente
                            </button>

                            <hr className="my-2" />

                            <p>
                                Precio: {formatARS(v.price)}
                            </p>

                            <p>
                                Costo: {formatARS(cost)}
                            </p>

                            <p className="text-green-600 font-semibold">
                                Ganancia:{" "}
                                {formatARS(profit)}
                            </p>

                            <p
                                className={`text-sm font-semibold ${margin >= 50
                                        ? "text-emerald-600"
                                        : margin >= 30
                                            ? "text-amber-600"
                                            : "text-red-600"
                                    }`}
                            >
                                Margen:{" "}
                                {margin.toFixed(1)}%
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* MODAL INGREDIENTE */}
            <Dialog
                open={openAdd}
                onOpenChange={setOpenAdd}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Nuevo ingrediente
                        </DialogTitle>
                    </DialogHeader>

                    <input
                        value={newName}
                        onChange={(e) =>
                            setNewName(e.target.value)
                        }
                        placeholder="Ej: muzzarella"
                        className="border rounded px-3 py-2 w-full"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddIngredient();
                            }
                        }}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => {
                                setOpenAdd(false);
                                setNewName("");
                            }}
                            className="px-3 py-2 text-sm rounded-lg hover:bg-stone-100"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleAddIngredient}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Agregar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL COSTO FIJO */}
            <Dialog
                open={openFixed}
                onOpenChange={setOpenFixed}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Nuevo costo fijo
                        </DialogTitle>
                    </DialogHeader>

                    <input
                        value={newFixed}
                        onChange={(e) =>
                            setNewFixed(e.target.value)
                        }
                        placeholder="Ej: caja"
                        className="border rounded px-3 py-2 w-full"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddFixed();
                            }
                        }}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => {
                                setOpenFixed(false);
                                setNewFixed("");
                            }}
                            className="px-3 py-2 text-sm rounded-lg hover:bg-stone-100"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleAddFixed}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Agregar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DELETE INGREDIENTE */}
            <ConfirmDeleteDialog
                open={!!toDeleteIngredient}
                onClose={() =>
                    setToDeleteIngredient(null)
                }
                title="Eliminar ingrediente"
                description={`Eliminar "${toDeleteIngredient?.name}"`}
                onConfirm={() => {
                    const { varietyId, index } =
                        toDeleteIngredient;

                    const items =
                        recipes[varietyId]?.items || [];

                    const updated = items.filter(
                        (_, i) => i !== index
                    );

                    updateRecipe(varietyId, updated);

                    setToDeleteIngredient(null);
                }}
            />

            {/* DELETE COSTO FIJO */}
            <ConfirmDeleteDialog
                open={!!toDeleteFixed}
                onClose={() =>
                    setToDeleteFixed(null)
                }
                title="Eliminar costo fijo"
                description={`Eliminar "${toDeleteFixed?.name}"`}
                onConfirm={() => {
                    const updated = fixedCosts.filter(
                        (_, i) =>
                            i !== toDeleteFixed.index
                    );

                    updateFixedCosts(updated);

                    setToDeleteFixed(null);
                }}
            />
        </div>
    );
}