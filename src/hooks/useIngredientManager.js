import { useState } from "react";

export default function useIngredientManager({
    recipes,
    updateRecipe,
}) {
    const [openAdd, setOpenAdd] =
        useState(false);

    const [newName, setNewName] =
        useState("");

    const [activePizza, setActivePizza] =
        useState(null);

    const [
        toDeleteIngredient,
        setToDeleteIngredient,
    ] = useState(null);

    // ================= ADD =================

    const handleAddIngredient =
        async () => {
            if (!newName.trim()) return;

            const rec =
                recipes[activePizza]?.items ||
                [];

            await updateRecipe(
                activePizza,
                [
                    ...rec,
                    {
                        name: newName,
                        cost: 0,
                    },
                ]
            );

            setNewName("");
            setOpenAdd(false);
        };

    // ================= OPEN MODAL =================

    const handleOpenIngredientModal = (
        varietyId
    ) => {
        setActivePizza(varietyId);
        setOpenAdd(true);
    };

    // ================= UPDATE COST =================

    const handleIngredientCostChange =
        (
            varietyId,
            items,
            idx,
            value
        ) => {
            const rec = [...items];

            rec[idx].cost = value;

            updateRecipe(varietyId, rec);
        };

    // ================= DELETE =================

    const handleDeleteIngredient = (
        varietyId,
        idx,
        name
    ) => {
        setToDeleteIngredient({
            varietyId,
            index: idx,
            name,
        });
    };

    const confirmDeleteIngredient =
        async () => {
            if (!toDeleteIngredient) return;

            const {
                varietyId,
                index,
            } = toDeleteIngredient;

            const items =
                recipes[varietyId]?.items ||
                [];

            const updated = items.filter(
                (_, i) => i !== index
            );

            await updateRecipe(
                varietyId,
                updated
            );

            setToDeleteIngredient(null);
        };

    return {
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
    };
}