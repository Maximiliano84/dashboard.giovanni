import {
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import {
    getVarieties,
} from "../services/varietiesService";

import {
    getRecipes,
    createRecipe,
    updateRecipe as updateRecipeService,
} from "../services/recipesService";

import {
    getSettings,
    createSettings,
    updateSettings,
} from "../services/settingsService";

import {
    getSales,
} from "../services/salesService";

export default function useCostsData() {
    const [varieties, setVarieties] =
        useState([]);

    const [recipes, setRecipes] =
        useState({});

    const [settingsId, setSettingsId] =
        useState(null);

    const [fixedCosts, setFixedCosts] =
        useState([]);

    const [sales, setSales] = useState([]);

    // ================= LOAD =================

    const load = async () => {
        const [
            varietiesData,
            recipesData,
            settingsData,
            salesData,
        ] = await Promise.all([
            getVarieties(),
            getRecipes(),
            getSettings(),
            getSales(),
        ]);

        setVarieties(varietiesData);

        setRecipes(recipesData);

        setFixedCosts(
            settingsData.fixed_costs || []
        );

        setSettingsId(settingsData.id);

        setSales(salesData);
    };

    useEffect(() => {
        load();
    }, []);

    // ================= FIXED COSTS =================

    const updateFixedCosts =
        async (newCosts) => {
            setFixedCosts(newCosts);

            if (settingsId) {
                await updateSettings(
                    settingsId,
                    {
                        fixed_costs:
                            newCosts,
                    }
                );
            } else {
                const ref =
                    await createSettings({
                        fixed_costs:
                            newCosts,
                    });

                setSettingsId(ref.id);
            }
        };

    // ================= RECIPES =================

    const updateRecipe = async (
        varietyId,
        items
    ) => {
        const rec = recipes[varietyId];

        if (rec?.id) {
            await updateRecipeService(
                rec.id,
                {
                    items,
                }
            );

            setRecipes((prev) => ({
                ...prev,

                [varietyId]: {
                    ...rec,
                    items,
                },
            }));
        } else {
            const ref =
                await createRecipe({
                    variety_id:
                        varietyId,

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

    // ================= CALCULOS =================

    const totalFixed =
        fixedCosts.reduce(
            (acc, c) =>
                acc + (c.cost || 0),
            0
        );

    const getCost = useCallback(
        (items = []) => {
            const local =
                items.reduce(
                    (acc, i) =>
                        acc +
                        (i.cost || 0),
                    0
                );

            return (
                local + totalFixed
            );
        },

        [totalFixed]
    );

    // ================= RENTABILIDAD =================

    const rentabilidad = useMemo(() => {
        let totalVentas = 0;

        let totalGanancia = 0;

        let totalPizzas = 0;

        sales.forEach((s) => {
            const variety =
                varieties.find(
                    (v) =>
                        v.id ===
                        s.variety_id
                );

            if (!variety) return;

            const items =
                recipes[variety.id]
                    ?.items || [];

            const costo =
                getCost(items);

            const precio =
                s.unit_price ||
                variety.price ||
                0;

            const cantidad =
                s.quantity || 0;

            const ingreso =
                precio * cantidad;

            const ganancia =
                (precio - costo) *
                cantidad;

            totalVentas += ingreso;

            totalGanancia +=
                ganancia;

            totalPizzas += cantidad;
        });

        return {
            promedioGanancia:
                totalPizzas
                    ? totalGanancia /
                    totalPizzas
                    : 0,

            margenPromedio:
                totalVentas
                    ? (totalGanancia /
                        totalVentas) *
                    100
                    : 0,
        };
    }, [
        sales,
        varieties,
        recipes,
        getCost,
    ]);

    return {
        varieties,
        recipes,
        fixedCosts,
        sales,

        totalFixed,
        rentabilidad,

        updateRecipe,
        updateFixedCosts,
        getCost,

        reload: load,
    };
}