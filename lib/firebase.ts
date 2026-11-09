'use client'

import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(config).every(Boolean)

export function getFirebaseServices() {
  if (!firebaseConfigured) {
    throw new Error('Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* values from your Firebase project.')
  }

  const app = getApps().length ? getApp() : initializeApp(config)
  return {
    app,
    auth: getAuth(app),
    db: initializeFirestore(app, { experimentalAutoDetectLongPolling: true }),
    storage: getStorage(app),
  }
}
