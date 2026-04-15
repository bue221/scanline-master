import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, Play, Download, Upload } from 'lucide-react';
import type { Point, Span } from '../../core/scanline/types';
import { fillPolygon } from '../../core/scanline/stepper';

// Resolución lógica del laboratorio (coordenadas que se almacenan)
const LOGICAL = 512;

interface Props {
  className?: string;
}

export function LabCanvas({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vertices, setVertices] = useState<Point[]>([]);
  const [spans, setSpans] = useState<Span[]>([]);
  const [filled, setFilled] = useState(false);
  const [mouse, setMouse] = useState<Point | null>(null);
  const [jsonError, setJsonError] = useState('');

  // ── Configurar resolución canvas respetando DPR ──────────────────────────
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.round(rect.width); // CSS px
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    // Escalar el contexto para que las coords lógicas sean las CSS px
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ── Conversión CSS-px → coords lógicas (LOGICAL = 512) ──────────────────
  const toLogical = useCallback((cssX: number, cssY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: cssX, y: cssY };
    const rect = canvas.getBoundingClientRect();
    const cssSize = rect.width; // el canvas es cuadrado
    return {
      x: Math.round((cssX / cssSize) * LOGICAL),
      y: Math.round((cssY / cssSize) * LOGICAL),
    };
  }, []);

  // ── Dibujo principal ──────────────────────────────────────────────────────
  const redraw = useCallback(
    (verts: Point[], spns: Span[], hover: Point | null, isFilled: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const cssSize = rect.width || LOGICAL;
      const sc = cssSize / LOGICAL; // escala lógica→CSS

      ctx.clearRect(0, 0, cssSize, cssSize);

      // Fondo
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, cssSize, cssSize);

      // Grid (cada 32 unidades lógicas = cssSize/16 px)
      const gridStep = cssSize / 16;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= cssSize; i += gridStep) {
        ctx.beginPath(); ctx.moveTo(Math.round(i) + 0.5, 0); ctx.lineTo(Math.round(i) + 0.5, cssSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, Math.round(i) + 0.5); ctx.lineTo(cssSize, Math.round(i) + 0.5); ctx.stroke();
      }

      // ── Spans rellenos ──────────────────────────────────────────────────
      if (spns.length > 0) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
        for (const s of spns) {
          const px = s.x1 * sc;
          const py = s.y * sc;
          const pw = (s.x2 - s.x1 + 1) * sc;
          const ph = sc;
          ctx.fillRect(px, py, pw, ph);
        }
      }

      // ── Línea rubber-band (último vértice → cursor) ─────────────────────
      if (!isFilled && verts.length > 0 && hover) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(verts[verts.length - 1].x * sc, verts[verts.length - 1].y * sc);
        ctx.lineTo(hover.x * sc, hover.y * sc);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Cierre del polígono (primer vértice → último) ──────────────────
      if (!isFilled && verts.length >= 3 && hover) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(verts[0].x * sc, verts[0].y * sc);
        ctx.lineTo(verts[verts.length - 1].x * sc, verts[verts.length - 1].y * sc);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Contorno del polígono ──────────────────────────────────────────
      if (verts.length >= 2) {
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(verts[0].x * sc, verts[0].y * sc);
        for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x * sc, verts[i].y * sc);
        if (isFilled) ctx.closePath();
        ctx.stroke();
      }

      // ── Vértices ───────────────────────────────────────────────────────
      for (let i = 1; i < verts.length; i++) {
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(verts[i].x * sc, verts[i].y * sc, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Primer vértice (resaltado en naranja para indicar cierre)
      if (verts.length > 0) {
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(verts[0].x * sc, verts[0].y * sc, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // ── Coordenadas del cursor ─────────────────────────────────────────
      if (!isFilled && hover) {
        const tx = hover.x * sc;
        const ty = hover.y * sc;

        // Cruz de mira
        ctx.strokeStyle = 'rgba(99,102,241,0.5)';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(tx - 8, ty); ctx.lineTo(tx + 8, ty);
        ctx.moveTo(tx, ty - 8); ctx.lineTo(tx, ty + 8);
        ctx.stroke();

        // Label con coordenadas
        const label = `(${hover.x}, ${hover.y})`;
        ctx.font = `${Math.round(10 * sc / (cssSize / 400))}px monospace`;
        const textWidth = ctx.measureText(label).width;
        const lx = tx + 10;
        const ly2 = ty - 10;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(lx - 2, ly2 - 11, textWidth + 6, 15);
        ctx.fillStyle = '#4338ca';
        ctx.fillText(label, lx, ly2);
      }
    },
    []
  );

  // Setup inicial y en resize
  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  // Redibujar cuando cambian datos
  useEffect(() => {
    redraw(vertices, spans, mouse, filled);
  }, [vertices, spans, mouse, filled, redraw]);

  // ── Manejadores de evento ─────────────────────────────────────────────────
  function getLogicalCoords(e: React.MouseEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return toLogical(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (filled) return;
    const pt = getLogicalCoords(e);
    setVertices((prev) => [...prev, pt]);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (filled) return;
    setMouse(getLogicalCoords(e));
  }

  function handleMouseLeave() {
    setMouse(null);
  }

  function handleFill() {
    if (vertices.length < 3) return;
    setSpans(fillPolygon(vertices));
    setFilled(true);
    setMouse(null);
  }

  function handleReset() {
    setVertices([]);
    setSpans([]);
    setFilled(false);
    setMouse(null);
    setJsonError('');
  }

  function handleExport() {
    const data = JSON.stringify({ vertices }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poligono.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed.vertices)) throw new Error('Formato inválido');
        const verts: Point[] = parsed.vertices.map((v: unknown) => {
          if (
            typeof v === 'object' && v !== null &&
            'x' in v && 'y' in v &&
            typeof (v as { x: unknown }).x === 'number' &&
            typeof (v as { y: unknown }).y === 'number'
          ) {
            return { x: (v as Point).x, y: (v as Point).y };
          }
          throw new Error('Vértice inválido');
        });
        setVertices(verts);
        setSpans([]);
        setFilled(false);
        setMouse(null);
        setJsonError('');
      } catch {
        setJsonError('JSON inválido. Asegúrate de usar el formato exportado por ScanLine Master.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleFill}
          disabled={vertices.length < 3 || filled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={14} /> Rellenar
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          <Trash2 size={14} /> Limpiar
        </button>
        <button
          onClick={handleExport}
          disabled={vertices.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          <Download size={14} /> Exportar JSON
        </button>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors">
          <Upload size={14} /> Importar JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        <span className="text-xs text-slate-400 ml-auto font-mono">
          {vertices.length} vértice(s)
          {mouse && !filled && ` · (${mouse.x}, ${mouse.y})`}
        </span>
      </div>

      {jsonError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {jsonError}
        </p>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={[
          'block w-full aspect-square rounded-xl border-2 shadow-sm',
          filled
            ? 'border-emerald-300 cursor-default'
            : 'border-indigo-300 cursor-crosshair',
        ].join(' ')}
        aria-label="Canvas de laboratorio — haz clic para agregar vértices"
      />

      {/* Tips */}
      <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700 space-y-1">
        <p><strong>Cómo usar:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 text-indigo-600">
          <li>Haz clic para agregar vértices (mínimo 3). Las coordenadas se muestran en tiempo real.</li>
          <li>El primer vértice (naranja) marca dónde se cerrará el polígono.</li>
          <li>La línea punteada muestra el borde que se cerrará al rellenar.</li>
          <li>Pulsa <strong>Rellenar</strong> para ejecutar el algoritmo Scan-Line.</li>
        </ul>
      </div>
    </div>
  );
}
