import { useEffect, useRef, useState } from 'react';
import { X, Code2, ChevronRight } from 'lucide-react';

// ── Tokenizer simple para TypeScript ─────────────────────────────────────────
const TOKEN_RE =
  /(\/\/[^\n]*)|(["'`](?:[^"'`\\]|\\.)*["'`])|(\b(?:const|let|function|return|for|while|if|else|export|import|from|type|interface|of|in|new|true|false|null|undefined|Map|Set|Array)\b)|(\b(?:number|string|boolean|void|never|any|Point|Edge|AETEdge|Span|Map)\b)|(\b\d+(?:\.\d+)?\b)/g;

function highlight(code: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) parts.push(code.slice(last, m.index));
    const [full, comment, str, kw, type, num] = m;
    if (comment) parts.push(<span key={key++} className="text-slate-500 italic">{comment}</span>);
    else if (str)  parts.push(<span key={key++} className="text-amber-300">{str}</span>);
    else if (kw)   parts.push(<span key={key++} className="text-purple-400 font-medium">{kw}</span>);
    else if (type) parts.push(<span key={key++} className="text-sky-400">{type}</span>);
    else if (num)  parts.push(<span key={key++} className="text-emerald-400">{num}</span>);
    else           parts.push(full);
    last = m.index + full.length;
  }
  if (last < code.length) parts.push(code.slice(last));
  return <>{parts}</>;
}

// ── Snippets ──────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'fill',
    label: 'fillPolygon',
    badge: 'stepper.ts',
    receives: [
      { name: 'vertices', type: 'Point[]', desc: 'Array de vértices {x, y} del polígono en orden' },
    ],
    returns: { type: 'Span[]', desc: 'Array de spans {y, x1, x2}: cada fila rellena con sus límites horizontales' },
    description:
      'Versión compacta del algoritmo. Ejecuta el Scan-Line completo de una sola vez y devuelve todos los spans rellenados. Ideal para el Laboratorio donde no se necesita navegar paso a paso.',
    code: `export function fillPolygon(vertices: Point[]): Span[] {
  const et = buildEdgeTable(vertices);
  const { yMin, yMax } = getYRange(vertices);
  let aet: AETEdge[] = [];
  const spans: Span[] = [];

  for (let y = yMin; y < yMax; y++) {
    // 1. Eliminar aristas cuyo yMax ya fue alcanzado (exclude yMax)
    aet = aet.filter(e => e.yMax > y);

    // 2. Agregar aristas que inician en esta scanline (include yMin)
    const newEdges = et.get(y) ?? [];
    aet.push(...newEdges.map(e => ({ ...e, currentX: e.xAtYMin })));

    if (aet.length === 0) continue;

    // 3. Ordenar AET por X para el emparejamiento even-odd
    aet.sort((a, b) => a.currentX - b.currentX);

    // 4. Rellenar pares de intersecciones: [x0,x1], [x2,x3]...
    for (let i = 0; i + 1 < aet.length; i += 2) {
      const x1 = Math.ceil(aet[i].currentX);
      const x2 = Math.floor(aet[i + 1].currentX);
      if (x1 <= x2) spans.push({ y, x1, x2 });
    }

    // 5. Actualización incremental: x += 1/m para la próxima scanline
    aet.forEach(e => { e.currentX += e.invSlope; });
  }

  return spans;
}`,
  },
  {
    id: 'et',
    label: 'buildEdgeTable',
    badge: 'edgeTable.ts',
    receives: [
      { name: 'vertices', type: 'Point[]', desc: 'Array de vértices {x, y} del polígono en orden' },
    ],
    returns: {
      type: 'Map<number, Edge[]>',
      desc: 'Mapa indexado por yMin. Cada bucket contiene las aristas que inician en esa scanline',
    },
    description:
      'Construye la Edge Table (ET) una sola vez antes de procesar. Las aristas horizontales se ignoran para evitar doble conteo en vértices compartidos. La clave de eficiencia es el campo invSlope = Δx/Δy que permite actualización incremental.',
    code: `export function buildEdgeTable(vertices: Point[]): Map<number, Edge[]> {
  const et = new Map<number, Edge[]>();
  const n = vertices.length;
  let edgeId = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;           // siguiente vértice (cierra el polígono)
    const p1 = vertices[i];
    const p2 = vertices[j];

    // Ignorar aristas horizontales (romperían la paridad)
    if (p1.y === p2.y) continue;

    const yMin = Math.min(p1.y, p2.y);
    const yMax = Math.max(p1.y, p2.y);
    const xAtYMin = p1.y < p2.y ? p1.x : p2.x; // x en el extremo inferior

    // 1/m = Δx/Δy: una suma reemplaza una división por scanline
    const invSlope = (p2.x - p1.x) / (p2.y - p1.y);

    const edge: Edge = { id: edgeId++, yMin, yMax, xAtYMin, invSlope };

    if (!et.has(yMin)) et.set(yMin, []);
    et.get(yMin)!.push(edge);
  }

  return et;
}`,
  },
  {
    id: 'loop',
    label: 'Bucle principal',
    badge: 'stepper.ts',
    receives: [
      { name: 'y', type: 'number', desc: 'Scanline actual, iterado de yMin a yMax − 1' },
      { name: 'aet', type: 'AETEdge[]', desc: 'Active Edge Table mutable: aristas cruzadas por el scanline actual' },
      { name: 'et', type: 'Map<number, Edge[]>', desc: 'Edge Table precalculada (inmutable durante el loop)' },
    ],
    returns: {
      type: 'void (muta aet)',
      desc: 'Actualiza la AET y acumula spans. Al terminar todos los Y, filledSpans contiene el relleno completo',
    },
    description:
      'Núcleo del algoritmo iterado por cada scanline. En generateSteps() cada sub-paso crea un snapshot inmutable del estado completo para soportar navegación bidireccional en el simulador.',
    code: `for (let y = yMin; y < yMax; y++) {

  // ── REMOVE ──────────────────────────────────────────────────────
  // Aristas con yMax ≤ Y ya no cruzan este scanline (exclude yMax)
  aet = aet.filter(e => e.yMax > y);

  // ── ADD ─────────────────────────────────────────────────────────
  // Incorporar aristas que inician en ET[Y], x comienza en xAtYMin
  const toAdd = et.get(y) ?? [];
  aet.push(...toAdd.map(e => ({ ...e, currentX: e.xAtYMin })));

  if (aet.length === 0) continue;

  // ── SORT ─────────────────────────────────────────────────────────
  // Ordenar por X para que el emparejamiento even-odd sea correcto
  aet.sort((a, b) => a.currentX - b.currentX);

  // ── FILL (even-odd) ──────────────────────────────────────────────
  // Par 0-1 → span interior, par 2-3 → span interior, etc.
  for (let i = 0; i + 1 < aet.length; i += 2) {
    const x1 = Math.ceil(aet[i].currentX);     // primer píxel dentro
    const x2 = Math.floor(aet[i + 1].currentX); // último píxel dentro
    if (x1 <= x2) filledSpans.push({ y, x1, x2 });
  }

  // ── INCREMENT ────────────────────────────────────────────────────
  // x += 1/m: preparar intersecciones para la próxima scanline
  // O(1) por arista — sin divisiones en caliente
  aet.forEach(e => { e.currentX += e.invSlope; });
}`,
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Componente ────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

export function CodeModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('fill');
  const dialogRef = useRef<HTMLDivElement>(null);

  const current = TABS.find(t => t.id === tab)!;

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Scroll al tope cuando cambia el tab
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!open) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-slate-950 text-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Código del algoritmo Scan-Line"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 size={18} className="text-indigo-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">Código del Algoritmo</p>
              <p className="text-xs text-slate-400">TypeScript · stepper.ts / edgeTable.ts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'flex-1 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-colors',
                  tab === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Badge de archivo */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded">
              📄 {current.badge}
            </span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-slate-400 font-mono">{current.label}</span>
          </div>

          {/* Descripción */}
          <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-indigo-500 pl-4">
            {current.description}
          </p>

          {/* Recibe / Devuelve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recibe</p>
              {current.receives.map(p => (
                <div key={p.name} className="space-y-0.5">
                  <p>
                    <span className="font-mono text-amber-300 text-xs">{p.name}</span>
                    <span className="text-slate-600 text-xs">: </span>
                    <span className="font-mono text-sky-400 text-xs">{p.type}</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devuelve</p>
              <p>
                <span className="font-mono text-emerald-400 text-xs">{current.returns.type}</span>
              </p>
              <p className="text-xs text-slate-500 leading-snug">{current.returns.desc}</p>
            </div>
          </div>

          {/* Código */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            {/* Barra de título estilo editor */}
            <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-xs text-slate-500 font-mono">{current.badge}</span>
            </div>

            <pre className="overflow-x-auto bg-[#0d1117] p-5 text-xs leading-relaxed font-mono">
              <code>{highlight(current.code)}</code>
            </pre>
          </div>

          {/* Nota sobre los tipos */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tipos clave</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              {[
                { type: 'Point', fields: '{ x: number; y: number }' },
                { type: 'Edge', fields: '{ yMin, yMax, xAtYMin, invSlope }' },
                { type: 'Span', fields: '{ y: number; x1: number; x2: number }' },
                { type: 'AETEdge', fields: 'Edge & { currentX: number }' },
                { type: 'Map<y, Edge[]>', fields: 'La Edge Table indexada por yMin' },
                { type: 'Span[]', fields: 'Resultado final del relleno' },
              ].map(({ type, fields }) => (
                <div key={type} className="rounded-lg bg-slate-800/50 px-3 py-2 space-y-0.5">
                  <p className="text-sky-400">{type}</p>
                  <p className="text-slate-500 text-[10px] leading-snug">{fields}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
