
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDnLchyoLb8_y6hNjzC2vvq3NfO9LxX6us",
    authDomain: "pizzeria-giovanni.firebaseapp.com",
    projectId: "pizzeria-giovanni",
    storageBucket: "pizzeria-giovanni.firebasestorage.app",
    messagingSenderId: "517704576954",
    appId: "1:517704576954:web:a129743b3f43b3027ef783"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);