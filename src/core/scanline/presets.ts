import type { Point } from './types';

// 5-pointed star — center (64,64), outer radius 55, inner radius 23
// Convex punta arriba, cóncava (10 vértices alternados exterior/interior)
export const STAR_PRESET: Point[] = [
  { x: 64,  y: 9  }, // punta superior
  { x: 78,  y: 45 }, // interior derecho-arriba
  { x: 116, y: 47 }, // punta derecha
  { x: 86,  y: 71 }, // interior derecho-abajo
  { x: 96,  y: 109 }, // punta inferior-derecha
  { x: 64,  y: 87 }, // interior inferior
  { x: 32,  y: 109 }, // punta inferior-izquierda
  { x: 42,  y: 71 }, // interior izquierdo-abajo
  { x: 12,  y: 47 }, // punta izquierda
  { x: 51,  y: 45 }, // interior izquierdo-arriba
];

// Flecha apuntando hacia arriba — preset más sencillo para aprender
export const ARROW_PRESET: Point[] = [
  { x: 64, y: 12  }, // punta de la flecha
  { x: 110, y: 56 }, // ala derecha
  { x: 84,  y: 56 }, // cuello derecho arriba
  { x: 84,  y: 110 }, // cuello derecho abajo
  { x: 44,  y: 110 }, // cuello izquierdo abajo
  { x: 44,  y: 56 }, // cuello izquierdo arriba
  { x: 18,  y: 56 }, // ala izquierda
];

export const PRESETS: Record<string, Point[]> = {
  estrella: STAR_PRESET,
  flecha: ARROW_PRESET,
};
