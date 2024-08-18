// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABvi7AWWTY6KTsla3HLVyr0ZjSW3YRffE",
  authDomain: "rn-learn-english-app.firebaseapp.com",
  projectId: "rn-learn-english-app",
  storageBucket: "rn-learn-english-app.appspot.com",
  messagingSenderId: "343237133742",
  appId: "1:343237133742:web:660e854c7c4ac9b49d743f",
  measurementId: "G-BT6081E30M"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore();