# Original User Request

## 2026-09-21T22:10:40Z

Auditoría integral multidimensional de software metrológico (ISO 10012) en frontend y backend para identificar y corregir de forma autónoma fisuras de seguridad multi-tenant, integridad algorítmica, fugas de memoria en suscripciones reactivas y consistencia visual en interfaces de alta densidad.

Working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend
Integrity mode: demo

## Requirements

### R1. Auditoría de Seguridad Lógica y Aislamiento Multi-Tenant
Inspeccionar todas las consultas a Firestore (`collection`, `query`, `where`) y referencias de Storage en la aplicación, verificando que ningún cliente corporativo pueda leer, escribir o inferir información de otro tenant. Si se detecta alguna consulta sin filtro estricto de `tenantId`, corregirla de inmediato garantizando aislamiento estricto.

### R2. Auditoría Metrológica y Rigor Algorítmico (ISO 10012)
Auditar las funciones centrales de cálculo en `src/utils/metrologyCore.js`, el laboratorio de verificación IA (`IAVerificationLab.jsx`) y el módulo de aseguramiento en planta (`AsegMetrologico.jsx`), asegurando que la evaluación de errores (|E| + U ≤ EMP), tolerancias de proceso y proyecciones quinquenales cumplan con las reglas de decisión metrológica sin inconsistencias numéricas ni redondeos espurios.

### R3. Ciclo de Vida React y Erradicación de Fugas de Memoria
Revisar minuciosamente todas las llamadas a `onSnapshot` en Zustand stores (`inventoryStore.js`, `authStore.js`, `contentStore.js`) y componentes de React. Corregir cualquier listener huérfano asegurando que cada suscripción devuelva y ejecute su respectiva función `unsubscribe` al desmontar el componente o cambiar de sesión.

### R4. Solidez de UI/UX, Encabezados Sticky y Layouts de Precisión
Auditar las vistas operativas (`Inventario`, `Calendario`, `KanbanMetrologico`, `HojaDeVida`, `AsegMetrologico`), verificando que los encabezados de tablas y barras de comandos mantengan su fijación (`sticky`) sin brechas transparentes ni sangrado de texto al hacer scroll, con fondos 100% opacos y compatibilidad con modo claro y oscuro.

### R5. Verificación Automatizada y Preservación de Build Limpio
Ejecutar la suite de pruebas unitarias existente (`npm test`) y la compilación de producción de Vite (`npm run build`). Cualquier corrección aplicada debe mantener el 100% de los tests pasando y cero errores de compilación.

## Verification Resources
- Test suite automatizado: `npm.cmd test` (`test/metrology.test.js`)
- Compilador de producción: `npm.cmd run build`
- Servidor de desarrollo activo en `http://localhost:3005`

## Acceptance Criteria

### Integridad y Seguridad Multi-Tenant
- [ ] 100% de las consultas a colecciones compartidas (`instruments`, `activities`, `verificaciones_planta`) en Firestore incluyen cláusula `where('tenantId', '==', tenantId)`.
- [ ] Reglas de Storage y Firestore validan pertenencia por tenant sin permitir escalamiento horizontal de privilegios.

### Precisión Metrológica ISO 10012
- [ ] Todos los tests de cálculo de error, porcentaje de tolerancia consumida y conformidad pasan exitosamente (`npm test`).
- [ ] Las proyecciones de rutinas a 5 años avanzan correctamente año a año sin fechas estancadas.

### Estabilidad y Rendimiento
- [ ] Ningún listener de Firestore queda activo tras desmontar componentes o cambiar de empresa.
- [ ] La compilación de producción de Vite (`npm run build`) termina con código 0 y sin advertencias críticas.

### Usabilidad y Acople Visual
- [ ] En `/dashboard/inventario`, tanto la barra de comandos como los encabezados de columnas de la tabla se mantienen sticky y acoplados con 0px de brecha al hacer scroll.
- [ ] Cero colisiones de texto o sangrado de filas a través de los encabezados.
