import { useState } from "react";
import useCostsData from "../hooks/useCostsData";

import { formatARS } from "../lib/api";
import FixedCostsCard from "../components/costs/FixedCostsCard";
import VarietyCostCard from "../components/costs/VarietyCostCard";
import CostSummaryCards from "../components/costs/CostSummaryCards";
import PizzaCostCard from "../components/costs/PizzaCostCard";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import IngredientDialog from "../components/costs/IngredientDialog";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";

export default function Costos() {
    const {
        varieties,
        recipes,
        fixedCosts,
        totalFixed,
        rentabilidad,
        updateRecipe,
        updateFixedCosts,
        getCost,
    } = useCostsData();

    // ================= MODALES =================
    const [openAdd, setOpenAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [activePizza, setActivePizza] = useState(null);

    const [openFixed, setOpenFixed] = useState(false);
    const [newFixed, setNewFixed] = useState("");

    // ================= DELETE =================
    const [toDeleteIngredient, setToDeleteIngredient] = useState(null);
    const [toDeleteFixed, setToDeleteFixed] = useState(null);

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
            <CostSummaryCards
                rentabilidad={rentabilidad}
            />

            {/* COSTOS FIJOS */}
            <FixedCostsCard
                fixedCosts={fixedCosts}
                totalFixed={totalFixed}
                formatARS={formatARS}
                onAdd={() => setOpenFixed(true)}
                onDelete={setToDeleteFixed}
                onUpdate={(idx, value) => {
                    const arr = [...fixedCosts];

                    arr[idx].cost = value;

                    updateFixedCosts(arr);
                }}
            />

            {/* PIZZAS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {varieties.map((v) => {
                    const items = recipes[v.id]?.items || [];

                    const cost = getCost(items);

                    return (
                        <VarietyCostCard
                            key={v.id}
                            variety={v}
                            items={items}
                            cost={cost}
                            onUpdateCost={(idx, value) => {
                                const rec = [...items];

                                rec[idx].cost = value;

                                updateRecipe(v.id, rec);
                            }}
                            onDeleteIngredient={({ index, name }) =>
                                setToDeleteIngredient({
                                    varietyId: v.id,
                                    index,
                                    name,
                                })
                            }
                            onOpenAddIngredient={() => {
                                setActivePizza(v.id);
                                setOpenAdd(true);
                            }}
                        />
                    );
                })}
            </div>

            {/* MODAL INGREDIENTE */}
            <IngredientDialog
                open={openAdd}
                onOpenChange={(value) => {
                    setOpenAdd(value);

                    if (!value) {
                        setNewName("");
                    }
                }}
                value={newName}
                onChange={setNewName}
                onConfirm={handleAddIngredient}
            />

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
                        autoFocus
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