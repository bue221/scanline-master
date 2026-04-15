export interface Point {
  x: number;
  y: number;
}

export interface Edge {
  id: number;
  yMin: number;
  yMax: number;
  xAtYMin: number;
  invSlope: number; // 1/m = Δx/Δy (incremental step per scanline)
  vertexI: number;  // index of start vertex
  vertexJ: number;  // index of end vertex
}

export interface AETEdge extends Edge {
  currentX: number; // x intersection at current scanline Y
}

export interface Span {
  y: number;
  x1: number;
  x2: number;
}

export type Phase =
  | 'init'
  | 'set-y'
  | 'update-aet-remove'
  | 'update-aet-add'
  | 'sort'
  | 'fill'
  | 'increment'
  | 'done';

export interface SimulatorStep {
  id: number;
  phase: Phase;
  y: number;
  et: Map<number, Edge[]>;
  vertices: Point[];
  aet: AETEdge[];
  filledSpans: Span[];
  intersections: number[];
  description: string;
  highlightY: boolean;
  newlyAddedIds: string[];
  removedEdgeIds: string[];
}

export type PresetName = 'estrella' | 'flecha';
