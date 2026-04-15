import { useEffect, useRef } from 'react';
import type { SimulatorStep } from '../../core/scanline/types';

const GRID = 128; // unidades lógicas

interface Props {
  step: SimulatorStep;
  className?: string;
}

export function ScanlineCanvas({ step, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Configurar canvas con soporte DPR en cada resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setup() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssSize = Math.round(rect.width);
      if (cssSize === 0) return;
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(setup);
    ro.observe(canvas);
    setup(); // llamada inicial
    return () => ro.disconnect();
  }, []);

  // Redibujar en cada cambio de paso
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssSize = canvas.width / dpr;
    if (cssSize === 0) return;
    draw(ctx, cssSize, step);
  }, [step]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full aspect-square rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
      aria-label="Canvas de visualización del algoritmo Scan-Line"
    />
  );
}

// ── Dibujo principal ──────────────────────────────────────────────────────────
function draw(ctx: CanvasRenderingContext2D, size: number, step: SimulatorStep) {
  // Escala: pixels CSS por unidad lógica
  const S = size / GRID;

  ctx.clearRect(0, 0, size, size);

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  drawGrid(ctx, size, S);
  drawFilledSpans(ctx, step, S);
  drawScanlineHighlight(ctx, step, size, S);
  drawPolygon(ctx, step.vertices, S);
  drawIntersections(ctx, step, S);
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function drawGrid(ctx: CanvasRenderingContext2D, size: number, S: number) {
  // Líneas de celda secundarias (cada unidad lógica, muy sutiles)
  if (S >= 4) {
    ctx.strokeStyle = 'rgba(226,232,240,0.6)'; // slate-200 suave
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      const p = Math.round(i * S) + 0.5;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }
  }

  // Líneas de bloque principales (cada 16 unidades lógicas)
  ctx.strokeStyle = '#cbd5e1'; // slate-300
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i += 16) {
    const p = Math.round(i * S) + 0.5;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
  }
}

// ── Spans rellenados ──────────────────────────────────────────────────────────
function drawFilledSpans(ctx: CanvasRenderingContext2D, step: SimulatorStep, S: number) {
  const isFillPhase = step.phase === 'fill';

  // Spans acumulados previos
  const prevSpans = isFillPhase
    ? step.filledSpans.filter((s) => s.y !== step.y)
    : step.filledSpans;

  ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
  for (const span of prevSpans) {
    ctx.fillRect(
      Math.round(span.x1 * S),
      Math.round(span.y * S),
      Math.round((span.x2 - span.x1 + 1) * S),
      Math.round(S)
    );
  }

  // Spans del scanline actual (más vivos)
  if (isFillPhase) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    for (const span of step.filledSpans.filter((s) => s.y === step.y)) {
      ctx.fillRect(
        Math.round(span.x1 * S),
        Math.round(span.y * S),
        Math.round((span.x2 - span.x1 + 1) * S),
        Math.round(S)
      );
    }
  }
}

// ── Highlight del scanline actual ──────────────────────────────────────────────
function drawScanlineHighlight(
  ctx: CanvasRenderingContext2D,
  step: SimulatorStep,
  size: number,
  S: number
) {
  if (!step.highlightY) return;
  const yPx = Math.round(step.y * S);
  const height = Math.round(S);

  // Banda de fondo
  ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
  ctx.fillRect(0, yPx, size, height);

  // Línea central (punteada)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 3]);
  const cy = yPx + height / 2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(size, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Etiqueta Y
  const label = `Y=${step.y}`;
  ctx.font = `bold ${Math.max(10, Math.round(S * 0.7))}px monospace`;
  ctx.fillStyle = 'rgba(180, 120, 0, 0.85)';
  ctx.fillText(label, 4, cy + 4);
}

// ── Contorno del polígono ──────────────────────────────────────────────────────
// Los vértices se dibujan en el CENTRO del pixel (x + 0.5) para que el outline
// quede visualmente alineado con el fill, que cubre celdas completas [x*S, (x+1)*S).
// Sin el +0.5 el outline caería en la esquina izquierda del pixel, mientras el fill
// empieza en esa misma esquina → apariencia de "desplazado 1 px a la derecha".
function cx(x: number, S: number) { return (x + 0.5) * S; }
function cy(y: number, S: number) { return (y + 0.5) * S; }

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  vertices: { x: number; y: number }[],
  S: number
) {
  if (vertices.length < 2) return;

  // Relleno fantasma (muy sutil) para dar contexto
  ctx.fillStyle = 'rgba(99, 102, 241, 0.04)';
  ctx.beginPath();
  ctx.moveTo(cx(vertices[0].x, S), cy(vertices[0].y, S));
  for (let i = 1; i < vertices.length; i++) ctx.lineTo(cx(vertices[i].x, S), cy(vertices[i].y, S));
  ctx.closePath();
  ctx.fill();

  // Contorno
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = Math.max(1, S * 0.2);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx(vertices[0].x, S), cy(vertices[0].y, S));
  for (let i = 1; i < vertices.length; i++) ctx.lineTo(cx(vertices[i].x, S), cy(vertices[i].y, S));
  ctx.closePath();
  ctx.stroke();

  // Vértices — también en el centro del pixel
  const vRadius = Math.max(2, S * 0.4);
  ctx.fillStyle = '#4f46e5';
  for (const v of vertices) {
    ctx.beginPath();
    ctx.arc(cx(v.x, S), cy(v.y, S), vRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Intersecciones ────────────────────────────────────────────────────────────
function drawIntersections(
  ctx: CanvasRenderingContext2D,
  step: SimulatorStep,
  S: number
) {
  if (!step.highlightY || step.intersections.length === 0) return;

  const yPx = Math.round(step.y * S);
  const midY = yPx + Math.round(S) / 2;  // centro vertical del scanline
  const radius = Math.max(3, S * 0.45);

  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, S * 0.15);

  for (const x of step.intersections) {
    const dotX = x * S; // posición exacta de la intersección (float, sin redondear)
    ctx.beginPath();
    ctx.arc(dotX, midY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Línea vertical a lo largo del scanline en la posición exacta
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dotX, yPx);
    ctx.lineTo(dotX, yPx + Math.round(S));
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, S * 0.15);
  }
}
