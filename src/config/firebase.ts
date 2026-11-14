
import {
  cert,
  getApp,
  getApps,
  initializeApp
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.js";

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });

export const firestore = getFirestore(firebaseApp);

console.log("Firebase initialized successfully");
