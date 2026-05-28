import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let app;
let db = null;
let isConnected = false;

try {
  // Check if firebase config has valid non-placeholder values
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isConnected = true;
    console.log('Firebase initialized successfully for project:', firebaseConfig.projectId);
  } else {
    console.warn('Firebase configuration contains placeholder values. Running in Local Mock mode.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase. Running in Local Mock mode.', error);
}

export { app, db, isConnected };
