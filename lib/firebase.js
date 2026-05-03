import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// =============================
// 🔥 FIREBASE INIT
// =============================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-auth.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-bucket.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// =============================
// 🧠 UTIL FUNCTIONS
// =============================
export function calculateRiskScore(likelihood, severity) {
  return likelihood * severity;
}

export function getRiskLevel(score) {
  if (score <= 5) return 'low';
  if (score <= 10) return 'medium';
  return 'high';
}

export function formatDate(timestamp) {
  if (!timestamp) return '-';

  const date = timestamp?.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// =============================
// 📦 ADD DOCUMENT
// =============================
export async function addDocument(collectionName, data) {
  try {
    console.log('Submitting Data:', data);

    const now = new Date();

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    console.log('Document Added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error addDocument:', error);
    throw error;
  }
}

// =============================
// ✏️ UPDATE DOCUMENT
// =============================
export async function updateDocument(collectionName, id, data) {
  try {
    console.log('Updating Data:', id, data);

    const docRef = doc(db, collectionName, id);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('Document Updated:', id);
  } catch (error) {
    console.error('Error updateDocument:', error);
    throw error;
  }
}

// =============================
// ❌ DELETE DOCUMENT
// =============================
export async function deleteDocument(collectionName, id) {
  try {
    console.log('Deleting:', id);

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);

    console.log('Deleted:', id);
  } catch (error) {
    console.error('Error deleteDocument:', error);
    throw error;
  }
}

// =============================
// 📥 GET DOCUMENTS (ONE TIME)
// =============================
export async function getDocuments(collectionName, filters = {}) {
  try {
    console.log('Fetching:', collectionName, filters);

    let q = collection(db, collectionName);
    let conditions = [];

    if (filters.createdBy) {
      conditions.push(where('createdBy', '==', filters.createdBy));
    }

    if (filters.month) {
      conditions.push(where('month', '==', Number(filters.month)));
    }

    if (filters.year) {
      conditions.push(where('year', '==', Number(filters.year)));
    }

    if (filters.type) {
      conditions.push(where('type', '==', filters.type));
    }

    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }

    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error getDocuments:', error);
    throw error;
  }
}

// =============================
// 🔴 REAL-TIME SUBSCRIBE
// =============================
export function subscribeToCollection(collectionName, callback, filters = {}) {
  try {
    console.log('Subscribing:', collectionName, filters);

    let q = collection(db, collectionName);
    let conditions = [];

    if (filters.createdBy) {
      conditions.push(where('createdBy', '==', filters.createdBy));
    }

    if (filters.month) {
      conditions.push(where('month', '==', Number(filters.month)));
    }

    if (filters.year) {
      conditions.push(where('year', '==', Number(filters.year)));
    }

    if (filters.type) {
      conditions.push(where('type', '==', filters.type));
    }

    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }

    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Realtime Update:', data.length);
      callback(data);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribe:', error);
    throw error;
  }
}

// =============================
// 🖼 IMAGE UPLOAD
// =============================
export async function uploadImage(file) {
  try {
    console.log('Uploading Image:', file.name);

    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    console.log('Image Uploaded:', url);
    return url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}
// 👉 Reports (used in dashboards)
export async function getReports(filters = {}) {
  return await getDocuments('reports', filters);
}

// 👉 Risk Assessments (used in dashboards)
export async function getRiskAssessments(filters = {}) {
  return await getDocuments('riskAssessments', filters);
}

// =============================
// EXPORTS
// =============================
export async function createReport(data) {
  return await addDoc(collection(db, 'reports'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateReport(id, data) {
  const refDoc = doc(db, 'reports', id);
  return await updateDoc(refDoc, data);
}

export async function deleteReport(id) {
  const refDoc = doc(db, 'reports', id);
  return await deleteDoc(refDoc);
}

export function subscribeToReports(callback) {
  const q = collection(db, 'reports');

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
}
export { db, storage };