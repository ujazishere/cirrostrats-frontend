// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  // TODO ismail: VHP move this api key to env file. This is a security risk.
  apiKey: "AIzaSyBAS7T-rH8qyx8bHEeHU236EejjVzM4us8",
  authDomain: "cirrostrats-feedback.firebaseapp.com",
  databaseURL: "https://cirrostrats-feedback-default-rtdb.firebaseio.com",
  projectId: "cirrostrats-feedback",
  storageBucket: "cirrostrats-feedback.firebasestorage.app",
  messagingSenderId: "336778488203",
  appId: "1:336778488203:web:3b6781119869782e9ea78e",
  measurementId: "G-6J27P35GQT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
