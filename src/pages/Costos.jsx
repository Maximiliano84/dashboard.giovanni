
import useCostsData from "../hooks/useCostsData";
import useIngredientManager from "../hooks/useIngredientManager";
import useFixedCostsManager from "../hooks/useFixedCostsManager";

import { formatARS } from "../lib/api";

import FixedCostsCard from "../components/costs/FixedCostsCard";
import FixedCostDialog from "../components/costs/FixedCostDialog";
import CostCard from "../components/costs/CostCard";
import CostsSummary from "../components/costs/CostsSummary";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import IngredientDialog from "../components/costs/IngredientDialog";

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

    // ================= INGREDIENT MANAGER =================

    const {
        openAdd,
        setOpenAdd,

        newName,
        setNewName,

        toDeleteIngredient,
        setToDeleteIngredient,

        handleAddIngredient,
        handleOpenIngredientModal,
        handleIngredientCostChange,
        handleDeleteIngredient,
        confirmDeleteIngredient,
    } = useIngredientManager({
        recipes,
        updateRecipe,
    });

    // ================= FIXED COSTS MANAGER =================

    const {
        openFixed,
        setOpenFixed,

        newFixed,
        setNewFixed,

        toDeleteFixed,
        setToDeleteFixed,

        handleAddFixed,
        handleUpdateFixed,
        handleDeleteFixed,
        confirmDeleteFixed,
    } = useFixedCostsManager({
        fixedCosts,
        updateFixedCosts,
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                Costos
            </h1>

            {/* RESUMEN */}

            <CostsSummary
                rentabilidad={rentabilidad}
            />

            {/* COSTOS FIJOS */}

            <FixedCostsCard
                fixedCosts={fixedCosts}
                totalFixed={totalFixed}
                formatARS={formatARS}
                onAdd={() =>
                    setOpenFixed(true)
                }
                onDelete={
                    handleDeleteFixed
                }
                onUpdate={
                    handleUpdateFixed
                }
            />

            {/* PIZZAS */}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {varieties.map((v) => {
                    const items =
                        recipes[v.id]?.items || [];

                    const cost =
                        getCost(items);

                    return (
                        <CostCard
                            key={v.id}
                            variety={v}
                            items={items}
                            cost={cost}
                            onIngredientCostChange={(
                                idx,
                                value
                            ) =>
                                handleIngredientCostChange(
                                    v.id,
                                    items,
                                    idx,
                                    value
                                )
                            }
                            onDeleteIngredient={(
                                idx,
                                name
                            ) =>
                                handleDeleteIngredient(
                                    v.id,
                                    idx,
                                    name
                                )
                            }
                            onAddIngredient={() =>
                                handleOpenIngredientModal(
                                    v.id
                                )
                            }
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
                onConfirm={
                    handleAddIngredient
                }
            />

            {/* MODAL COSTO FIJO */}

            <FixedCostDialog
                open={openFixed}
                onOpenChange={(value) => {
                    setOpenFixed(value);

                    if (!value) {
                        setNewFixed("");
                    }
                }}
                value={newFixed}
                onChange={setNewFixed}
                onConfirm={handleAddFixed}
            />

            {/* DELETE INGREDIENTE */}

            <ConfirmDeleteDialog
                open={!!toDeleteIngredient}
                onClose={() =>
                    setToDeleteIngredient(
                        null
                    )
                }
                title="Eliminar ingrediente"
                description={`Eliminar "${toDeleteIngredient?.name}"`}
                onConfirm={
                    confirmDeleteIngredient
                }
            />

            {/* DELETE COSTO FIJO */}

            <ConfirmDeleteDialog
                open={!!toDeleteFixed}
                onClose={() =>
                    setToDeleteFixed(null)
                }
                title="Eliminar costo fijo"
                description={`Eliminar "${toDeleteFixed?.name}"`}
                onConfirm={
                    confirmDeleteFixed
                }
            />
        </div>
    );
}