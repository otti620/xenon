import { db } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PREFIX = 'xenova_fintech_prod_';
const getPrefixedTable = (tableName: string) => PREFIX + tableName;

// Firestore Read Caching Layer to dramatically prevent hitting daily read quota limits
const cacheStore: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 25000; // 25 seconds cache TTL

export function invalidateFirestoreCache(tableName?: string) {
  if (tableName) {
    const collectionName = getPrefixedTable(tableName);
    Object.keys(cacheStore).forEach((key) => {
      if (key.startsWith(collectionName)) {
        delete cacheStore[key];
      }
    });
  } else {
    Object.keys(cacheStore).forEach((key) => delete cacheStore[key]);
  }
}

export async function clearCollectionInFirestore(tableName: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
  invalidateFirestoreCache(tableName);
}

export async function syncToFirestore(tableName: string, data: any, matchKey = 'id') {
  if (!db) throw new Error('Firestore is not initialized.');
  const id = String(data[matchKey] || data.id || data.phone || 'doc_' + Date.now());
  const collectionName = getPrefixedTable(tableName);
  const docRef = doc(db, collectionName, id);
  const updatedData = { ...data, id, updatedAt: new Date().toISOString() };
  await setDoc(docRef, updatedData, { merge: true });
  invalidateFirestoreCache(tableName);
}

export async function fetchFromFirestore(tableName: string, forceRefresh = false) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const cacheKey = collectionName + '_all';
  const now = Date.now();

  if (!forceRefresh && cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return cacheStore[cacheKey].data;
  }

  const querySnapshot = await getDocs(collection(db, collectionName));
  const items: any[] = [];
  querySnapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...docSnap.data() });
  });

  cacheStore[cacheKey] = { data: items, timestamp: now };
  return items;
}

export async function getDocFromFirestore(tableName: string, id: string, forceRefresh = false) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const cacheKey = `${collectionName}_doc_${id}`;
  const now = Date.now();

  if (!forceRefresh && cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return cacheStore[cacheKey].data;
  }

  const docRef = doc(db, collectionName, String(id));
  const docSnap = await getDoc(docRef);
  let result = null;
  if (docSnap.exists()) {
    result = { id: docSnap.id, ...docSnap.data() };
  }

  cacheStore[cacheKey] = { data: result, timestamp: now };
  return result;
}

export async function deleteFromFirestore(tableName: string, id: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const docRef = doc(db, collectionName, String(id));
  await deleteDoc(docRef);
  invalidateFirestoreCache(tableName);
}

export const syncDepositToFirestore = (data: any, opt?: any) => syncToFirestore('deposits', data);
export const syncWithdrawalToFirestore = (data: any, opt?: any) => syncToFirestore('withdrawals', data);
export const syncUserToFirestore = (data: any, balance?: any) => syncToFirestore('users', data, 'phone');
export const syncInvestmentToFirestore = (data: any, opt?: any) => syncToFirestore('investments', data);
export const syncTransactionToFirestore = (data: any, opt?: any) => syncToFirestore('transactions', data);
