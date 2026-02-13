
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// These should be configured in your Firebase Project Settings
// In this environment, we use process.env mapping
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Will be replaced by actual env in production
  authDomain: "home-kitchen-ua.firebaseapp.com",
  projectId: "home-kitchen-ua",
  storageBucket: "home-kitchen-ua.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
