# Informe de Auditoría de Seguridad Multi-Tenant (R1) y Ciclo de Vida React (R3)

**Investigador:** Explorer 1 (Security & React Lifecycle)  
**Fecha:** 2026-09-21  
**Repositorio:** `mjm-frontend`  
**Directorio de Trabajo:** `.agents/explorer_survey_1`  

---

## 1. Observation (Observaciones Directas de Código)

A continuación se detallan los hallazgos observados en el código fuente tras la inspección exhaustiva de consultas Firestore, referencias Firebase Storage, reglas de seguridad y ciclo de vida de suscripciones `onSnapshot`.

### 1.1 R1: Seguridad Lógica y Aislamiento Multi-Tenant

#### Obs 1.1.1 — Consulta a Colección Raíz Global `inventario_metrologico` sin `tenantId`
- **Archivo:** `src/services/instruments.js`
- **Líneas:** 5–11
```javascript
export const instrumentsService = {
  getInstrumentById: async (id) => {
    try {
      const snap = await getDoc(doc(db, 'inventario_metrologico', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
...
```
- **Detalle:** `instrumentsService.getInstrumentById` consulta directamente `doc(db, 'inventario_metrologico', id)` en la raíz de Firestore en lugar de la subcolección canónica `doc(db, 'tenants', tenantId, 'inventario_metrologico', id)`. Carece de parámetro `tenantId` y de filtro de aislamiento.

#### Obs 1.1.2 — Inyección de Instrumentos en Colección Raíz en Script de Datos
- **Archivo:** `src/data/seedData.js`
- **Líneas:** 54–66
```javascript
export const seedInstruments = async (tenantId) => {
  console.log(`Iniciando siembra masiva de 40 instrumentos para ${tenantId}...`);
  let count = 0;
  for (const inst of INSTRUMENTS_SEED) {
    try {
      await addDoc(collection(db, 'inventario_metrologico'), {
        ...inst,
        tenantId,
        codigoMJM: `MJM-DC-${String(count+1).padStart(3, '0')}`,
        ubicacion: count % 2 === 0 ? 'Planta de Producción - Sector A' : 'Laboratorio de Calidad - Piso 2',
        createdAt: serverTimestamp()
      });
...
```
- **Detalle:** `seedInstruments` inserta registros en la colección raíz `inventario_metrologico` en vez de `collection(db, 'tenants', tenantId, 'inventario_metrologico')`.

#### Obs 1.1.3 — Fuga de Información en Solicitudes de Chatbot (`chatbot_submissions`)
- **Archivo:** `src/pages/dashboard/ChatbotSubmissions.jsx`
- **Líneas:** 10–22
```javascript
  const tenant = useAuthStore(state => state.tenant);

  useEffect(() => {
    // Escuchar en tiempo real las solicitudes del chatbot
    const q = query(collection(db, 'chatbot_submissions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
```
- **Archivo Vinculado:** `src/App.jsx`
- **Línea:** 81
```javascript
<Route path="solicitudes" element={<ChatbotSubmissions />} />
```
- **Detalle:** La consulta en `ChatbotSubmissions.jsx` lee toda la colección `chatbot_submissions` sin filtrar por `tenantId`. En `App.jsx`, la ruta `/dashboard/solicitudes` está montada bajo el layout privado general sin restricción de rol (`isSuperAdmin`). Cualquier usuario de cualquier tenant corporativo autenticado puede acceder a la URL y visualizar datos de contacto comercial, teléfonos, correos y requerimientos de clientes de toda la plataforma.

#### Obs 1.1.4 — Desbordamiento de Consultas Globales y Escalación de Privilegios en Árbol de Jerarquías
- **Archivo:** `src/components/HierarchyTree.jsx`
- **Líneas:** 183–199, 210–220, 379–389, 426–437, 477–481
```javascript
// Líneas 185-188:
let tenantsQuery = collection(db, 'tenants');
if (!isSuperAdmin && tenant) {
  tenantsQuery = query(collection(db, 'tenants'), where('__name__', '==', tenant.id));
}
const tenantSnap = await getDocs(tenantsQuery);

// Líneas 211-215:
let hierarchyQuery = collection(db, 'hierarchy');
if (!isSuperAdmin && tenant) {
  hierarchyQuery = query(collection(db, 'hierarchy'), where('tenantId', '==', tenant.id));
}
const hierarchySnap = await getDocs(hierarchyQuery);

// Líneas 379-389:
if (modalType === 'cliente') {
  const tenantData = { ... };
  await addDoc(collection(db, 'tenants'), tenantData);
}

// Líneas 434-437:
await updateDoc(doc(db, 'tenants', node.id), {
  suscripcion_activa: nextStatus
});

// Líneas 477-481:
<button 
  onClick={() => openModal('mjm_root', 'cliente')}
  className="..."
>
  + Nuevo Cliente
</button>
```
- **Detalle:** Si `tenant` no está resuelto al montarse el componente (`!isSuperAdmin && tenant` es `false`), la consulta cae por defecto a listar **todos** los tenants (`collection(db, 'tenants')`) y todas las jerarquías globales (`collection(db, 'hierarchy')`). Además, el botón `+ Nuevo Cliente` y la función `handleToggleStatus` permiten crear tenants y suspender/activar clientes sin verificar que el usuario tenga privilegios de `isSuperAdmin`.

#### Obs 1.1.5 — Brecha de Autorización en Reglas de Firebase Storage
- **Archivo:** `storage.rules`
- **Líneas:** 8–17
```javascript
    // Aislamiento Multi-Tenant Estricto (ISO/IEC 27001 & SDD Contrato)
    // Permite lectura y escritura únicamente en rutas encapsuladas por tenantId
    match /tenants/{tenantId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Ruta de certificados por tenant (Compatibilidad trazabilidad INM)
    match /certificates/{tenantId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
```
- **Detalle:** Las reglas de Storage únicamente verifican `request.auth != null`. No validan si el usuario autenticado pertenece al `tenantId` especificado en la ruta (`request.auth.token.tenantId == tenantId`). Un usuario del Tenant A con credenciales válidas de Firebase Auth puede subir, sobreescribir o leer certificados de calibración del Tenant B.

#### Obs 1.1.6 — Desconexión Multi-Tenant en Cloud Functions
- **Archivo:** `functions/index.js`
- **Líneas:** 36–38, 72–77
```javascript
// 2. Obtener Tolerancia del Proceso del Instrumento asociado
const instDoc = await db.collection("inventario_metrologico").doc(activityData.instrumentId).get();
if (!instDoc.exists) return;
const tolerance = instDoc.data().tolerancia_proceso;
...
// Actualizar instrumento (Hoja de Vida)
batch.update(db.collection("inventario_metrologico").doc(activityData.instrumentId), {
  lastStatus: dictamen === "Conforme" ? "Vigente" : "Vencido/No Conforme",
  lastVerificationAt: FieldValue.serverTimestamp(),
  nextConfirmationDate: "Calculado según intervalo" 
});
```
- **Detalle:** La función Cloud Function `metrologyBotVerifier` consulta y actualiza la colección raíz `"inventario_metrologico"` sin utilizar el `tenantId` de la actividad (`activityData.tenantId`) ni acceder a la ruta `tenants/{tenantId}/inventario_metrologico`.

#### Obs 1.1.7 — Sangrado de Datos en Estado Zustand Durante Conmutación de Tenant (`switchTenant`)
- **Archivo:** `src/store/authStore.js` (líneas 104–141) y `src/store/inventoryStore.js` (líneas 109–121)
- **Detalle:** `switchTenant` en `authStore.js` cambia la propiedad `tenant` en `authStore`, pero no emite una orden de limpieza inmediata (`set({ instruments: [], activities: [], loading: true })`) sobre `useInventoryStore`. Durante la latencia de red de la nueva consulta de Firestore para el nuevo tenant, los componentes del dashboard muestran los instrumentos y actividades del tenant anterior bajo el nombre y branding del nuevo tenant.

---

### 1.2 R3: Ciclo de Vida React y Erradicación de Fugas de Memoria

#### Obs 1.2.1 — Falta de Limpieza en Suscripción `onAuthStateChanged`
- **Archivo:** `src/store/authStore.js`
- **Líneas:** 144–146
```javascript
  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
...
```
- **Archivo Vinculado:** `src/App.jsx`
- **Líneas:** 40–45
```javascript
function AppRoutes() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const tenant = useAuthStore((state) => state.tenant);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
```
- **Detalle:** `onAuthStateChanged(auth, ...)` retorna una función `unsubscribe`. En `authStore.js`, `initializeAuth` no retorna esta función ni la almacena en el estado. En `App.jsx`, el hook `useEffect` no provee función de retorno (`return () => unsub()`). En React 19 / StrictMode y durante recargas en caliente (HMR), se duplican los listeners de autenticación permanentemente en memoria.

#### Obs 1.2.2 — Suscripciones Duplicadas Concurrentes a la Colección `activities`
- **Archivos y Líneas:**
  - `src/layouts/DashboardLayout.jsx` (líneas 92–97):
    ```javascript
    useEffect(() => {
      if (tenant?.id) {
        const unsubscribe = loadActivities(tenant.id);
        return () => unsubscribe && unsubscribe();
      }
    }, [tenant?.id, loadActivities]);
    ```
  - `src/pages/dashboard/KanbanMetrologico.jsx` (líneas 240–245):
    ```javascript
    useEffect(() => {
      if (tenant?.id) {
        const unsubscribe = loadActivities(tenant.id);
        return () => unsubscribe && unsubscribe();
      }
    }, [tenant?.id, loadActivities]);
    ```
  - `src/pages/dashboard/Calendario.jsx` (líneas 57–66):
    ```javascript
    useEffect(() => {
      if (tenant?.id) {
        const unsubAct = loadActivities(tenant.id);
        const unsubInst = loadInstruments(tenant.id);
        return () => {
          unsubAct && unsubAct();
          unsubInst && unsubInst();
        };
      }
    }, [tenant?.id, loadActivities, loadInstruments]);
    ```
  - `src/pages/dashboard/DashboardKPIs.jsx` (líneas 13–22):
    ```javascript
    React.useEffect(() => {
      if (tenant) {
        const unsubInst = loadInstruments(tenant.id, isSuperAdmin);
        const unsubAct = loadActivities(tenant.id, isSuperAdmin);
        return () => {
          if (unsubInst) unsubInst();
          if (unsubAct) unsubAct();
        };
      }
    }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);
    ```
  - `src/pages/dashboard/AsegMetrologico.jsx` (líneas 974–983):
    ```javascript
    useEffect(() => {
      if (tenant) {
        const unsubInst = loadInstruments(tenant.id, isSuperAdmin);
        const unsubAct = loadActivities(tenant.id, isSuperAdmin);
        return () => {
          if (unsubInst) unsubInst();
          if (unsubAct) unsubAct();
        };
      }
    }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);
    ```
- **Detalle:** `DashboardLayout` se encuentra montado continuamente y mantiene activa una suscripción a `loadActivities(tenant.id)`. Cada vez que el usuario ingresa a `KanbanMetrologico`, `Calendario`, `DashboardKPIs` o `AsegMetrologico`, se crea una segunda suscripción `onSnapshot` concurrente sobre la misma consulta Firestore (`activities` con `tenantId == targetTenantId`). Ante cualquier actualización en base de datos, ambas suscripciones reciben el snapshot simultáneamente, mapean los documentos y ejecutan `set({ activities: docs })` en Zustand, provocando doble renderizado en cascada.

#### Obs 1.2.3 — Suscripción de Catálogo Completo en Vista de Impresión Unitaria (`HojaDeVidaPrint.jsx`)
- **Archivo:** `src/pages/dashboard/HojaDeVidaPrint.jsx`
- **Líneas:** 88–95
```javascript
  useEffect(() => {
    const activeTenantId = tenant?.id || 'sandboxdemo';
    const unsub = loadInstruments(activeTenantId);
    return () => {
      if (unsub) unsub();
    };
  }, [tenant, loadInstruments]);
```
- **Detalle:** En la vista imprimible para un único instrumento (`/dashboard/inventario/imprimir/:id`), se suscribe un listener reactivo `onSnapshot` a **todo** el inventario del tenant (`loadInstruments`). La vista sólo requiere los datos del instrumento `id`, los cuales ya pueden obtenerse puntualmente con `getInstrumentFromFirestore(id)` (líneas 100–104). Esto genera consumo de red y retención innecesaria de memoria en una ventana optimizada para impresión en papel.

#### Obs 1.2.4 — Ausencia de Gestor de Suscripciones en `inventoryStore.js`
- **Archivo:** `src/store/inventoryStore.js`
- **Líneas:** 124–154 (`loadInstruments`), 252–280 (`loadActivities`)
- **Detalle:** `inventoryStore.js` delega la retención y ejecución de `unsubscribe` enteramente a los componentes de interfaz. No almacena internamente referencias a las suscripciones activas (`activeInstrumentsUnsub`, `activeActivitiesUnsub`). Si un usuario cierra sesión (`logout()`), el store no dispone de un método de desuscripción forzada (`cleanupSubscriptions()`), dejando la responsabilidad exclusivamente al desmontaje asíncrono de componentes de React.

---

## 2. Logic Chain (Cadena Lógica de Deducción)

### 2.1 Eslabón 1: Violación del Aislamiento Multi-Tenant por Consultas a Colecciones Raíz
1. La especificación canónica (`SPEC.md` Sección 3.1) define que el parque metrológico reside bajo el espacio jerárquico `tenants/{tenantId}/inventario_metrologico/{id}`.
2. De acuerdo con la **Obs 1.1.1** (`src/services/instruments.js:7`), la función `getInstrumentById` ejecuta `doc(db, 'inventario_metrologico', id)`, apuntando a la raíz del árbol de Firestore sin contextualización de tenant.
3. De acuerdo con la **Obs 1.1.2** (`src/data/seedData.js:59`), `seedInstruments` inyecta documentos en `collection(db, 'inventario_metrologico')`.
4. De acuerdo con la **Obs 1.1.6** (`functions/index.js:36, 73`), la Cloud Function lee y escribe en `inventario_metrologico` en raíz.
5. **Deducción:** Existe una discrepancia de arquitectura brownfield donde partes del sistema asumen una colección plana `inventario_metrologico` con o sin campo `tenantId`, mientras el resto del sistema (`inventoryStore.js:129, 235, 482`) usa subcolecciones `tenants/{tenantId}/inventario_metrologico`. Las lecturas a través de `instrumentsService` fallan o leen documentos desactualizados/sin aislar.

### 2.2 Eslabón 2: Escalación Horizontal y Exposición de Prospectos en `ChatbotSubmissions.jsx`
1. `ChatbotSubmissions.jsx` consulta `collection(db, 'chatbot_submissions')` en tiempo real (**Obs 1.1.3**).
2. En `App.jsx:81`, la ruta `/dashboard/solicitudes` está declarada dentro de las rutas protegidas comunes pero no restringida a superadmin.
3. El Sidebar en `DashboardLayout.jsx` no muestra el enlace a usuarios no-superadmin, pero React Router permite el acceso directo vía barra de direcciones a cualquier usuario autenticado de cualquier tenant.
4. **Deducción:** Un cliente corporativo (ej. Tenant "Delta CoreTech") puede acceder a `/dashboard/solicitudes` y extraer información sensible (nombres, teléfonos WhatsApp, correos, empresas y equipos requeridos) de clientes potenciales y cotizaciones de otros prospectos.

### 2.3 Eslabón 3: Falla de Aislamiento en Almacenamiento de Certificados (Firebase Storage)
1. Los archivos de certificados y evidencias se almacenan bajo `tenants/{tenantId}/...` (**Obs 1.1.5**).
2. `storage.rules` únicamente verifica `allow read, write: if request.auth != null;` para los prefijos `/tenants/{tenantId}/` y `/certificates/{tenantId}/`.
3. Cualquier usuario autenticado en Firebase posee un token no nulo (`request.auth != null`), con independencia del tenant corporativo al que pertenece.
4. **Deducción:** Las reglas de Storage permiten que cualquier cliente autenticado de la plataforma lea, descargue o reemplace archivos de certificados de cualquier otra empresa, lo que incumple los estándares ISO 10012 e ISO/IEC 27001.

### 2.4 Eslabón 4: Fugas de Memoria por Multiplicación y Falta de Limpieza de Suscripciones
1. `AppRoutes` monta `useEffect(() => { initializeAuth(); }, [initializeAuth]);` (**Obs 1.2.1**). `initializeAuth` suscribe `onAuthStateChanged` sin retornar `unsubscribe`. Al remontar el árbol de rutas o en recarga en caliente, se acumulan observadores de autenticación que nunca son removidos.
2. `DashboardLayout` se mantiene en el tope del DOM y suscribe un listener reactivo `onSnapshot` a `activities` (**Obs 1.2.2**).
3. Cuando el usuario navega a `KanbanMetrologico`, `Calendario`, `DashboardKPIs` o `AsegMetrologico`, el componente hijo abre una suscripción idéntica a la misma consulta.
4. Cuando ocurre una mutación en `activities`, ambas suscripciones disparan su callback en el mismo microciclo, ejecutando transformaciones de array y actualizando Zustand dos veces por cada cambio.
5. `HojaDeVidaPrint.jsx` suscribe un listener de todo el inventario del tenant para imprimir una única hoja técnica (**Obs 1.2.3**).
6. **Deducción:** La arquitectura actual genera redundancia en la capa de transporte de Firestore, elevando el conteo de lecturas facturadas, saturando el hilo de ejecución de JavaScript y degradando el rendimiento en dispositivos de planta.

---

## 3. Caveats (Advertencias y Límites del Alcance)

1. **Modo Demo Efímero (Sandbox):** El sistema cuenta con una capa de sandbox en memoria (`sessionStorage` y `localStorage` con prefijo `mjm_demo_`) que aísla de manera segura a visitantes no autenticados (`sandboxdemo`, `sandbox-guest-001`). Los hallazgos de seguridad multi-tenant aplican específicamente al modo de producción con Firebase real.
2. **Ausencia de `firestore.rules` en el repositorio local:** En el árbol de directorios no se encontró un archivo `firestore.rules`. Si las reglas de seguridad de Firestore residen únicamente en la consola web de Firebase Cloud, cualquier regla laxa en el servidor combinada con las consultas abiertas de `ChatbotSubmissions.jsx` y `HierarchyTree.jsx` expone la base de datos a accesos no autorizados.
3. **Trigger de Cloud Functions en Entorno Local:** `functions/index.js` no se ejecuta en el pipeline de build de Vite del frontend (`npm run build`), pero forma parte del repositorio y del ciclo de verificación metrológica asistida por IA.

---

## 4. Conclusion (Conclusiones y Recomendaciones de Corrección)

### Resumen de Severidad de Hallazgos

| ID | Área | Componente / Archivo | Severidad | Impacto |
|---|---|---|---|---|
| **SEC-01** | Multi-Tenant | `src/services/instruments.js:7` | **Alta** | Consulta a colección raíz sin tenantId; no respeta aislamiento de subcolección. |
| **SEC-02** | Multi-Tenant | `src/pages/dashboard/ChatbotSubmissions.jsx:14` | **Alta** | Lectura sin filtro de prospectos comerciales accesible a cualquier usuario autenticado. |
| **SEC-03** | Multi-Tenant | `storage.rules:9, 15` | **Crítica** | Reglas de Storage permiten a cualquier usuario autenticado leer/escribir datos de cualquier tenant. |
| **SEC-04** | Multi-Tenant | `src/components/HierarchyTree.jsx:185, 211, 477` | **Media** | Consultas desbordadas si tenant es nulo y acciones no restringidas por rol superadmin. |
| **SEC-05** | Multi-Tenant | `src/store/authStore.js:104` + `inventoryStore.js` | **Media** | Fuga transitoria de datos entre empresas durante `switchTenant` por falta de purge síncrono. |
| **LEAK-01** | Ciclo de Vida | `src/store/authStore.js:145` + `src/App.jsx:43` | **Media** | `onAuthStateChanged` huérfano sin limpieza en desmontaje/recarga. |
| **LEAK-02** | Rendimiento | `DashboardLayout.jsx` vs `Kanban/Calendario/KPIs` | **Media** | Suscripciones duplicadas concurrentes a `activities` generan dobles renders. |
| **LEAK-03** | Rendimiento | `src/pages/dashboard/HojaDeVidaPrint.jsx:90` | **Baja** | Suscripción masiva de inventario para vista de impresión individual. |
| **LEAK-04** | Ciclo de Vida | `src/store/inventoryStore.js` | **Media** | Falta de método unificado de cancelación de suscripciones activas al cerrar sesión. |

### Propuestas Concretas de Corrección (Snippet Before → After)

#### 1. Corrección en `src/services/instruments.js`
```diff
--- a/src/services/instruments.js
+++ b/src/services/instruments.js
@@ -4,8 +4,11 @@ import { db } from '../config/firebase';
 export const instrumentsService = {
-  getInstrumentById: async (id) => {
+  getInstrumentById: async (tenantId, id) => {
     try {
-      const snap = await getDoc(doc(db, 'inventario_metrologico', id));
+      if (!tenantId || !id) return null;
+      const snap = await getDoc(doc(db, 'tenants', tenantId, 'inventario_metrologico', id));
       if (snap.exists()) {
         return { id: snap.id, ...snap.data() };
       }
```

#### 2. Corrección en `src/App.jsx` (Restricción de ruta `solicitudes` y limpieza de auth)
```diff
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -42,7 +42,7 @@ function AppRoutes() {
 
   useEffect(() => {
-    initializeAuth();
+    const unsub = initializeAuth();
+    return () => unsub && unsub();
   }, [initializeAuth]);
```
Y en `src/store/authStore.js`:
```diff
--- a/src/store/authStore.js
+++ b/src/store/authStore.js
@@ -144,3 +144,3 @@ export const useAuthStore = create((set, get) => ({
   initializeAuth: () => {
-    onAuthStateChanged(auth, async (firebaseUser) => {
+    return onAuthStateChanged(auth, async (firebaseUser) => {
```

Y en la protección de `/dashboard/solicitudes`:
```diff
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -81,1 +81,1 @@ function AppRoutes() {
-            <Route path="solicitudes" element={<ChatbotSubmissions />} />
+            <Route path="solicitudes" element={isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />} />
```

#### 3. Corrección en `storage.rules` (Endurecimiento Multi-Tenant)
```diff
--- a/storage.rules
+++ b/storage.rules
@@ -8,4 +8,4 @@ service firebase.storage {
     match /tenants/{tenantId}/{allPaths=**} {
-      allow read: if request.auth != null;
-      allow write: if request.auth != null;
+      allow read, write: if request.auth != null && 
+        (request.auth.token.tenantId == tenantId || request.auth.token.isSuperAdmin == true);
     }
```

#### 4. Corrección en `src/pages/dashboard/HojaDeVidaPrint.jsx` (Eliminar suscripción en masa)
```diff
--- a/src/pages/dashboard/HojaDeVidaPrint.jsx
+++ b/src/pages/dashboard/HojaDeVidaPrint.jsx
@@ -88,7 +88,0 @@ const HojaDeVidaPrint = () => {
-  useEffect(() => {
-    const activeTenantId = tenant?.id || 'sandboxdemo';
-    const unsub = loadInstruments(activeTenantId);
-    return () => {
-      if (unsub) unsub();
-    };
-  }, [tenant, loadInstruments]);
```
*(El `useEffect` subsiguiente ya carga con precisión quirúrgica el instrumento vía `getInstrumentFromFirestore(id)`)*.

#### 5. Corrección en `src/store/inventoryStore.js` (Centralización y Limpieza de Suscripciones)
- Incorporar en el store:
```javascript
  activeSubscriptions: { instruments: null, activities: null },
  clearAllSubscriptions: () => {
    const { activeSubscriptions } = get();
    if (activeSubscriptions.instruments) activeSubscriptions.instruments();
    if (activeSubscriptions.activities) activeSubscriptions.activities();
    set({
      activeSubscriptions: { instruments: null, activities: null },
      instruments: [],
      activities: [],
      loading: false
    });
  }
```
- Llamar `useInventoryStore.getState().clearAllSubscriptions()` dentro de `switchTenant` y `logout` en `authStore.js`.

---

## 5. Verification Method (Método de Verificación Independiente)

Para que el agente orquestador o los agentes de implementación puedan verificar de forma independiente los hallazgos:

1. **Verificación de pruebas unitarias existentes:**
   ```powershell
   npm.cmd test
   ```
   *Condición esperada:* 9 pruebas pasando (0 fallos).

2. **Verificación de compilación limpia de producción:**
   ```powershell
   npm.cmd run build
   ```
   *Condición esperada:* Código de salida 0, sin advertencias críticas de sintaxis o empaquetado.

3. **Verificación de referencias y ocurrencias:**
   - Para verificar consultas huérfanas en raíz:
     ```powershell
     rg "doc\(db,\s*'inventario_metrologico'" src/
     ```
   - Para verificar referencias a `chatbot_submissions`:
     ```powershell
     rg "chatbot_submissions" src/
     ```
   - Para verificar listeners concurrentes de `loadActivities`:
     ```powershell
     rg "loadActivities\(" src/
     ```

4. **Condiciones de Invalidación:**
   - Este reporte quedaría invalidado únicamente si se demuestra que `storage.rules` cuenta con Custom Claims ya inyectados en producción en Firebase Cloud, o si `ChatbotSubmissions` cuenta con validación de rol superadmin en un Higher-Order Component externo (lo cual fue descartado tras verificar `App.jsx:81`).
