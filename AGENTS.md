# AGENTS.md — ScanLine Master

Guía completa para agentes de IA que trabajen en este proyecto.
Última actualización: 2026-04-15.

---

## 1. Visión general del proyecto

**ScanLine Master** es una SPA educativa que enseña el algoritmo Scan-Line de relleno de polígonos.
El objetivo es conectar la intuición matemática (espacio continuo) con la implementación discreta (píxeles).

**Rutas:**
| Ruta | Página | Propósito |
|------|--------|-----------|
| `/` | Home | Hero + mini demo animada + recorrido sugerido |
| `/fundamentos` | Fundamentos | Teoría: even-odd, ET, fórmulas KaTeX, quiz |
| `/simulador` | PasoAPaso | Simulador interactivo paso a paso con AET en tiempo real |
| `/historia` | Historia | Línea de tiempo + figuras clave + quiz |
| `/laboratorio` | Laboratorio | Canvas libre para dibujar y rellenar polígonos propios |

---

## 2. Stack técnico

| Tecnología | Versión | Notas |
|------------|---------|-------|
| React | 19 | Con StrictMode |
| Vite | 8 | Build tool + dev server |
| TypeScript | ~6 | strict mode activo |
| Tailwind CSS | v4 | CSS-first (`@import "tailwindcss"`), sin tailwind.config.js |
| react-router-dom | v7 | BrowserRouter + Routes; vercel.json tiene SPA rewrites |
| lucide-react | v1 | Iconos: misma API de importación que versiones anteriores |
| KaTeX | 0.16 | Fórmulas via `katex.renderToString` + `dangerouslySetInnerHTML` |
| Canvas API | — | Sin WebGL; todo 2D context |

**No hay** tests unitarios (decisión explícita del usuario). No agregar sin pedirlo.

---

## 3. Estructura de carpetas

```
scanline-master/
├── AGENTS.md              ← Este archivo
├── vercel.json            ← SPA rewrites para todas las rutas
├── vite.config.ts         ← Plugin Tailwind + React
├── src/
│   ├── main.tsx           ← Entry point (StrictMode)
│   ├── App.tsx            ← BrowserRouter + Routes + layout
│   ├── index.css          ← @import "tailwindcss" + estilos globales
│   ├── core/
│   │   └── scanline/
│   │       ├── types.ts       ← Tipos: Point, Edge, AETEdge, Span, SimulatorStep, Phase
│   │       ├── presets.ts     ← STAR_PRESET (10v), ARROW_PRESET (7v), PRESETS map
│   │       ├── edgeTable.ts   ← buildEdgeTable(), getYRange()
│   │       └── stepper.ts     ← generateSteps(), fillPolygon()
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx     ← NavLink activo, responsive (oculta labels en móvil)
│   │   │   └── Footer.tsx
│   │   ├── common/
│   │   │   └── Formula.tsx    ← Wrapper KaTeX: <Formula formula="..." display? />
│   │   ├── simulator/
│   │   │   ├── ScanlineCanvas.tsx  ← Canvas 128×128 grid, DPR aware, ResizeObserver
│   │   │   ├── StepControls.tsx    ← Play/Pause/Next/Prev/Reset + selector 1×–4×
│   │   │   ├── AETTable.tsx        ← Tabla AET con highlight de filas nuevas/eliminadas
│   │   │   └── StepConsole.tsx     ← Descripción textual del sub-paso actual
│   │   ├── lab/
│   │   │   └── LabCanvas.tsx       ← Canvas libre: click→vértice, rubber-band, fill, export/import
│   │   ├── quiz/
│   │   │   └── Quiz.tsx            ← Quiz con estado por pregunta, score final, retry
│   │   └── timeline/
│   │       └── TimelineCard.tsx    ← Tarjeta de línea de tiempo con highlight opcional
│   └── pages/
│       ├── Home.tsx          ← Hero + MiniDemo animada + cards de secciones
│       ├── Fundamentos.tsx   ← Teoría + fórmulas + Quiz (3 preguntas)
│       ├── PasoAPaso.tsx     ← Simulador completo con velocidad 1×–4×
│       ├── Historia.tsx      ← Timeline + figuras clave + Quiz (3 preguntas)
│       └── Laboratorio.tsx   ← LabCanvas + tips + Quiz (3 preguntas)
```

---

## 4. Algoritmo Scan-Line

### 4.1 Convenciones fundamentales

| Regla | Descripción |
|-------|-------------|
| **Relleno** | Even-odd (paridad): rellenar si #cruces desde el punto hacia derecha es impar |
| **include yMin** | Una arista se activa en su scanline inferior |
| **exclude yMax** | Una arista se desactiva antes de su scanline superior |
| **Horizontales** | Se ignoran completamente (evitan doble conteo en vértices compartidos) |
| **Incremento** | `currentX += invSlope` donde `invSlope = Δx/Δy` (una suma por arista por scanline) |

### 4.2 Estructura de datos

```typescript
// Edge (inmutable, en ET)
{ id, yMin, yMax, xAtYMin, invSlope, vertexI, vertexJ }

// AETEdge (mutable, en AET)
{ ...Edge, currentX }  // currentX se actualiza en cada scanline

// SimulatorStep (snapshot inmutable)
{ id, phase, y, et, vertices, aet, filledSpans, intersections,
  description, highlightY, newlyAddedIds, removedEdgeIds }
```

### 4.3 Orden de sub-pasos por scanline Y

```
init → [para cada Y de yMin a yMax-1]:
  set-y → update-aet-remove → update-aet-add → sort → fill → increment
→ done
```

`generateSteps()` pre-computa TODOS los pasos como snapshots inmutables.
Esto permite navegación hacia atrás O(1) (solo decrementar el índice).
Trade-off: memoria proporcional a #pasos (estrella ≈ 800 pasos, aceptable).

### 4.4 Presets

| Preset | Vértices | Y range | #pasos aprox |
|--------|----------|---------|--------------|
| Estrella | 10 | 9–109 | ~810 |
| Flecha | 7 | 12–110 | ~700 |

Grid lógico del simulador: **128×128**. El laboratorio usa coordenadas directas (0–512).

---

## 5. Sistema de canvas

### ScanlineCanvas (`src/components/simulator/ScanlineCanvas.tsx`)

- **Tamaño lógico**: 128×128 unidades
- **Renderizado**: DPR-aware con `ResizeObserver`; `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`
- **Escala**: `S = cssDisplaySize / 128` (calculada en cada render)
- **Capas de dibujo** (en orden): grid → spans previos → spans actuales → scanline highlight → polígono → intersecciones

**No tiene** interacción de usuario (solo lectura). No agregar click handlers aquí.

### LabCanvas (`src/components/lab/LabCanvas.tsx`)

- **Coordenadas lógicas**: 0–512 (constante `LOGICAL = 512`)
- **Conversión click**: `toLogical(cssX, cssY)` divide por CSS display size y multiplica por LOGICAL
- **DPR**: mismo patrón que ScanlineCanvas; se reconfigura en resize
- **Mouse move**: muestra rubber-band + coordenadas en tiempo real
- **fillPolygon()**: usa coordenadas lógicas directamente (sin transformación adicional)

### Gotcha: coordenadas CSS vs internas

```
CSS display size ≠ canvas.width/height (cuando DPR > 1)
Click event → coords CSS → convertir con toLogical() → coords lógicas
NUNCA almacenar coordenadas CSS directamente en vertices[]
```

---

## 6. Simulador de velocidad

En `PasoAPaso.tsx`:
- Estado `speed: 1 | 2 | 3 | 4` (default: 1)
- Intervalo de play: `BASE_INTERVAL_MS / speed` donde `BASE_INTERVAL_MS = 600`
  - 1× = 600ms, 2× = 300ms, 3× = 200ms, 4× = 150ms
- Al cambiar speed MIENTRAS reproduce, el `useEffect` se reinicia automáticamente (speed está en las deps)
- `StepControls` recibe `speed` y `onSpeedChange` como props

---

## 7. Atajos de teclado (simulador)

| Tecla | Acción |
|-------|--------|
| `Espacio` | Play / Pausa |
| `N` | Siguiente paso (solo cuando pausado) |
| `P` | Paso anterior (solo cuando pausado) |
| `R` | Reset al inicio |
| `1` | Velocidad 1× |
| `2` | Velocidad 2× |
| `3` | Velocidad 3× |
| `4` | Velocidad 4× |

Implementados en `PasoAPaso.tsx` via `window.addEventListener('keydown', ...)`.
No se disparan si el foco está en `<input>` o `<textarea>`.

---

## 8. Paleta de colores

| Uso | Color Tailwind | Hex aprox |
|-----|----------------|-----------|
| Marca / brand | `indigo-600` | #4f46e5 |
| Spans rellenados (prev) | `emerald-500/45%` | rgba(16,185,129,0.45) |
| Spans rellenados (actual) | `emerald-500/90%` | rgba(16,185,129,0.9) |
| Scanline highlight | `amber-400/20%` | rgba(251,191,36,0.2) |
| Scanline línea | `amber-500/85%` | rgba(245,158,11,0.85) |
| Intersecciones | `red-500` | #ef4444 |
| Polígono outline | `indigo-600` | #4f46e5 |
| Nuevas aristas AET | `blue-50/blue-400` | fila resaltada en tabla |
| Texto principal | `slate-800` | #1e293b |
| Bordes | `slate-200` | #e2e8f0 |

---

## 9. Guías de extensión

### Agregar un nuevo preset de polígono
1. Definir `const MY_PRESET: Point[]` en `src/core/scanline/presets.ts`
2. Agregarlo a `PRESETS`: `{ ..., mi_preset: MY_PRESET }`
3. Agregar al tipo `PresetName` en `types.ts`: `'estrella' | 'flecha' | 'mi_preset'`
4. Agregar el botón en el selector de `PasoAPaso.tsx`

### Agregar una nueva página
1. Crear `src/pages/NuevaPagina.tsx`
2. Agregar ruta en `App.tsx`: `<Route path="/nueva" element={<NuevaPagina />} />`
3. Agregar enlace en `Navbar.tsx` (seguir el patrón `navItems`)

### Modificar fórmulas matemáticas
Usar el componente `<Formula formula="..." display? />` de `src/components/common/Formula.tsx`.
El string `formula` es LaTeX estándar. Nunca usar `dangerouslySetInnerHTML` directamente en páginas.

### Cambiar velocidad base del simulador
Modificar `BASE_INTERVAL_MS` en `PasoAPaso.tsx`. Las velocidades ×N se calculan automáticamente.

### Agregar más sub-pasos al algoritmo
Modificar `generateSteps()` en `stepper.ts`. Cada paso es un `SimulatorStep` inmutable.
Agregar la nueva fase al tipo `Phase` en `types.ts`.
Agregar el badge correspondiente en la guía de sub-pasos de `PasoAPaso.tsx`.

---

## 10. Checklist de accesibilidad

- [x] Todos los `<canvas>` tienen `aria-label` descriptivo
- [x] Botones de control tienen `aria-label` con la tecla correspondiente
- [x] Tabla AET tiene `thead` con `th` y encabezados claros
- [x] Foco visible con `ring-*` en elementos interactivos
- [x] Botones de velocidad tienen `aria-pressed` para indicar selección
- [ ] Contraste de color WCAG AA verificado con herramienta automática
- [ ] Anuncio de cambio de paso con `aria-live` (mejora futura)

---

## 11. Pitfalls conocidos

| Problema | Causa | Solución |
|----------|-------|----------|
| Vértices mal posicionados en Lab | Coords CSS sin escalar | Siempre usar `toLogical()` |
| Canvas borroso en Retina | DPR no aplicado | `ctx.setTransform(dpr, ...)` + `canvas.width = size * dpr` |
| Arista horizontal rompe paridad | Incluida en ET | `edgeTable.ts` las filtra con `if (p1.y === p2.y) continue` |
| Doble conteo en pico | Ambas aristas incluyen el vértice | Convención exclude-yMax resuelve esto |
| Play no respeta nueva velocidad | `speed` no en deps del useEffect | `speed` está en `[playing, speed, steps.length]` |
| Import JSON con coords fuera de rango | El usuario editó el archivo | El algoritmo maneja gracefully, pero visualmente puede salirse del canvas |
