import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

// ================= GET =================
export async function getVarieties() {
    const snapshot = await getDocs(collection(db, "varieties"));

    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    }));
}

// ================= CREATE =================
export async function createVariety(data) {
    return await addDoc(collection(db, "varieties"), data);
}

// ================= UPDATE =================
export async function updateVariety(id, data) {
    return await updateDoc(doc(db, "varieties", id), data);
}

// ================= DELETE =================
export async function deleteVariety(id) {
    return await deleteDoc(doc(db, "varieties", id));
}