import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const seedIngredients = async () => {
    try {
        const data = [
            { name: "Harina", unit: "kg", cost_per_unit: 800 },
            { name: "Muzzarella", unit: "kg", cost_per_unit: 4000 },
            { name: "Salsa", unit: "kg", cost_per_unit: 1200 },
            { name: "Caja pizza", unit: "unidad", cost_per_unit: 500 },
        ];

        for (const item of data) {
            await addDoc(collection(db, "ingredients"), item);
            console.log("👉 cargando:", item);
        }

        console.log("✅ Ingredientes cargados");
    } catch (err) {
        console.error("❌ Error:", err);
    }
};

console.log("🔥 ejecutando seed...");