import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export let isAnonymousAuthDisabled = false;
export let firebaseAuthError: string | null = null;
const authErrorListeners = new Set<(status: { disabled: boolean; error: string | null }) => void>();

export function subscribeAuthError(listener: (status: { disabled: boolean; error: string | null }) => void) {
  authErrorListeners.add(listener);
  listener({ disabled: isAnonymousAuthDisabled, error: firebaseAuthError });
  return () => {
    authErrorListeners.delete(listener);
  };
}

function notifyAuthError() {
  authErrorListeners.forEach(listener => listener({ disabled: isAnonymousAuthDisabled, error: firebaseAuthError }));
}

// CRITICAL CONSTRAINT: When the application initially boots, call getFromServer to test the connection.
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Auto sign-in so database works instantly, cached so 17 sequential calls do not spawn 17 operations
let authPromise: Promise<User | null> | null = null;

export const ensureAuthenticated = async (): Promise<User | null> => {
  if (auth.currentUser) return auth.currentUser;
  if (authPromise) return authPromise;

  authPromise = new Promise<User | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const creds = await signInAnonymously(auth);
          resolve(creds.user);
        } catch (err: any) {
          firebaseAuthError = err instanceof Error ? err.message : String(err);
          const isRestricted = err?.code === 'auth/admin-restricted-operation' || 
                              err?.message?.includes('admin-restricted-operation');
          
          if (isRestricted) {
            isAnonymousAuthDisabled = true;
            console.warn(
              "[Firebase] Anonymous Authentication is disabled in your Firebase Projects console. " +
              "To enable real-time synchronization without Google Sign-In, please enable Anonymous Auth in the Firebase console: " +
              "Authentication > Sign-in method > Anonymous > Enable."
            );
          } else {
            console.error("[Firebase] Anonymous Authentication failed:", err);
          }
          notifyAuthError();
          resolve(null);
        }
      }
    });
  });

  return authPromise;
};

// Google sign-in capability
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google sign-in error", error);
    throw error;
  }
};

ensureAuthenticated().then((user) => {
  if (user) {
    testConnection();
  }
}).catch(err => {
  console.error("Boot auth error:", err);
});
