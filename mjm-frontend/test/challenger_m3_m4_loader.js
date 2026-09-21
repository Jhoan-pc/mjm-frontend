// test/challenger_m3_m4_loader.js
import { pathToFileURL } from 'node:url';

// Global mocks for browser objects needed by stores
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const mockLocal = new MockStorage();
const mockSession = new MockStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocal,
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'localStorage', {
  value: mockLocal,
  configurable: true,
  writable: true
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockSession,
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'sessionStorage', {
  value: mockSession,
  configurable: true,
  writable: true
});

if (!globalThis.document) {
  globalThis.document = {
    documentElement: {
      style: {
        setProperty: () => {},
        getPropertyValue: () => ''
      }
    },
    title: ''
  };
}
if (!globalThis.window) {
  globalThis.window = globalThis;
}

export async function resolve(specifier, context, nextResolve) {
  // Intercept images and CSS assets
  if (/\.(png|jpe?g|svg|gif|webp|css)$/i.test(specifier)) {
    return {
      shortCircuit: true,
      url: `mock-asset://${specifier}`
    };
  }

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    try {
      return await nextResolve(specifier, context);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        try {
          return await nextResolve(specifier + '.js', context);
        } catch (_) {
          try {
            return await nextResolve(specifier + '.jsx', context);
          } catch (_) {}
        }
      }
      throw err;
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('mock-asset://')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default "mocked-asset-url";'
    };
  }

  // Mock src/config/firebase.js
  if (url.includes('/config/firebase') || url.includes('\\config\\firebase')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        export const db = { _type: 'MOCKED_FIRESTORE_DB' };
        export const auth = { _type: 'MOCKED_AUTH' };
        export const storage = { _type: 'MOCKED_STORAGE' };
        export const firebaseConfig = {};
        export default { db, auth, storage };
      `
    };
  }

  // Intercept firebase/auth
  if (url.includes('firebase/auth') || url === 'firebase/auth') {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        if (!globalThis.__authSpy) {
          globalThis.__authSpy = {
            onAuthStateChangedCalls: [],
            unsubCalls: 0,
            activeCallback: null,
            reset() {
              this.onAuthStateChangedCalls = [];
              this.unsubCalls = 0;
              this.activeCallback = null;
            }
          };
        }

        export const signInWithEmailAndPassword = async () => ({ user: { uid: 'test-user-123' } });
        export const signOut = async () => {};
        export const onAuthStateChanged = (auth, callback) => {
          globalThis.__authSpy.activeCallback = callback;
          const callRecord = { auth, callback, unsubscribed: false };
          globalThis.__authSpy.onAuthStateChangedCalls.push(callRecord);
          const unsub = () => {
            callRecord.unsubscribed = true;
            globalThis.__authSpy.unsubCalls++;
          };
          return unsub;
        };
        export const getAuth = () => ({ _type: 'MOCKED_AUTH' });
      `
    };
  }

  // Intercept firebase/firestore with listener lifecycle spy
  if (url.includes('firebase/firestore') || url === 'firebase/firestore') {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        if (!globalThis.__firestoreSpy) {
          globalThis.__firestoreSpy = {
            listenersCreated: [],
            unsubExecutions: [],
            docCalls: [],
            getDocCalls: [],
            collectionCalls: [],
            addDocCalls: [],
            queryCalls: [],
            whereCalls: [],
            getDocsCalls: [],
            updateDocCalls: [],
            mockDocs: new Map(),
            reset() {
              this.listenersCreated = [];
              this.unsubExecutions = [];
              this.docCalls = [];
              this.getDocCalls = [];
              this.collectionCalls = [];
              this.addDocCalls = [];
              this.queryCalls = [];
              this.whereCalls = [];
              this.getDocsCalls = [];
              this.updateDocCalls = [];
              this.mockDocs.clear();
            }
          };
        }

        let listenerIdCounter = 0;

        export const doc = (db, ...pathSegments) => {
          const path = pathSegments.join('/');
          const ref = { _type: 'DocumentReference', db, path, segments: pathSegments };
          globalThis.__firestoreSpy.docCalls.push({ db, segments: pathSegments, path });
          return ref;
        };

        export const getDoc = async (docRef) => {
          globalThis.__firestoreSpy.getDocCalls.push({ docRef });
          const stored = globalThis.__firestoreSpy.mockDocs.get(docRef.path);
          if (stored) {
            return {
              id: docRef.segments[docRef.segments.length - 1],
              exists: () => true,
              data: () => stored
            };
          }
          return {
            id: docRef.segments[docRef.segments.length - 1],
            exists: () => false,
            data: () => null
          };
        };

        export const collection = (db, ...pathSegments) => {
          const path = pathSegments.join('/');
          const colRef = { _type: 'CollectionReference', db, path, segments: pathSegments };
          globalThis.__firestoreSpy.collectionCalls.push({ db, segments: pathSegments, path });
          return colRef;
        };

        export const addDoc = async (colRef, data) => {
          const id = 'mock_doc_' + Math.random().toString(36).substring(2, 9);
          const docPath = colRef.path + '/' + id;
          globalThis.__firestoreSpy.addDocCalls.push({ colRef, data, id, docPath });
          globalThis.__firestoreSpy.mockDocs.set(docPath, data);
          return { id, path: docPath };
        };

        export const serverTimestamp = () => ({ _type: 'SERVER_TIMESTAMP', value: new Date().toISOString() });

        export const where = (field, op, val) => {
          const clause = { _type: 'where', field, op, val };
          globalThis.__firestoreSpy.whereCalls.push(clause);
          return clause;
        };

        export const query = (targetRef, ...constraints) => {
          const q = { _type: 'Query', targetRef, constraints };
          globalThis.__firestoreSpy.queryCalls.push(q);
          return q;
        };

        export const getDocs = async (queryOrCol) => {
          globalThis.__firestoreSpy.getDocsCalls.push({ queryOrCol });
          return { docs: [], empty: true };
        };

        export const onSnapshot = (queryOrRef, onNext, onError) => {
          const id = ++listenerIdCounter;
          const record = {
            id,
            queryOrRef,
            onNext,
            onError,
            active: true,
            createdAt: Date.now()
          };
          globalThis.__firestoreSpy.listenersCreated.push(record);

          const unsub = () => {
            record.active = false;
            record.unsubscribedAt = Date.now();
            globalThis.__firestoreSpy.unsubExecutions.push({ id, queryOrRef, record });
          };
          return unsub;
        };

        export const updateDoc = async (docRef, data) => {
          globalThis.__firestoreSpy.updateDocCalls.push({ docRef, data });
          return true;
        };

        export const setDoc = async (docRef, data) => {
          globalThis.__firestoreSpy.mockDocs.set(docRef.path, data);
          return true;
        };

        export const deleteDoc = async (docRef) => {
          globalThis.__firestoreSpy.mockDocs.delete(docRef.path);
          return true;
        };
      `
    };
  }

  return nextLoad(url, context);
}
