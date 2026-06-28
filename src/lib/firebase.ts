import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPMkenO4KoMdilq5YbXgudbFMPqd6tpfc",
  authDomain: "marine-lattice-0wr9b.firebaseapp.com",
  projectId: "marine-lattice-0wr9b",
  storageBucket: "marine-lattice-0wr9b.firebasestorage.app",
  messagingSenderId: "667412643606",
  appId: "1:667412643606:web:68337be090d5e649d2da37"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const databaseId = "ai-studio-ed89a177-6d07-48fe-81b0-adbb3d746992";
export const db = getFirestore(app, databaseId);
