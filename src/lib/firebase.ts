import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfmdgQc-iTX7CytsQpZeq6OoVBFxdHWi0",
  authDomain: "xenova-fa6c5.firebaseapp.com",
  projectId: "xenova-fa6c5",
  storageBucket: "xenova-fa6c5.firebasestorage.app",
  messagingSenderId: "641028699008",
  appId: "1:641028699008:web:7c70974188309eb681c765"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
