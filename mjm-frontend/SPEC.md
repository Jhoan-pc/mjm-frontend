# MJM Metrología SaaS - Especificación de Arquitectura & Contrato de Negocio (SDD)

> **Documento Canónico de Especificación (Spec-Anchored)**  
> **Versión:** 1.0.0 (Extracción de Ingeniería Inversa Brownfield)  
> **Fecha de Validación:** Septiembre 2026  
> **Estado:** Activo en Producción (`http://localhost:3005`)  
> **Ecosistema:** Delta CoreTech / MJM Asesorías Integrales

---

## 1. Misión del Sistema & Contexto de Dominio

### 1.1 Propósito General
**MJM Metrología** es una plataforma SaaS multi-tenant diseñada para la gestión integral del parque de instrumentos de medición industrial, aseguramiento metrológico en planta, trazabilidad metrológica (INM), planificación operativa a 5 años y auditoría asistida por Inteligencia Artificial multimodal bajo estándares **ISO/IEC 17025:2017**, **ISO 10012** y la guía **JCGM 106:2012**.

### 1.2 Perfiles de Usuario & Roles (RBAC)
1. **SuperAdmin (MJM Core):**
   - Control total de la plataforma.
   - Capacidad de conmutar entre diferentes *tenants* en caliente (`allTenants`).
   - Gestión de clientes, tarifas y cotizador.
2. **Administrador de Tenant (Cliente Industrial):**
   - Acceso exclusivo al inventario, hojas de vida y cronograma de su empresa (`tenantId`).
   - Aprobación de comprobaciones de planta y descargas de certificados.
3. **Metrólogo de Planta / Operador:**
   - Registro de comprobaciones rápidas in-situ contra patrones de referencia.
   - Consulta de fichas técnicas y estados de los equipos.
4. **Modo Sandbox / Demo (`sandboxdemo`):**
   - Capa efímera aislada en `sessionStorage` (`mjm_demo_*`). Permite a prospectos interactuar con el sistema sin escribir en las colecciones maestras de Firestore.

---

## 2. Restricciones Técnicas & Ecosistema

### 2.1 Stack Tecnológico
- **Framework Frontend:** React 19 (`^19.2.4`) + Vite 8 (`^8.0.2`).
- **Enrutamiento:** React Router DOM v7 (`^7.13.2`) con *Lazy Loading* (Code Splitting).
- **Gestor de Estado:** Zustand 5 (`^5.0.12`) con persistencia reactiva de Firestore y capa de sesión efímera.
- **Backend & Almacenamiento:** Firebase v12 (`^12.11.0`) — Auth, Firestore Database y Storage (PDFs).
- **IA Multimodal:** Google Gemini API (`gemini-3.6-flash` / `gemini-2.0-flash`) para auditoría de certificados PDF.
- **Visualización & UI:** Tailwind CSS 3.4, Lucide React (`^1.7.0`), Framer Motion, Recharts y `react-to-print` para hojas de vida.

### 2.2 Red & Puertos Dev
- **Puerto Dev Asignado:** `3005` (Estricto: `"dev": "vite --port 3005"`, registrado en `PROJECTS_PORTS_REGISTRY.md`).
- **URL Local:** `http://localhost:3005`
- **Producción Hosting:** Firebase Hosting (`mjm-core-bd.web.app`).

### 2.3 Directivas de Estilo & Tokens Institucionales
- **Color Principal MJM:** `#234c74` (Azul Corporativo / `--color-mjm-navy`)
- **Color Secundario MJM:** `#f7931b` / `#EE8C2C` (Naranja Metrología / `--color-mjm-orange`)
- **Dark Theme Base:** `#050b14` (Fondo de carga y paneles oscuros)
- **Directiva de Iconos:** Exclusivamente `lucide-react` (prohibido el uso de emojis en tablas e interfaces operativas).

---

## 3. Modelo de Dominio & Contratos de Datos

### 3.1 Entidad: Instrumento Metrológico (`tenants/{tenantId}/inventario_metrologico/{id}`)
```typescript
interface InstrumentoMetrologico {
  id: string;
  codigoMJM: string;               // Identificador único (ej: MJM-DIM-001)
  nombre: string;                  // Nombre del equipo (ej: Calibrador Pie de Rey Digital)
  marca: string;                   // Marca fabricante (Mitutoyo, Starrett, Fluke)
  modelo: string;                  // Modelo comercial
  serie: string;                   // Número de serie del fabricante
  ubicacion: string;               // Área física o planta (ej: Mecanizado CNC, Calidad)
  responsable: string;             // Nombre del custodio del instrumento
  magnitud: MagnitudMetrologica;    // Dimensional, Masa, Temperatura, Presión, Eléctrica
  rango_medicion: string;          // Ej: 0 - 150 mm, 0 - 10 bar
  resolucion: string;              // Ej: 0.01 mm, 0.1 °C
  tolerancia_proceso: number;      // Error Máximo Permitido (EMP) del proceso (en unidad base)
  unidad_medida: string;           // mm, kg, °C, bar, V, etc.
  riesgo_operativo: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  estado: 'Operativo' | 'En Calibración' | 'Fuera de Servicio' | 'De Baja';
  foto_url?: string;               // URL en Firebase Storage
  certificado_url?: string;        // Último certificado PDF vigente
  rutinas?: {
    calibracion?: boolean;
    calibracion_frecuencia?: number; // Meses (ej. 12)
    calibracion_fecha_inicial?: string; // YYYY-MM-DD
    calibracion_anos?: number;       // Horizonte (defecto: 5)
    verificacion?: boolean;
    verificacion_frecuencia?: number;
    verificacion_fecha_inicial?: string;
    mantenimiento?: boolean;
    mantenimiento_frecuencia?: number;
    mantenimiento_fecha_inicial?: string;
    calificacion?: boolean;
    calificacion_frecuencia?: number;
    calificacion_fecha_inicial?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type MagnitudMetrologica = 
  | 'Longitud / Dimensional'
  | 'Masa / Pesaje'
  | 'Temperatura / Humedad'
  | 'Presión / Vacío'
  | 'Electricidad / Electrónica';
```

### 3.2 Entidad: Actividad Programada (`activities/{id}`)
Generada automáticamente por el motor `buildExpectedActivities` proyectada a 5 años según la frecuencia de cada rutina:
```typescript
interface ActividadOperativa {
  id?: string;
  tenantId: string;
  instrumentId: string;
  instrumentNombre: string;
  codigoMJM: string;
  tipo: 'Calibración' | 'Verificación' | 'Mantenimiento' | 'Calificación';
  estado: 'todo' | 'in_progress' | 'done' | 'overdue';
  fechaProgramada: string;          // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  is_last_of_5_years?: boolean;
  createdAt: string;
}
```

### 3.3 Entidad: Comprobación en Planta / Verificación Intermedia
Registrada en la subcolección de historial del instrumento o en la colección central de comprobaciones:
```typescript
interface ComprobacionPlanta {
  id?: string;
  tenantId: string;
  instrumentId: string;
  fecha: string;                    // ISO Date
  patronReferencia: string;         // Nombre del patrón (ej: Bloque Longitudinal Grado 1)
  patronCertificado: string;        // Número de certificado INM (ej: INM-CAL-2026-089)
  valorPatron: number;              // Valor nominal del patrón ($V_P$)
  valorLeido: number;               // Lectura del instrumento en planta ($V_L$)
  errorVal: number;                 // $V_L - V_P$
  consumoPct: number;               // $(|\text{errorVal}| / \text{EMP}) \times 100$
  declaracion: 'Conforme' | 'No Conforme';
  unidadMedida: string;
  temperatura: number;              // Nominal 20.0 °C
  humedad: number;                  // Nominal 55 %RH
  responsable: string;
  notas?: string;
}
```

---

## 4. Módulos del Sistema & Criterios de Aceptación (Gherkin)

### 4.1 Módulo: Inventario & Generación Automática a 5 Años
- **Descripción:** Gestión del ciclo de vida del instrumento. Al guardar o editar un equipo, el motor calcula la cascada de actividades a 5 años según las frecuencias configuradas.
- **Criterio de Aceptación 1 (Proyección de Rutinas):**
  - *Given* un instrumento con rutina de `calibracion` con fecha inicial `2026-09-01`, frecuencia de `12` meses y horizonte de `5` años.
  - *When* se guarda el instrumento en Firestore.
  - *Then* se deben generar exactamente 5 actividades de tipo `Calibración` en la colección `activities`, fechadas consecutivamente para septiembre de 2026, 2027, 2028, 2029 y 2030 con estado `'todo'`.
- **Criterio de Aceptación 2 (Sincronización No Destructiva):**
  - *Given* un instrumento con actividades previas en estado `'done'`.
  - *When* se actualiza el nombre o frecuencia del instrumento.
  - *Then* las actividades históricas `'done'` no deben borrarse ni alterarse; únicamente se sincronizan las pendientes (`'todo'`).

### 4.2 Módulo: Aseguramiento Metrológico en Planta & Control de Deriva (Shewhart)
- **Descripción:** Cálculo estricto en tiempo real del Error Sistemático y Consumo de Tolerancia del Proceso, complementado con gráficos de control estadístico de procesos (CEP / Carta de Control de Deriva de Shewhart) y Master Log de trazabilidad.
- **Reglas Matemáticas:**
  $$\text{Error} = V_{\text{leído}} - V_{\text{patrón}}$$
  $$\%\,\text{Consumo} = \frac{|\text{Error}|}{\text{Tolerancia}} \times 100$$
  $$\text{Declaración} = \begin{cases} \text{Conforme} & \text{si } |\text{Error}| \le \text{Tolerancia} \\ \text{No Conforme} & \text{si } |\text{Error}| > \text{Tolerancia} \end{cases}$$
- **Criterio de Aceptación 1 (Conformidad Metrológica):**
  - *Given* un instrumento con tolerancia de proceso (EMP) de `0.05 mm`.
  - *When* el metrólogo mide un patrón de `10.00 mm` y obtiene una lectura de `10.03 mm`.
  - *Then* el sistema calcula un error de `+0.03 mm`, un consumo de tolerancia del `60%`, y emite la declaración **«Conforme»** en color verde.
- **Criterio de Aceptación 2 (No Conformidad Inmediata):**
  - *Given* el mismo instrumento con tolerancia `0.05 mm`.
  - *When* la lectura es `10.07 mm` (error de `0.07 mm`, consumo `140%`).
  - *Then* el sistema marca **«No Conforme»** en rojo e inhabilita el cierre automático de la actividad sin justificación técnica.
- **Criterio de Aceptación 3 (Carta de Control Shewhart & Cierre Automático):**
  - *Given* una comprobación registrada mediante `recordPlantCheck`.
  - *When* se almacena el registro.
  - *Then* se cierran automáticamente actividades pendientes de tipo `Verificación` para el instrumento (`estado: 'done'`), se proyecta la deriva en el gráfico temporal contra los límites $\pm\text{EMP}$ y se guarda el evento en el historial del activo.

### 4.3 Módulo: Laboratorio de Verificación IA (Gemini Multimodal)
- **Descripción:** Análisis automatizado de certificados de calibración en formato PDF contra ISO/IEC 17025:2017 y JCGM 106.
- **Criterio de Aceptación 1 (Extracción & Dictamen):**
  - *Given* un archivo PDF cargado en `/dashboard/ia-lab`.
  - *When* se envía a `geminiMetrologyService.js` con el modelo `gemini-3.6-flash`.
  - *Then* la respuesta debe estructurar:
    1. Laboratorio emisor y acreditación ONAC / trazabilidad INM.
    2. Puntos de calibración con incertidumbre expandida ($U, k=2$).
    3. Dictamen de cumplimiento contra el EMP del cliente aplicando regla de decisión (banda de guardia).

### 4.4 Módulo: Hoja de Vida Imprimible
- **Ruta Dedicada:** `/dashboard/inventario/imprimir/:id` (Renderizada fuera del `DashboardLayout` para garantizar compatibilidad estricta con hojas de estilo `@media print` en tamaño carta sin barras de scroll).

### 4.5 Módulo: Cronograma Maestro & Planificación Operativa Kaizen
- **Ruta Principal:** `/dashboard/calendario` (Redirección unificada desde `/dashboard/kanban` para erradicar desperdicios Lean y concentrar la visibilidad en el calendario temporal de intervenciones).

---

## 5. Matriz de Tareas Atómicas (Roadmap de Mantenimiento SDD)

- [x] **Tarea 1.0 (Completada):** Extracción de ingeniería inversa y consolidación del `SPEC.md` canónico.
- [x] **Tarea 1.1 (Completada):** Auditoría de consistencia: Se agregaron `resolucion`, `rango_min`, `rango_max`, selector de `estado` y sincronización canónica de `criticidad` con `riesgo_operativo` en `EditInstrumentModal` de `HojaDeVida.jsx`.
- [x] **Tarea 1.2 (Completada):** Creación de suite de pruebas unitarias (`test/metrology.test.js` ejecutado con `npm test` / Node nativo `node --test`) para el motor `buildExpectedActivities` y el cálculo de consumo de tolerancia ISO 10012, corrigiendo el bug de incremento anual en cascada a 5 años.
- [x] **Tarea 1.3 (Completada):** Verificación y endurecimiento de las reglas de Firebase Storage (`storage.rules`) para aislar carpetas de certificados y evidencias por `tenantId` (`tenants/{tenantId}/...`).
- [x] **Tarea 1.4 (Completada):** Limpieza del archivo huérfano `src/store/inventoryStore.js-tmp.txt` y consolidación de cambios en Git.
- [x] **Tarea 1.5 (Completada):** Corrección de contraste y accesibilidad visual WCAG en modal de detalle (`Inventario.jsx`): Badge de código de activo (`#0B1326` con texto `#f7931b`) y botón de acción principal `Ver Expediente Completo` (`bg-mjm-navy text-white`).
