# MJM Metrología - Plataforma SaaS de Aseguramiento Metrológico

> **Sistema Oficial de Producción:** Conectado a Firebase en vivo (`mjm-core-bd`).  
> **Servidor Local Dev:** `http://localhost:3005` (`npm run dev`)  
> **Metodología de Desarrollo:** **Spec-Driven Development (SDD)**

---

## 📖 Especificación del Sistema & Contrato de Negocio
Este repositorio se rige bajo la metodología **Spec-Driven Development (SDD)**. Toda la arquitectura, modelos de datos, fórmulas de metrología ISO/IEC 17025 y criterios de aceptación están documentados formalmente en:

👉 **[SPEC.md](./SPEC.md)** (Fuente Única de la Verdad)

> ⚠️ **Regla de Desarrollo:** Queda prohibido modificar la lógica de negocio, esquemas de Firestore o cálculos metrológicos sin actualizar previamente el archivo `SPEC.md`.

---

## 🚀 Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3005
npm run dev

# Compilar para producción
npm run build
```

## 🛠️ Stack Tecnológico
- **Frontend:** React 19, Vite 8, React Router DOM v7, Zustand 5, Tailwind CSS 3.4.
- **Backend:** Firebase Authentication, Firestore Database, Firebase Storage.
- **IA Multimodal:** Google Gemini API (Análisis de certificados PDF).
- **Puerto Asignado:** `3005` (Verificado en `PROJECTS_PORTS_REGISTRY.md`).
