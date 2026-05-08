import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase";

// ================= GET =================
export async function getSales() {
    const snapshot = await getDocs(collection(db, "sales"));

    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    }));
}