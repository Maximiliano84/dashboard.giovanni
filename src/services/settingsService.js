import {
    collection,
    addDoc,
    updateDoc,
    getDocs,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

// ================= GET =================
export async function getSettings() {
    const snapshot = await getDocs(collection(db, "settings"));

    if (snapshot.docs.length === 0) {
        return {
            id: null,
            fixed_costs: [],
        };
    }

    const settingsDoc = snapshot.docs[0];

    return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
    };
}

// ================= CREATE =================
export async function createSettings(data) {
    return await addDoc(collection(db, "settings"), data);
}

// ================= UPDATE =================
export async function updateSettings(id, data) {
    return await updateDoc(doc(db, "settings", id), data);
}