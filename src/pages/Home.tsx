import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, FlaskConical, ChevronRight } from 'lucide-react';
import { fillPolygon } from '../core/scanline/stepper';
import { STAR_PRESET } from '../core/scanline/presets';
import type { Span } from '../core/scanline/types';

const DEMO_CANVAS = 300;
const SCALE = DEMO_CANVAS / 128;

// Pre-computar todos los spans para la animación del demo
const ALL_SPANS = fillPolygon(STAR_PRESET);

function MiniDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [animSpans, setAnimSpans] = useState<Span[]>([]);

  useEffect(() => {
    let idx = 0;
    let lastTime = 0;
    const DELAY = 18; // ms por scanline

    function tick(now: number) {
      if (now - lastTime > DELAY) {
        lastTime = now;
        // Agregar spans del siguiente scanline (puede haber varios)
        const nextY = idx < ALL_SPANS.length ? ALL_SPANS[idx].y : -1;
        const batch: Span[] = [];
        while (idx < ALL_SPANS.length && ALL_SPANS[idx].y === nextY) {
          batch.push(ALL_SPANS[idx]);
          idx++;
        }
        if (batch.length > 0) {
          setAnimSpans((prev) => [...prev, ...batch]);
        } else {
          // Reiniciar animación
          idx = 0;
          setAnimSpans([]);
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, DEMO_CANVAS, DEMO_CANVAS);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, DEMO_CANVAS, DEMO_CANVAS);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 128; i += 16) {
      ctx.beginPath(); ctx.moveTo(i * SCALE, 0); ctx.lineTo(i * SCALE, DEMO_CANVAS); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * SCALE); ctx.lineTo(DEMO_CANVAS, i * SCALE); ctx.stroke();
    }

    // Spans
    ctx.fillStyle = 'rgba(16,185,129,0.6)';
    for (const s of animSpans) {
      ctx.fillRect(s.x1 * SCALE, s.y * SCALE, (s.x2 - s.x1 + 1) * SCALE, SCALE);
    }

    // Contorno estrella
    const v = STAR_PRESET;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(v[0].x * SCALE, v[0].y * SCALE);
    for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x * SCALE, v[i].y * SCALE);
    ctx.closePath();
    ctx.stroke();
  }, [animSpans]);

  return (
    <canvas
      ref={canvasRef}
      width={DEMO_CANVAS}
      height={DEMO_CANVAS}
      className="rounded-xl border border-slate-200 shadow-lg"
      aria-label="Demo animada del algoritmo Scan-Line rellenando una estrella"
    />
  );
}

export function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-indigo-800/40 text-indigo-100 text-xs font-mono px-3 py-1 rounded-full tracking-wider">
              Computación Gráfica · Algoritmos Clásicos
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              ScanLine Master
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-lg">
              Aprende cómo los computadores rellenan polígonos paso a paso:
              del mundo continuo al mundo discreto de los píxeles.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/simulador"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow"
              >
                <Play size={16} /> Ver Paso a Paso
              </Link>
              <Link
                to="/fundamentos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-800/40 text-white font-semibold text-sm hover:bg-indigo-800/60 transition-colors"
              >
                <BookOpen size={16} /> Fundamentos
              </Link>
            </div>
          </div>

          {/* Mini demo animada */}
          <div className="shrink-0">
            <MiniDemo />
          </div>
        </div>

        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />
      </section>

      {/* Conceptos clave */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">¿Qué aprenderás?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📐',
              title: 'Lo continuo vs. lo discreto',
              desc: 'Un polígono matemático existe en el espacio continuo. La pantalla es una cuadrícula finita de píxeles. Aprende cómo se hace la transición.',
              to: '/fundamentos',
            },
            {
              icon: '⚡',
              title: 'El algoritmo paso a paso',
              desc: 'La Edge Table, la Active Edge Table y la regla even-odd: ve cómo el algoritmo Scan-Line llena el polígono scanline por scanline.',
              to: '/simulador',
            },
            {
              icon: '🧪',
              title: 'Experimenta en vivo',
              desc: 'Dibuja tu propio polígono en el Laboratorio y ejecuta el relleno al instante. Exporta e importa polígonos en JSON.',
              to: '/laboratorio',
            },
          ].map(({ icon, title, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
            >
              <span className="text-3xl">{icon}</span>
              <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium">
                Explorar <ChevronRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sección de rutas */}
      <section className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Recorrido sugerido</h2>
          <ol className="space-y-3">
            {[
              { label: 'Fundamentos', desc: 'Regla de paridad, ecuación de intersección, fórmulas.', to: '/fundamentos', icon: <BookOpen size={18}/> },
              { label: 'Paso a Paso', desc: 'El simulador interactivo con AET en tiempo real.', to: '/simulador', icon: <Play size={18}/> },
              { label: 'Historia', desc: 'Ivan Sutherland, Teorema de Jordan y hitos clave.', to: '/historia', icon: '🕐' },
              { label: 'Laboratorio', desc: 'Dibuja tu polígono y ejecuta el relleno libremente.', to: '/laboratorio', icon: <FlaskConical size={18}/> },
            ].map(({ label, desc, to, icon }, i) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-indigo-500 shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{label}</p>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
