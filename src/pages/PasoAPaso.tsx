import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScanlineCanvas } from '../components/simulator/ScanlineCanvas';
import { StepControls } from '../components/simulator/StepControls';
import { AETTable } from '../components/simulator/AETTable';
import { StepConsole } from '../components/simulator/StepConsole';
import { PRESETS } from '../core/scanline/presets';
import { generateSteps } from '../core/scanline/stepper';
import type { PresetName } from '../core/scanline/types';

const BASE_INTERVAL_MS = 600;
const SPEEDS = [1, 2, 3, 4] as const;
type Speed = (typeof SPEEDS)[number];

export function PasoAPaso() {
  const [preset, setPreset] = useState<PresetName>('estrella');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const vertices = PRESETS[preset];

  // Generar pasos solo cuando cambia el preset
  const steps = useMemo(() => generateSteps(vertices), [vertices]);

  const currentStep = steps[stepIndex];

  // ── Navegación ────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goReset = useCallback(() => {
    setPlaying(false);
    setStepIndex(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (stepIndex >= steps.length - 1) return;
    setPlaying((p) => !p);
  }, [stepIndex, steps.length]);

  // ── Auto-play (se reinicia si cambia speed mientras reproduce) ───────────
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIndex((i) => {
          if (i >= steps.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, BASE_INTERVAL_MS / speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, steps.length]);

  // ── Atajos de teclado ──────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // No disparar si el foco está en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.code === 'KeyN') { e.preventDefault(); if (!playing) goNext(); }
      else if (e.code === 'KeyP') { e.preventDefault(); if (!playing) goPrev(); }
      else if (e.code === 'KeyR') { e.preventDefault(); goReset(); }
      else if (e.code === 'Digit1') { e.preventDefault(); setSpeed(1); }
      else if (e.code === 'Digit2') { e.preventDefault(); setSpeed(2); }
      else if (e.code === 'Digit3') { e.preventDefault(); setSpeed(3); }
      else if (e.code === 'Digit4') { e.preventDefault(); setSpeed(4); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, goNext, goPrev, goReset, playing]);

  // Detener play al llegar al final
  useEffect(() => {
    if (stepIndex >= steps.length - 1) setPlaying(false);
  }, [stepIndex, steps.length]);

  // Resetear al cambiar preset
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [preset]);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulador Paso a Paso</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Navega subpaso a subpaso y ve cómo evoluciona la AET en tiempo real.
          </p>
        </div>

        {/* Selector de preset */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">Polígono:</span>
          {(['estrella', 'flecha'] as PresetName[]).map((name) => (
            <button
              key={name}
              onClick={() => setPreset(name)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                preset === name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              {name === 'estrella' ? '⭐ Estrella' : '⬆️ Flecha'}
            </button>
          ))}
        </div>
      </div>

      {/* Layout principal: canvas + panel derecho */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <ScanlineCanvas step={currentStep} />

          {/* Leyenda del canvas */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Span rellenado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block opacity-50" />
              Scanline actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              Intersección
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              Polígono
            </span>
          </div>
        </div>

        {/* Panel derecho: AET + Consola */}
        <div className="lg:col-span-2 space-y-4">
          <AETTable step={currentStep} />
          <StepConsole step={currentStep} stepIndex={stepIndex} totalSteps={steps.length} />
        </div>
      </div>

      {/* Controles de paso */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <StepControls
          stepIndex={stepIndex}
          totalSteps={steps.length}
          playing={playing}
          speed={speed}
          onPrev={goPrev}
          onNext={goNext}
          onPlayPause={togglePlay}
          onReset={goReset}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* Info educativa */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Guía de sub-pasos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { phase: 'init',                label: 'INIT',    desc: 'Mostrar polígono y ET', color: 'bg-slate-100 text-slate-600' },
            { phase: 'set-y',               label: 'SET-Y',   desc: 'Iniciar scanline Y', color: 'bg-amber-100 text-amber-700' },
            { phase: 'update-aet-remove',   label: 'REMOVE',  desc: 'Eliminar aristas viejas', color: 'bg-red-100 text-red-700' },
            { phase: 'update-aet-add',      label: 'ADD',     desc: 'Agregar aristas nuevas', color: 'bg-blue-100 text-blue-700' },
            { phase: 'sort',                label: 'SORT',    desc: 'Ordenar AET por X', color: 'bg-purple-100 text-purple-700' },
            { phase: 'fill',                label: 'FILL',    desc: 'Rellenar spans even-odd', color: 'bg-emerald-100 text-emerald-700' },
            { phase: 'increment',           label: 'x+=1/m',  desc: 'Actualización incremental', color: 'bg-indigo-100 text-indigo-700' },
          ].map(({ phase, label, desc, color }) => (
            <div
              key={phase}
              className={[
                'rounded-lg p-2.5 text-center text-xs space-y-0.5',
                color,
                currentStep.phase === phase ? 'ring-2 ring-offset-1 ring-indigo-500' : '',
              ].join(' ')}
            >
              <p className="font-bold font-mono">{label}</p>
              <p className="opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
