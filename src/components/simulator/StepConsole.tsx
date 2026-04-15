import type { SimulatorStep } from '../../core/scanline/types';

const PHASE_ICONS: Record<string, string> = {
  init: '📋',
  'set-y': '➡️',
  'update-aet-remove': '🗑️',
  'update-aet-add': '➕',
  sort: '↕️',
  fill: '🖌️',
  increment: '📐',
  done: '✅',
};

interface Props {
  step: SimulatorStep;
  stepIndex: number;
  totalSteps: number;
}

export function StepConsole({ step, stepIndex, totalSteps }: Props) {
  const icon = PHASE_ICONS[step.phase] ?? '•';

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <span>Paso {stepIndex + 1}/{totalSteps}</span>
        <span>·</span>
        <span className="text-indigo-600 font-semibold">{step.phase}</span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed step-fade">
        <span className="mr-1">{icon}</span>
        {step.description}
      </p>

      {/* Spans actuales (si aplica) */}
      {step.phase === 'fill' && step.filledSpans.filter((s) => s.y === step.y).length > 0 && (
        <div className="rounded bg-emerald-50 border border-emerald-200 px-3 py-2">
          <p className="text-xs text-emerald-700 font-medium">
            Spans rellenados en Y={step.y}:&nbsp;
            <span className="font-mono">
              {step.filledSpans
                .filter((s) => s.y === step.y)
                .map((s) => `[${s.x1}, ${s.x2}]`)
                .join('  ')}
            </span>
          </p>
        </div>
      )}

      {step.phase === 'done' && (
        <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 font-medium">
          Relleno completado. Total de spans: {step.filledSpans.length}.
        </div>
      )}
    </div>
  );
}
