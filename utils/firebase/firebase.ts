// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';    
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore} from 'firebase/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "rn-learn-english-app",
  storageBucket: "rn-learn-english-app.appspot.com",
  messagingSenderId: "343237133742",
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: "G-BT6081E30M"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth

const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


//Initialize Firebase Firestore and get a reference to the service
const db = getFirestore(firebaseApp);


export {auth, db};