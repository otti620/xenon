import { db } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PREFIX = 'xenova_fintech_prod_';
const getPrefixedTable = (tableName: string) => PREFIX + tableName;

export async function clearCollectionInFirestore(tableName: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
}

export async function syncToFirestore(tableName: string, data: any, matchKey = 'id') {
  if (!db) throw new Error('Firestore is not initialized.');
  const id = String(data[matchKey] || data.id || data.phone || 'doc_' + Date.now());
  const collectionName = getPrefixedTable(tableName);
  const docRef = doc(db, collectionName, id);
  const updatedData = { ...data, id, updatedAt: new Date().toISOString() };
  await setDoc(docRef, updatedData, { merge: true });
}

export async function fetchFromFirestore(tableName: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const querySnapshot = await getDocs(collection(db, collectionName));
  const items: any[] = [];
  querySnapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...docSnap.data() });
  });
  return items;
}

export async function getDocFromFirestore(tableName: string, id: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const docRef = doc(db, collectionName, String(id));
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function deleteFromFirestore(tableName: string, id: string) {
  if (!db) throw new Error('Firestore is not initialized.');
  const collectionName = getPrefixedTable(tableName);
  const docRef = doc(db, collectionName, String(id));
  await deleteDoc(docRef);
}

export const syncDepositToFirestore = (data: any, opt?: any) => syncToFirestore('deposits', data);
export const syncWithdrawalToFirestore = (data: any, opt?: any) => syncToFirestore('withdrawals', data);
export const syncUserToFirestore = (data: any, balance?: any) => syncToFirestore('users', data, 'phone');
export const syncInvestmentToFirestore = (data: any, opt?: any) => syncToFirestore('investments', data);
export const syncTransactionToFirestore = (data: any, opt?: any) => syncToFirestore('transactions', data);

