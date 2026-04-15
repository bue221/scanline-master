import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Keyboard, Gauge } from 'lucide-react';

const SPEEDS = [1, 2, 3, 4] as const;
type Speed = (typeof SPEEDS)[number];

interface Props {
  stepIndex: number;
  totalSteps: number;
  playing: boolean;
  speed: Speed;
  onPrev: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (s: Speed) => void;
  showShortcuts?: boolean;
}

export function StepControls({
  stepIndex,
  totalSteps,
  playing,
  speed,
  onPrev,
  onNext,
  onPlayPause,
  onReset,
  onSpeedChange,
  showShortcuts = true,
}: Props) {
  const isFirst = stepIndex === 0;
  const isLast  = stepIndex === totalSteps - 1;

  const btnBase =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="space-y-3">
      {/* Barra de progreso */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono w-24 shrink-0 text-right">
          {stepIndex + 1} / {totalSteps}
        </span>
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-150"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Controles principales + velocidad */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          disabled={isFirst}
          className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}
          aria-label="Reiniciar (R)"
        >
          <RotateCcw size={15} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Anterior */}
        <button
          onClick={onPrev}
          disabled={isFirst || playing}
          className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}
          aria-label="Paso anterior (P)"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          disabled={isLast}
          className={`${btnBase} ${
            playing
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          aria-label={playing ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          <span>{playing ? 'Pausar' : 'Play'}</span>
        </button>

        {/* Siguiente */}
        <button
          onClick={onNext}
          disabled={isLast || playing}
          className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}
          aria-label="Siguiente paso (N)"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* Selector de velocidad */}
        <div className="flex items-center gap-1" role="group" aria-label="Velocidad de reproducción">
          <Gauge size={14} className="text-slate-400 shrink-0" />
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={[
                'w-9 h-8 rounded-lg text-xs font-bold font-mono transition-colors',
                speed === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              ].join(' ')}
              aria-label={`Velocidad ${s}x (tecla ${s})`}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Atajos de teclado */}
      {showShortcuts && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Keyboard size={11} className="shrink-0" />
            Atajos:
          </span>
          {[
            ['Espacio', 'play/pausa'],
            ['N', 'siguiente'],
            ['P', 'anterior'],
            ['R', 'reset'],
            ['1–4', 'velocidad'],
          ].map(([key, label]) => (
            <span key={key}>
              <kbd className="font-mono bg-slate-100 px-1 rounded">{key}</kbd>
              {' '}{label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
