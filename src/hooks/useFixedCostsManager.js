import { useState, useCallback } from "react";

export default function useFixedCostsManager({
    fixedCosts,
    updateFixedCosts,
}) {
    const [openFixed, setOpenFixed] =
        useState(false);

    const [newFixed, setNewFixed] =
        useState("");

    const [toDeleteFixed, setToDeleteFixed] =
        useState(null);

    // ================= ADD =================

    const handleAddFixed = useCallback(
        async () => {
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
        },

        [
            newFixed,
            fixedCosts,
            updateFixedCosts,
        ]
    );

    // ================= UPDATE =================

    const handleUpdateFixed =
        useCallback(
            (idx, value) => {
                const arr = [...fixedCosts];

                arr[idx].cost = value;

                updateFixedCosts(arr);
            },

            [
                fixedCosts,
                updateFixedCosts,
            ]
        );

    // ================= DELETE =================

    const handleDeleteFixed =
        useCallback((idx, name) => {
            setToDeleteFixed({
                index: idx,
                name,
            });
        }, []);

    const confirmDeleteFixed =
        useCallback(async () => {
            if (!toDeleteFixed) return;

            const updated =
                fixedCosts.filter(
                    (_, i) =>
                        i !==
                        toDeleteFixed.index
                );

            await updateFixedCosts(
                updated
            );

            setToDeleteFixed(null);
        }, [
            toDeleteFixed,
            fixedCosts,
            updateFixedCosts,
        ]);

    return {
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
    };
}