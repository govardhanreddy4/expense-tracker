import { db } from './firebase.js';
import { currentUser } from './auth.js';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

// Fallback Mock Data
let mockTransactions = [
  { id: '1', type: 'income', amount: 5000, category: 'Salary', date: new Date().toISOString(), description: 'Monthly Salary' },
  { id: '2', type: 'expense', amount: 150, category: 'Food', date: new Date().toISOString(), description: 'Groceries' },
  { id: '3', type: 'expense', amount: 60, category: 'Transport', date: new Date(Date.now() - 86400000).toISOString(), description: 'Gas' }
];

let mockListeners = [];

const notifyMockListeners = () => {
  mockListeners.forEach(fn => fn(mockTransactions));
};

export async function addTransaction(data) {
  if (!currentUser) throw new Error("Must be logged in to add transaction");

  const newTx = {
    ...data,
    userId: currentUser.uid || 'mock-user',
    createdAt: new Date().toISOString()
  };

  if (!db) {
    mockTransactions.unshift({ ...newTx, id: Math.random().toString() });
    notifyMockListeners();
    return newTx;
  }

  const txRef = await addDoc(collection(db, 'transactions'), newTx);
  return txRef.id;
}

export function subscribeToTransactions(callback) {
  if (!currentUser) return () => {};

  if (!db) {
    mockListeners.push(callback);
    callback(mockTransactions);
    return () => {
      mockListeners = mockListeners.filter(fn => fn !== callback);
    };
  }

  const q = query(
    collection(db, 'transactions'),
    where("userId", "==", currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
}

export async function deleteTransaction(id) {
  if (!db) {
    mockTransactions = mockTransactions.filter(t => t.id !== id);
    notifyMockListeners();
    return;
  }
  await deleteDoc(doc(db, 'transactions', id));
}

export async function updateTransaction(id, data) {
  if (!db) {
    const idx = mockTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      mockTransactions[idx] = { ...mockTransactions[idx], ...data };
      notifyMockListeners();
    }
    return;
  }
  await updateDoc(doc(db, 'transactions', id), data);
}
