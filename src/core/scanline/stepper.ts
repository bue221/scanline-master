import type { AETEdge, Edge, Phase, Point, SimulatorStep, Span } from './types';
import { buildEdgeTable, getYRange } from './edgeTable';

function cloneAET(aet: AETEdge[]): AETEdge[] {
  return aet.map((e) => ({ ...e }));
}

function cloneSpans(spans: Span[]): Span[] {
  return spans.map((s) => ({ ...s }));
}

function makeStep(
  id: number,
  phase: Phase,
  y: number,
  et: Map<number, Edge[]>,
  vertices: Point[],
  aet: AETEdge[],
  filledSpans: Span[],
  intersections: number[],
  description: string,
  highlightY: boolean,
  newlyAddedIds: string[],
  removedEdgeIds: string[]
): SimulatorStep {
  return {
    id,
    phase,
    y,
    et,
    vertices,
    aet: cloneAET(aet),
    filledSpans: cloneSpans(filledSpans),
    intersections: [...intersections],
    description,
    highlightY,
    newlyAddedIds: [...newlyAddedIds],
    removedEdgeIds: [...removedEdgeIds],
  };
}

/**
 * Genera TODOS los pasos del algoritmo Scan-Line como snapshots inmutables.
 * Esto permite navegar hacia adelante y atrás sin re-ejecución.
 *
 * Orden de sub-pasos por scanline Y:
 *   SET-Y → REMOVE → ADD → SORT → FILL → INCREMENT
 */
export function generateSteps(vertices: Point[]): SimulatorStep[] {
  const steps: SimulatorStep[] = [];
  const et = buildEdgeTable(vertices);
  const { yMin, yMax } = getYRange(vertices);

  let stepId = 0;
  let aet: AETEdge[] = [];
  let filledSpans: Span[] = [];
  let currentNewlyAddedIds: string[] = [];

  const totalEdges = [...et.values()].flat().length;

  // ── PASO INICIAL: mostrar polígono y ET ──────────────────────────────────
  steps.push(
    makeStep(
      stepId++, 'init', yMin, et, vertices,
      aet, filledSpans, [],
      `Polígono cargado con ${vertices.length} vértices. La Tabla de Aristas (ET) contiene ${totalEdges} aristas (se ignoran las horizontales). El algoritmo procesará scanlines de Y = ${yMin} hasta Y = ${yMax - 1}.`,
      false, [], []
    )
  );

  for (let y = yMin; y < yMax; y++) {
    // ── SET-Y ────────────────────────────────────────────────────────────
    steps.push(
      makeStep(
        stepId++, 'set-y', y, et, vertices,
        aet, filledSpans, [],
        `Iniciando scanline Y = ${y}. Se verificarán las aristas que entran o salen de la AET.`,
        true, currentNewlyAddedIds, []
      )
    );

    // ── REMOVE: eliminar aristas que ya terminaron ────────────────────────
    const removed = aet.filter((e) => e.yMax <= y);
    const removedIds = removed.map((e) => String(e.id));
    if (removed.length > 0) {
      aet = aet.filter((e) => e.yMax > y);
      const desc =
        `Eliminadas ${removed.length} arista(s) de la AET cuyo yMax ≤ ${y}: ` +
        removed.map((e) => `[yMax=${e.yMax}, x≈${e.currentX.toFixed(2)}]`).join(', ') +
        '. Regla: se excluye el extremo superior (include yMin, exclude yMax).';
      steps.push(
        makeStep(
          stepId++, 'update-aet-remove', y, et, vertices,
          aet, filledSpans, [],
          desc, true, [], removedIds
        )
      );
    }

    // ── ADD: incorporar aristas que empiezan en este Y ────────────────────
    const toAdd = et.get(y) ?? [];
    if (toAdd.length > 0) {
      currentNewlyAddedIds = [];
      const newAETEdges: AETEdge[] = toAdd.map((e) => {
        const id = String(e.id);
        currentNewlyAddedIds.push(id);
        return { ...e, currentX: e.xAtYMin };
      });
      aet.push(...newAETEdges);
      const desc =
        `Agregadas ${toAdd.length} arista(s) desde ET[${y}] a la AET. ` +
        `x inicial = xAtYMin para cada una: ` +
        newAETEdges.map((e) => `x=${e.currentX.toFixed(2)}`).join(', ') + '.';
      steps.push(
        makeStep(
          stepId++, 'update-aet-add', y, et, vertices,
          aet, filledSpans, [],
          desc, true, currentNewlyAddedIds, []
        )
      );
    } else {
      // Si no hay aristas nuevas, limpiar el resaltado de nuevas
      currentNewlyAddedIds = [];
    }

    if (aet.length === 0) continue;

    // ── SORT: ordenar AET por currentX ───────────────────────────────────
    aet.sort((a, b) => a.currentX - b.currentX);
    const intersections = aet.map((e) => e.currentX);
    steps.push(
      makeStep(
        stepId++, 'sort', y, et, vertices,
        aet, filledSpans, intersections,
        `AET ordenada por X: [${intersections.map((x) => x.toFixed(2)).join(', ')}]. ` +
        `Lista de ${intersections.length} interseccion(es) lista para el emparejamiento even-odd.`,
        true, currentNewlyAddedIds, []
      )
    );

    // ── FILL: rellenar spans con la regla even-odd ───────────────────────
    const newSpans: Span[] = [];
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      const x1 = Math.ceil(intersections[i]);
      const x2 = Math.floor(intersections[i + 1]);
      if (x1 <= x2) newSpans.push({ y, x1, x2 });
    }
    filledSpans = [...filledSpans, ...newSpans];

    const spanDesc =
      newSpans.length > 0
        ? `Spans en Y=${y}: ` + newSpans.map((s) => `[${s.x1}, ${s.x2}]`).join(', ')
        : 'Sin spans (número impar de intersecciones o AET vacía)';

    steps.push(
      makeStep(
        stepId++, 'fill', y, et, vertices,
        aet, filledSpans, intersections,
        `Relleno even-odd: se emparejan intersecciones de dos en dos. ${spanDesc}. ` +
        `Total acumulado: ${filledSpans.length} span(s).`,
        true, [], []
      )
    );

    // ── INCREMENT: x += 1/m para el siguiente scanline ───────────────────
    aet.forEach((e) => {
      e.currentX += e.invSlope;
    });
    steps.push(
      makeStep(
        stepId++, 'increment', y, et, vertices,
        aet, filledSpans, [],
        `Actualización incremental: x += 1/m para cada arista activa. ` +
        `Nuevos x: [${aet.map((e) => e.currentX.toFixed(2)).join(', ')}]. Listos para Y=${y + 1}.`,
        false, [], []
      )
    );
  }

  // ── PASO FINAL ──────────────────────────────────────────────────────────
  steps.push(
    makeStep(
      stepId++, 'done', yMax, et, vertices,
      [], filledSpans, [],
      `¡Algoritmo completado! Se procesaron ${yMax - yMin} scanlines y se rellenaron ${filledSpans.length} span(s) en total.`,
      false, [], []
    )
  );

  return steps;
}

/** Versión rápida: devuelve solo los spans finales (para el Laboratorio) */
export function fillPolygon(vertices: Point[]): Span[] {
  const et = buildEdgeTable(vertices);
  const { yMin, yMax } = getYRange(vertices);
  let aet: AETEdge[] = [];
  const spans: Span[] = [];

  for (let y = yMin; y < yMax; y++) {
    aet = aet.filter((e) => e.yMax > y);
    const toAdd = et.get(y) ?? [];
    aet.push(...toAdd.map((e) => ({ ...e, currentX: e.xAtYMin })));
    if (aet.length === 0) continue;

    aet.sort((a, b) => a.currentX - b.currentX);
    for (let i = 0; i + 1 < aet.length; i += 2) {
      const x1 = Math.ceil(aet[i].currentX);
      const x2 = Math.floor(aet[i + 1].currentX);
      if (x1 <= x2) spans.push({ y, x1, x2 });
    }
    aet.forEach((e) => { e.currentX += e.invSlope; });
  }

  return spans;
}
