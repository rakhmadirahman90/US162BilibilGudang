import React, { useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  getDocs, 
  writeBatch, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, ensureAuthenticated, handleFirestoreError, OperationType } from './firebase';

// Module-level flag to avoid spamming the same warning console message 17 times
let hasLoggedSyncOfflineWarning = false;

/**
 * Custom React hook to sync a React state list with a Firestore collection in real-time.
 * Synchronizes local state and localStorage, and seeds Firestore with initial records if empty online.
 */
export function useSyncCollection<T extends { id: string }>(
  collectionName: string,
  localState: T[],
  setLocalState: React.Dispatch<React.SetStateAction<T[]>>,
  initialStaticData: T[]
) {
  const isInitialized = useRef(false);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const startSync = async () => {
      try {
        const user = await ensureAuthenticated();
        if (!user) {
          if (!hasLoggedSyncOfflineWarning) {
            console.warn(
              "[FirebaseSync] Project is unauthenticated. Running in standard Offline / Local state. " +
              "To save and synchronize data globally in real-time, please sign-in with your Google account in-app or " +
              "enable Anonymous Authentication in your Firebase console settings."
            );
            hasLoggedSyncOfflineWarning = true;
          }
          return;
        }

        const colRef = collection(db, collectionName);
        
        // 1. Perform initial check (one-time fetch)
        const snap = await getDocs(colRef);
        
        if (snap.empty) {
          // Firestore is empty. Seed it with the current localState (which contains either cached edits or initial static data).
          const itemsToSeed = localState.length > 0 ? localState : initialStaticData;
          if (itemsToSeed.length > 0) {
            console.log(`[FirebaseSync] Seeding collection "${collectionName}" with ${itemsToSeed.length} items`);
            const batch = writeBatch(db);
            itemsToSeed.forEach(item => {
              const docRef = doc(db, collectionName, item.id);
              batch.set(docRef, item);
            });
            await batch.commit();
          }
        } else {
          // Firestore has documents. Overwrite local state with online documents.
          const onlineItems: T[] = [];
          snap.forEach(docSnap => {
            onlineItems.push(docSnap.data() as T);
          });
          setLocalState(onlineItems);
          console.log(`[FirebaseSync] Imported ${onlineItems.length} items for "${collectionName}" from Firestore`);
        }

        isInitialized.current = true;

        // 2. Setup real-time listener
        unsubscribe = onSnapshot(colRef, (snapshot) => {
          const updatedItems: T[] = [];
          snapshot.forEach(docSnap => {
            updatedItems.push(docSnap.data() as T);
          });
          
          // Only update if we have completed initialization to avoid wiping out during transition
          if (isInitialized.current) {
            setLocalState(updatedItems);
          }
        }, (error) => {
          console.error(`[FirebaseSync] Subscription error for ${collectionName}:`, error);
        });

      } catch (err) {
        console.error(`[FirebaseSync] Failed online start for ${collectionName}:`, err);
      }
    };

    startSync();

    return () => {
      unsubscribe();
    };
  }, [collectionName, initialStaticData]);
}

/**
 * Save / Update a document online in Firestore.
 */
export async function saveOnline<T extends { id: string }>(collectionName: string, item: T) {
  try {
    const user = await ensureAuthenticated();
    if (!user) return; // Silent fallback: operating in Offline / Local mode
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

/**
 * Delete a document online in Firestore.
 */
export async function deleteOnline(collectionName: string, id: string) {
  try {
    const user = await ensureAuthenticated();
    if (!user) return; // Silent fallback: operating in Offline / Local mode
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}
