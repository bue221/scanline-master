import type { Edge, Point } from './types';

/**
 * Construye la Edge Table (ET) a partir de los vértices del polígono.
 *
 * Convenciones:
 *  - Las aristas horizontales (p1.y === p2.y) se ignoran para evitar problemas de paridad.
 *  - yMin = extremo inferior de la arista → se incluye (scanline de entrada).
 *  - yMax = extremo superior de la arista → se excluye (scanline de salida).
 *  - xAtYMin = x del vértice donde la arista comienza (en yMin).
 *  - invSlope = Δx/Δy = 1/m (incremento de x por cada scanline).
 *
 * Retorna un Map<y, Edge[]> donde la clave es yMin de cada arista.
 */
export function buildEdgeTable(vertices: Point[]): Map<number, Edge[]> {
  const et = new Map<number, Edge[]>();
  const n = vertices.length;
  let edgeId = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const p1 = vertices[i];
    const p2 = vertices[j];

    // Ignorar aristas horizontales
    if (p1.y === p2.y) continue;

    const yMin = Math.min(p1.y, p2.y);
    const yMax = Math.max(p1.y, p2.y);
    const xAtYMin = p1.y < p2.y ? p1.x : p2.x;
    const invSlope = (p2.x - p1.x) / (p2.y - p1.y);

    const edge: Edge = {
      id: edgeId++,
      yMin,
      yMax,
      xAtYMin,
      invSlope,
      vertexI: i,
      vertexJ: j,
    };

    if (!et.has(yMin)) et.set(yMin, []);
    et.get(yMin)!.push(edge);
  }

  // Ordenar cada bucket por xAtYMin para consistencia inicial
  for (const edges of et.values()) {
    edges.sort((a, b) => a.xAtYMin - b.xAtYMin);
  }

  return et;
}

/** Retorna el rango Y del polígono [yMin, yMax] */
export function getYRange(vertices: Point[]): { yMin: number; yMax: number } {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const v of vertices) {
    if (v.y < yMin) yMin = v.y;
    if (v.y > yMax) yMax = v.y;
  }
  return { yMin, yMax };
}
