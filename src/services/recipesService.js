import {
    collection,
    addDoc,
    updateDoc,
    getDocs,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

// ================= GET =================
export async function getRecipes() {
    const snapshot = await getDocs(collection(db, "recipes"));

    const recipes = {};

    snapshot.docs.forEach((docItem) => {
        const data = docItem.data();

        recipes[data.variety_id] = {
            id: docItem.id,
            items: data.items || [],
        };
    });

    return recipes;
}

// ================= CREATE =================
export async function createRecipe(data) {
    return await addDoc(collection(db, "recipes"), data);
}

// ================= UPDATE =================
export async function updateRecipeService(id, data) {
    return await updateDoc(doc(db, "recipes", id), data);
}