import { useEffect, useMemo, useState } from "react";

import {
    collection,
    getDocs,
    updateDoc,
    addDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

export default function useCostsData() {
    const [varieties, setVarieties] = useState([]);
    const [recipes, setRecipes] = useState({});
    const [settingsId, setSettingsId] = useState(null);
    const [fixedCosts, setFixedCosts] = useState([]);
    const [sales, setSales] = useState([]);

    // ================= LOAD =================

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const [
            vSnap,
            rSnap,
            sSnap,
            salesSnap,
        ] = await Promise.all([
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

    // ================= FIXED COSTS =================

    const updateFixedCosts = async (
        newCosts
    ) => {
        setFixedCosts(newCosts);

        if (settingsId) {
            await updateDoc(
                doc(
                    db,
                    "settings",
                    settingsId
                ),
                {
                    fixed_costs: newCosts,
                }
            );
        } else {
            const ref = await addDoc(
                collection(db, "settings"),
                {
                    fixed_costs: newCosts,
                }
            );

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
            await updateDoc(
                doc(db, "recipes", rec.id),
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
            const ref = await addDoc(
                collection(db, "recipes"),
                {
                    variety_id: varietyId,
                    items,
                }
            );

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

    const totalFixed = fixedCosts.reduce(
        (acc, c) => acc + (c.cost || 0),
        0
    );

    const getCost = (items = []) => {
        const local = items.reduce(
            (acc, i) =>
                acc + (i.cost || 0),
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
                (v) =>
                    v.id === s.variety_id
            );

            if (!variety) return;

            const items =
                recipes[variety.id]?.items ||
                [];

            const costo = getCost(items);

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
            totalGanancia += ganancia;
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
        totalFixed,
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