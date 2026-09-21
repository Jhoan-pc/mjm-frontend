// test/challenger_tenant_isolation_loader.js
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
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

  // Intercept firebase/firestore with a rich observable spy
  if (url.includes('firebase/firestore') || url === 'firebase/firestore') {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        if (!globalThis.__firestoreSpy) {
          globalThis.__firestoreSpy = {
            docCalls: [],
            getDocCalls: [],
            collectionCalls: [],
            addDocCalls: [],
            queryCalls: [],
            whereCalls: [],
            orderByCalls: [],
            onSnapshotCalls: [],
            getDocsCalls: [],
            updateDocCalls: [],
            mockDocs: new Map(),
            reset() {
              this.docCalls = [];
              this.getDocCalls = [];
              this.collectionCalls = [];
              this.addDocCalls = [];
              this.queryCalls = [];
              this.whereCalls = [];
              this.orderByCalls = [];
              this.onSnapshotCalls = [];
              this.getDocsCalls = [];
              this.updateDocCalls = [];
              this.mockDocs.clear();
            }
          };
        }

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

        export const orderBy = (field, direction = 'asc') => {
          const clause = { _type: 'orderBy', field, direction };
          globalThis.__firestoreSpy.orderByCalls.push(clause);
          return clause;
        };

        export const query = (targetRef, ...constraints) => {
          const q = { _type: 'Query', targetRef, constraints };
          globalThis.__firestoreSpy.queryCalls.push(q);
          return q;
        };

        export const getDocs = async (queryOrCol) => {
          globalThis.__firestoreSpy.getDocsCalls.push({ queryOrCol });
          return {
            docs: [],
            empty: true
          };
        };

        export const onSnapshot = (queryOrRef, onNext, onError) => {
          globalThis.__firestoreSpy.onSnapshotCalls.push({ queryOrRef, onNext, onError });
          return () => {};
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
