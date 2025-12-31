// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHS9elQsquaFEntgNf_zjHU1EQBL8g5QI",
  authDomain: "omkar-b1a87.firebaseapp.com",
  projectId: "omkar-b1a87",
  storageBucket: "omkar-b1a87.firebasestorage.app",
  messagingSenderId: "940754456974",
  appId: "1:940754456974:web:60608c5b1d32d4426c14df",
  measurementId: "G-RWN5L8Z7EG"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

if (typeof window !== "undefined") {
  // Initialize Analytics only in browser
  analytics = getAnalytics(app);
}

export { app, auth, analytics };

