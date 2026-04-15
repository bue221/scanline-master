import type { SimulatorStep } from '../../core/scanline/types';

interface Props {
  step: SimulatorStep;
}

const PHASE_LABELS: Record<string, string> = {
  init: 'Inicial',
  'set-y': 'Scanline Y',
  'update-aet-remove': 'Eliminar aristas',
  'update-aet-add': 'Agregar aristas',
  sort: 'Ordenar por X',
  fill: 'Rellenar spans',
  increment: 'Incrementar X',
  done: 'Completado',
};

const PHASE_COLORS: Record<string, string> = {
  init: 'bg-slate-100 text-slate-600',
  'set-y': 'bg-amber-100 text-amber-700',
  'update-aet-remove': 'bg-red-100 text-red-700',
  'update-aet-add': 'bg-blue-100 text-blue-700',
  sort: 'bg-purple-100 text-purple-700',
  fill: 'bg-emerald-100 text-emerald-700',
  increment: 'bg-indigo-100 text-indigo-700',
  done: 'bg-green-100 text-green-700',
};

export function AETTable({ step }: Props) {
  const { aet, phase, newlyAddedIds, removedEdgeIds, y } = step;

  return (
    <div className="space-y-3">
      {/* Fase actual */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Active Edge Table (AET)</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            PHASE_COLORS[phase] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {PHASE_LABELS[phase] ?? phase}
        </span>
      </div>

      {/* Scanline actual */}
      <div className="text-xs text-slate-500">
        Scanline: <span className="font-mono font-semibold text-amber-600">Y = {y}</span>
      </div>

      {/* Tabla AET */}
      {aet.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          AET vacía
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left font-semibold text-slate-600">yMin</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">yMax</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">xAtYMin</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">1/m</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 text-amber-600">currentX</th>
              </tr>
            </thead>
            <tbody>
              {aet.map((edge) => {
                const isNew = newlyAddedIds.includes(String(edge.id));
                const isRemoved = removedEdgeIds.includes(String(edge.id));
                let rowCls = 'border-b border-slate-100 ';
                if (isNew) rowCls += 'bg-blue-50';
                else if (isRemoved) rowCls += 'bg-red-50 line-through text-red-400';
                else rowCls += 'hover:bg-slate-50';

                return (
                  <tr key={edge.id} className={rowCls}>
                    <td className="px-3 py-1.5 font-mono">{edge.yMin}</td>
                    <td className="px-3 py-1.5 font-mono">{edge.yMax}</td>
                    <td className="px-3 py-1.5 font-mono">{edge.xAtYMin.toFixed(1)}</td>
                    <td className="px-3 py-1.5 font-mono">{edge.invSlope.toFixed(3)}</td>
                    <td className="px-3 py-1.5 font-mono font-semibold text-indigo-600">
                      {edge.currentX.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Nueva
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Activa
        </span>
      </div>

      {/* Intersecciones */}
      {step.intersections.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Intersecciones (X ordenado):</p>
          <p className="font-mono text-xs text-amber-800">
            [{step.intersections.map((x) => x.toFixed(2)).join(', ')}]
          </p>
        </div>
      )}
    </div>
  );
}
