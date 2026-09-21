# Handoff Report — Explorer 3: UI/UX Sticky Headers and Precision Layouts (R4)

**Role**: Explorer 3 (UI/UX Sticky Layouts Inspector)  
**Project**: MJM Metrología Frontend (`mjm-frontend`)  
**Scope**: Operational Views Audit (`Inventario`, `Calendario`, `KanbanMetrologico`, `HojaDeVida`, `AsegMetrologico`)  
**Date**: 2026-09-21T22:15:00Z  
**Status**: COMPLETE (Hard Handoff)  

---

## 1. Observation

A direct code-level and visual audit of the dashboard shell and the 5 target operational views identified specific CSS, layout, and opacity defects.

### 1.1 Root Layout Shell: `DashboardLayout.jsx`
- **File**: `src/layouts/DashboardLayout.jsx`
- **Lines 574–577**:
  ```jsx
  {/* CONTENIDO SCROLLABLE DE ALTA DENSIDAD */}
  <main className="flex-1 overflow-y-auto bg-[var(--background)] px-3.5 sm:px-5 lg:px-6 pb-20 lg:pb-6 pt-0 transition-colors duration-300">
     <Outlet />
  </main>
  ```
- **Observed Behavior**:
  - `<main>` is the primary vertical scroll container for all child dashboard routes.
  - It imposes responsive horizontal padding (`px-3.5 sm:px-5 lg:px-6`) with `pt-0`.
  - All sticky child elements positioned with `top-0` compute their sticky anchor relative to `<main>`.

---

### 1.2 View 1: `Inventario` (`/dashboard/inventario`)
- **File**: `src/pages/dashboard/Inventario.jsx`
- **Observation 1.2.1 — Command Bar Configuration** (Line 1608):
  ```jsx
  <div className="sticky top-0 z-30 -mx-3.5 sm:-mx-5 lg:-mx-6 px-3.5 sm:px-5 lg:px-6 md:h-[52px] py-2 md:py-0 bg-white dark:bg-[#070C18] border-b border-slate-200 dark:border-zinc-800 shadow-xs transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 mb-4">
  ```
  - **Height & Responsive Breakdown**: `md:h-[52px]` is only enforced on `md` screens (≥768px). On smaller viewports (`< md`), the container switches to `flex-col py-2`, expanding its rendered height to ~110px.
  - **Floating Gap**: The presence of `mb-4` (16px margin) introduces an uncoupled visual gap between the sticky command bar and the table container before and during the initial scroll threshold.
  - **Color Token Mismatch**: `dark:bg-[#070C18]` diverges from the theme token `--surface` (`#101726`) and `--surface-alt` (`#151F33`), causing a visible color seam when docked.

- **Observation 1.2.2 — Table Container Overflow Trap** (Line 372):
  ```jsx
  <div className="overflow-x-auto lg:overflow-visible rounded-xl border border-[var(--outline-color)] bg-[var(--surface)] shadow-xs">
  ```
  - On viewports `< 1024px`, `overflow-x-auto` is active. Under CSS Overflow Module Level 3 rules, `overflow-x: auto` forces `overflow-y` to compute to `auto`.
  - Because this wrapper has no fixed height, when the outer `<main>` scrolls vertically, the `sticky top-[52px]` declaration on `thead` and `th` fails completely. The table header does not stick on tablet or mobile viewports; it scrolls off-screen.
  - On viewports `≥ 1024px`, `lg:overflow-visible` disables horizontal clipping, causing the 8 table columns to overflow the page if the browser is resized below ~1150px.

- **Observation 1.2.3 — Table Header Collision & Corner Bleeding** (Lines 373–384):
  ```jsx
  <table className="w-full text-left border-collapse table-precision relative">
    <thead className="sticky top-[52px] z-20 bg-[var(--surface-alt)] shadow-xs">
      <tr className="bg-[var(--surface-alt)] border-b border-[var(--outline-color)] text-[var(--text-muted)]">
        <th className="sticky top-[52px] bg-[var(--surface-alt)] px-3.5 py-2.5 text-left font-space text-[10px] font-bold uppercase tracking-wider z-20 shadow-[0_1px_0_0_var(--outline-color)] rounded-tl-xl whitespace-nowrap">Código / ID</th>
        ...
        <th className="sticky top-[52px] bg-[var(--surface-alt)] px-3.5 py-2.5 text-right font-space text-[10px] font-bold uppercase tracking-wider z-20 shadow-[0_1px_0_0_var(--outline-color)] rounded-tr-xl whitespace-nowrap">Acciones</th>
      </tr>
    </thead>
  ```
  - **Fixed Offset Collision**: `top-[52px]` assumes the command bar is strictly 52px. When the command bar is wrapped or on `< md` (~110px), the table header sticks 58px underneath the command bar, colliding with search and filter buttons.
  - **Corner Bleed**: First `th` has `rounded-tl-xl` (12px radius) and last `th` has `rounded-tr-xl`. The corner radius creates transparent triangular zones where scrolling rows visibly bleed through.
  - **Border Collapse Quirk**: `border-collapse: collapse` causes table header borders to detach or vanish during scrolling in Chromium browsers.
  - **Negative Margin Disconnect**: The command bar spans wall-to-wall (`-mx-3.5 sm:-mx-5 lg:-mx-6`), while the table is inset within `<main>` padding. The table header is narrower, leaving empty gutters where rows passing behind the header can be seen.

---

### 1.3 View 2: `Calendario` (`/dashboard/calendario`)
- **File**: `src/pages/dashboard/Calendario.jsx`
- **Lines 224–279**: Page header (`<header className="flex flex-col sm:flex-row ...">`) containing title, "Agenda & Alertas", and "+ Nueva Actividad" has no `sticky` class.
- **Lines 281–309**: Month navigation toolbar (`{monthStrOnly} {year}`, Prev, Hoy, Next) inside `<section className="premium-card ...">` has no `sticky` class.
- **Lines 311–316**: Weekday labels row (`LU, MA, MI, JU, VI, SA, DO`) has no `sticky` class.
- **Observed Behavior**: Scrolling vertically causes all calendar controls and weekday headers to scroll off-screen, removing context during date inspections.

---

### 1.4 View 3: `KanbanMetrologico` (`/dashboard/kanban`)
- **File**: `src/pages/dashboard/KanbanMetrologico.jsx`
- **Lines 438–440**:
  ```jsx
  <header className="sticky top-0 z-30 mb-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3.5">
  ```
- **Observed Behavior**:
  1. **Opacity Violation**: `bg-white/95 dark:bg-zinc-950/95` has 95% opacity. When kanban cards scroll underneath, text and borders bleed through the 5% translucency.
  2. **Corner Bleeding**: `rounded-2xl` on the sticky element means content passing under the top edge bleeds through the curved top corners.
  3. **Gap**: `mb-4` creates a 16px floating gap between the sticky toolbar and the board.
  4. **Dark Mode Divergence**: Uses `dark:bg-zinc-950/95` and `dark:border-zinc-800` rather than the system's surface CSS variables (`--surface`, `--surface-alt`).

---

### 1.5 View 4: `HojaDeVida` (`/dashboard/inventario/[id]`)
- **File**: `src/pages/dashboard/HojaDeVida.jsx`
- **Lines 386–430**: Header sector with Back button, Status badge, Print button, and Edit button is in normal flow, not sticky.
- **Lines 616–626** (Historial de Rutinas & Calibraciones):
  ```jsx
  <thead className="bg-[var(--surface-alt)] text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-outline-variant/20">
  ```
  - The table header completely lacks `sticky` or `top-0`.
  - When scrolling through routine history, column headers scroll off-screen.

---

### 1.6 View 5: `AsegMetrologico` (`/dashboard/aseguramiento`)
- **File**: `src/pages/dashboard/AsegMetrologico.jsx`
- **Lines 1173–1199**: Search bar and Plant dropdown toolbar are not sticky; they scroll out of view when browsing plant cards.
- **Lines 643–664 (`MasterLogModal`)**:
  ```jsx
  <div className="overflow-y-auto flex-1 p-4">
    ...
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-zinc-700">
  ```
  - The modal scroll container is `<div className="overflow-y-auto flex-1 p-4">`.
  - The table `<thead>` has NO `sticky top-0 z-20` class.
  - Opacity violation: `dark:bg-zinc-800/80` has 80% opacity, causing background bleed when scrolling through hundreds of plant verification logs.

---

## 2. Logic Chain

```
Observation 1.1 (<main> is scroll container)
  + Observation 1.2.1 (Command Bar is sticky top-0, md:h-[52px], mb-4)
  + Observation 1.2.2 (Table wrapper has overflow-x-auto on < lg)
  + Observation 1.2.3 (thead has sticky top-[52px], rounded-tl-xl, rounded-tr-xl)
    │
    ├── Step 1: CSS overflow specifications dictate that overflow-x: auto creates an internal scroll container.
    │           Because the table wrapper has overflow-x-auto on viewports < 1024px, the thead sticky position
    │           is trapped inside the wrapper and does not stick when <main> scrolls.
    │           --> RESULT: Sticky table header fails on all tablet/mobile screens.
    │
    ├── Step 2: On < md screens, the command bar stacks vertically to ~110px.
    │           The table header offset is hardcoded to top-[52px].
    │           Because 52px < 110px, the header sticks directly underneath the search/filter controls.
    │           --> RESULT: Header text collision and overlap.
    │
    ├── Step 3: mb-4 on the command bar introduces a 16px vertical gap.
    │           During the initial scroll phase (before thead reaches top-[52px]), rows travel through this gap.
    │           --> RESULT: Gap violation (requirement demands exactly 0px gap).
    │
    ├── Step 4: First and last <th> cells have rounded-tl-xl and rounded-tr-xl.
    │           Border-radius leaves corners transparent outside the curve.
    │           --> RESULT: Rows scrolling under the header bleed through the corner radii.
    │
    └── Step 5: Command bar uses dark:bg-[#070C18] while thead uses bg-[var(--surface-alt)] (#151F33).
                --> RESULT: Visual seam at the docking boundary in dark mode.

Observation 1.4 (Kanban header has bg-white/95 dark:bg-zinc-950/95, rounded-2xl, mb-4)
    │
    └── Step 6: 95% opacity allows card text and borders to faintly bleed through the toolbar.
                rounded-2xl causes cards to bleed through the curved top corners.
                mb-4 creates a 16px gap between the sticky toolbar and the board.
                --> RESULT: Opacity and bleeding defect in Kanban view.

Observation 1.5 & 1.6 (HojaDeVida table and MasterLogModal table lack sticky top-0)
    │
    └── Step 7: Without sticky top-0 on <thead>, column headers scroll off-screen in high-density tables.
                In MasterLogModal, dark:bg-zinc-800/80 is also semi-transparent (80% opacity).
                --> RESULT: Usability degradation and opacity violation in inspection tables.
```

---

## 3. Caveats

1. **Test Suite Status**: Existing tests in `test/metrology.test.js` (9 passing tests) only exercise calculation logic (`metrologyCore.js`), not DOM/CSS layout or sticky behavior. Verification of CSS sticky fixes requires DOM inspection or browser test runs.
2. **Horizontal Scrolling on Narrow Viewports**: To eliminate the `overflow-x-auto` trap while keeping high-density tables usable on tablet/mobile screens, either:
   - Dedicated table container with `overflow-auto max-h-[calc(100vh-...)]` and `sticky top-0 thead` (safest and standard for enterprise portals), OR
   - Column priority hiding (`hidden md:table-cell`, `hidden lg:table-cell`) with `border-separate border-spacing-0` so the table remains within the page width without breaking `<main>` sticky.

---

## 4. Conclusion & Concrete Solutions

### 4.1 Solution for `Inventario.jsx` (`/dashboard/inventario`)

1. **Dock Command Bar and Table with 0px Gap**:
   - In `Inventario.jsx` line 1608:
     - Replace `mb-4` with `mb-0` (or `rounded-b-none border-b`).
     - Standardize background to 100% opaque CSS variable: `bg-[var(--surface)] dark:bg-[var(--surface)] border-b border-[var(--outline-color)]`.
     - Standardize height: ensure `h-[52px]` on desktop.

2. **Fix `PrecisionTableView` Sticky Table Header**:
   - In `PrecisionTableView` (lines 372–386):
     - Replace `border-collapse` with `border-separate border-spacing-0`.
     - Remove `rounded-tl-xl` and `rounded-tr-xl` from `<th>` cells so that header corners are square (`rounded-none`), eliminating text bleeding.
     - Set 100% opaque surface on all `<th>`: `bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] border-b border-[var(--outline-color)]`.
     - Remove redundant `sticky top-[52px]` from individual `<th>` tags and keep `sticky top-[52px] z-20` on `<thead className="sticky top-[52px] z-20 ...">`.
     - **Option A (Full Page Scroll)**: Remove `overflow-x-auto lg:overflow-visible` from the table card wrapper if scrolling with `<main>`, and apply negative margins `-mx-3.5 sm:-mx-5 lg:-mx-6` to the table card so both the command bar and table header share the exact same width and dock flush with 0px gap and 0px lateral bleed.
     - **Option B (Independent Viewport Table)**: Wrap the table in a dedicated scroll container:
       ```jsx
       <div className="overflow-auto max-h-[calc(100vh-210px)] rounded-xl border border-[var(--outline-color)] bg-[var(--surface)] shadow-xs">
         <table className="w-full text-left border-separate border-spacing-0 table-precision">
           <thead className="sticky top-0 z-20 bg-[var(--surface-alt)] shadow-xs">
       ```
       In Option B, `thead` sticks at `top-0` of its own container, completely immune to viewport size or command bar wrapping!

### 4.2 Solution for `KanbanMetrologico.jsx` (`/dashboard/kanban`)
- In `KanbanMetrologico.jsx` line 438:
  - Replace `bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md` with 100% opaque:
    `bg-[var(--surface)] border border-[var(--outline-color)]` (or `bg-white dark:bg-[#101726]`).
  - Replace `rounded-2xl` with `rounded-b-2xl rounded-t-none` when docked at `top-0`, eliminating curved corner text bleed.
  - Remove `mb-4` or set `mb-2` with an opaque barrier to eliminate floating card bleed.

### 4.3 Solution for `Calendario.jsx` (`/dashboard/calendario`)
- In `Calendario.jsx` lines 282–316:
  - Add sticky positioning to the calendar controls bar:
    `className="sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--outline-color)] ..."`
  - Ensure the weekday column headers (`LU`, `MA`, `MI...`) are sticky beneath the month bar with `top-[52px]` and 100% opaque background.

### 4.4 Solution for `HojaDeVida.jsx` (`/dashboard/inventario/[id]`)
- In `HojaDeVida.jsx` lines 616–626:
  - Wrap table in `max-h-[380px] overflow-auto` and add `sticky top-0 z-10 bg-[var(--surface-alt)] shadow-xs` to `<thead>`.
  - Use `border-separate border-spacing-0` on `<table>` to preserve borders.

### 4.5 Solution for `AsegMetrologico.jsx` (`/dashboard/aseguramiento`)
- In `MasterLogModal` (lines 643–654):
  - Add `sticky top-0 z-20 bg-slate-50 dark:bg-zinc-900 shadow-xs border-b border-slate-200 dark:border-zinc-700` to `<thead>`.
  - Remove `dark:bg-zinc-800/80` (80% opacity) and enforce 100% opacity (`dark:bg-zinc-900` or `dark:bg-zinc-800`).
  - On the main view, make the search toolbar sticky with `sticky top-0 z-20 bg-[var(--surface)]`.

---

## 5. Verification Method

To verify these findings and any future fixes:

1. **Automated Unit Tests**:
   ```powershell
   npm.cmd test
   ```
   *Expected*: 9 passing tests, 0 failures.

2. **Production Build Compilation**:
   ```powershell
   npm.cmd run build
   ```
   *Expected*: Exit code 0, clean Vite build.

3. **Browser Sticky & Bleed Verification** (Local Dev Server at `http://localhost:3005`):
   - Navigate to `/dashboard/inventario`.
   - Scroll down the page:
     - Verify command bar sticks at `top: 0`.
     - Verify table header sticks immediately below it with **0px gap**.
     - Verify text in table rows passing under the header does not bleed through the header background (100% opacity) or through the top-left / top-right corners.
     - Toggle between Light and Dark mode: verify seamless background matching between command bar and table header.
     - Resize browser to 800px (tablet) and 400px (mobile): verify the header does not collide or detach.
   - Navigate to `/dashboard/kanban`:
     - Scroll down: verify toolbar has 100% opacity (no ghost cards visible through the background) and zero corner bleed.
   - Navigate to `/dashboard/aseguramiento` -> click "Registro Maestro":
     - Scroll through verification logs: verify the modal table header stays pinned at `top: 0` with 100% opacity.
