import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import config from '../firebase-applet-config.json';
import {
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_INVENTORY,
  INITIAL_RECIPES,
  INITIAL_DEPARTMENT_DISH_ENTRIES,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { Branch, Department, User, InventoryItem, Recipe, DepartmentDishEntry, AuditLog } from './types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Firestore targeting the specific databaseId if provided
export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Seed helper if collection is empty
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`Seeding empty collection: ${collectionName}`);
      const batch = writeBatch(db);
      initialData.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      console.log(`Successfully seeded ${initialData.length} items to ${collectionName}`);
    }
  } catch (err) {
    console.error(`Error seeding collection ${collectionName}:`, err);
  }
}

// Seed all default data on init (runs ONCE EVER on a fresh database)
export async function seedInitialFirestoreData() {
  try {
    const statusRef = doc(db, 'system', 'app_status');
    const statusSnap = await getDoc(statusRef);
    if (statusSnap.exists() && statusSnap.data()?.isSeeded) {
      console.log('Firestore database already initialized and seeded. Skipping auto-seed.');
      return;
    }

    console.log('Initializing fresh database with default seed data...');
    await seedCollectionIfEmpty('branches', INITIAL_BRANCHES);
    await seedCollectionIfEmpty('departments', INITIAL_DEPARTMENTS);
    await seedCollectionIfEmpty('users', INITIAL_USERS);
    await seedCollectionIfEmpty('inventory', INITIAL_INVENTORY);
    await seedCollectionIfEmpty('recipes', INITIAL_RECIPES);
    await seedCollectionIfEmpty('dishEntries', INITIAL_DEPARTMENT_DISH_ENTRIES);
    await seedCollectionIfEmpty('auditLogs', INITIAL_AUDIT_LOGS);

    await setDoc(statusRef, {
      isSeeded: true,
      seededAt: new Date().toISOString()
    });
    console.log('Successfully marked system as seeded in Firestore.');
  } catch (err) {
    console.error('Error checking system seed status:', err);
  }
}

// Real-time collection listener helper
export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as T);
      });
      callback(items);
    },
    (error) => {
      console.error(`Error listening to collection ${collectionName}:`, error);
    }
  );
}

// Document save / update helper
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
) {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.error(`Error saving document in ${collectionName}:`, err);
    throw err;
  }
}

// Batch save helper
export async function saveDocumentBatch<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  try {
    if (items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error saving batch in ${collectionName}:`, err);
    throw err;
  }
}

// Delete document helper
export async function deleteDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, err);
    throw err;
  }
}
