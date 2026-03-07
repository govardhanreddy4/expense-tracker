import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCLmXOvhSNA6Vox9jBV6IIWPvJkiKdScSI",
  authDomain: "expense-tracker-629e4.firebaseapp.com",
  projectId: "expense-tracker-629e4",
  storageBucket: "expense-tracker-629e4.firebasestorage.app",
  messagingSenderId: "1020620608576",
  appId: "1:1020620608576:web:dde3ffa7c808f79e86bba5",
  measurementId: "G-YSHXH07KLY"
};

// Initialize Firebase
let app, auth, db;

try {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    throw new Error("Placeholder API key detected in config.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase not initialized. Using mock data. Please add your real config to src/utils/firebase.js if you want actual cloud storage.");
}

export { app, auth, db };
