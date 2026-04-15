import { Link } from 'react-router-dom';
import { Formula } from '../components/common/Formula';
import { Quiz } from '../components/quiz/Quiz';
import type { QuizQuestion } from '../components/quiz/Quiz';
import { Cpu, ArrowRight } from 'lucide-react';

// ── Quiz ──────────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question:
      '¿Cuál es la ventaja de complejidad del Scan-Line frente a revisar todos los píxeles de pantalla?',
    options: [
      'Ambos son O(N²), pero el Scan-Line usa menos memoria.',
      'El Scan-Line es O(filas × intersecciones), evitando revisar píxeles fuera del polígono.',
      'El Scan-Line es O(1) gracias al hardware GPU.',
      'No hay diferencia práctica en pantallas modernas.',
    ],
    correct: 1,
    explanation:
      'En lugar de iterar sobre TODOS los píxeles de la pantalla (O(ancho × alto)), el Scan-Line solo visita las filas donde existe el polígono y dentro de ellas solo los píxeles entre pares de intersecciones. Esto lo hace O(filas × intersecciones_promedio).',
  },
  {
    question: '¿Qué permite la interpolación lineal durante el recorrido del Scan-Line?',
    options: [
      'Reducir el número de intersecciones con la AET.',
      'Calcular color, textura y profundidad (Z) por cada píxel sin bucles adicionales.',
      'Detectar si un polígono es convexo o cóncavo.',
      'Acelerar la construcción de la Edge Table.',
    ],
    correct: 1,
    explanation:
      'Mientras el algoritmo avanza de x_inicio a x_fin en cada scanline, puede interpolar linealmente cualquier atributo del vértice (color, coordenada de textura UV, profundidad Z). Esto es lo que convierte un relleno sólido en sombreado Gouraud, texture mapping o Z-buffering — todo en el mismo recorrido.',
  },
  {
    question: '¿Por qué las fuentes tipográficas en pantalla usan un principio similar al Scan-Line?',
    options: [
      'Porque las fuentes también están almacenadas como bitmaps fijos.',
      'Porque los glifos son polígonos vectoriales que deben rasterizarse a píxeles en cada render.',
      'Porque el estándar OpenType obliga a usar Scan-Line.',
      'Solo las fuentes de baja resolución usan este principio.',
    ],
    correct: 1,
    explanation:
      'Las fuentes TrueType y OpenType definen los glifos como curvas de Bézier (vectores). Cada vez que el sistema renderiza texto, convierte esas curvas en contornos poligonales y aplica rasterización (scan-line + antialiasing) para decidir qué píxeles encender y con qué intensidad — en tiempo real, para cada carácter, a cada tamaño.',
  },
];

// ── Componentes internos ──────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className={`flex items-center gap-3 px-6 py-4 ${accent}`}>
        <span className="text-2xl">{icon}</span>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4 text-slate-700 leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-slate-100 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

// ── Diagrama del pipeline ─────────────────────────────────────────────────────
function PipelineDiagram() {
  const stages = [
    { label: 'Geometría 3D', sub: 'vértices del modelo', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { label: 'Vertex Shader', sub: 'proyección 2D', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Rasterización', sub: 'Scan-Line → píxeles', color: 'bg-indigo-100 text-indigo-800 border-indigo-400', highlight: true },
    { label: 'Fragment Shader', sub: 'color, textura, Z', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Frame Buffer', sub: 'pantalla final', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max mx-auto w-fit">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div
              className={[
                'flex flex-col items-center justify-center px-4 py-3 rounded-xl border-2 text-center w-32',
                s.color,
                s.highlight ? 'ring-2 ring-offset-2 ring-indigo-500 font-bold' : '',
              ].join(' ')}
            >
              <span className="text-xs font-semibold leading-tight">{s.label}</span>
              <span className="text-[10px] opacity-70 mt-0.5 leading-tight">{s.sub}</span>
            </div>
            {i < stages.length - 1 && (
              <ArrowRight size={14} className="text-slate-400 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Visualización de complejidad ──────────────────────────────────────────────
function ComplexityBar({
  label,
  pct,
  color,
  formula,
}: {
  label: string;
  pct: number;
  color: string;
  formula: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-slate-500">
          <Formula formula={formula} />
        </span>
      </div>
      <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export function Aplicaciones() {
  return (
    <main className="flex-1 max-w-4xl mx-auto px-6 py-10 space-y-12">

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
          <Cpu size={13} /> Computación Gráfica Aplicada
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Scan-Line en el mundo real
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
          Este algoritmo es la base de la <strong className="text-slate-700">rasterización</strong> —
          el proceso que convierte figuras geométricas matemáticas (vectores) en los píxeles reales
          que estás viendo en tu monitor ahora mismo.
        </p>
      </header>

      {/* Pipeline del GPU */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 space-y-4">
        <h2 className="font-bold text-lg">El pipeline gráfico de tu GPU</h2>
        <p className="text-indigo-100 text-sm leading-relaxed">
          Cuando una GPU recibe un triángulo 3D (por ejemplo, la cara de un personaje en un videojuego),
          lo procesa en etapas. La rasterización es la que convierte la geometría en píxeles:
        </p>
        <PipelineDiagram />
        <p className="text-indigo-200 text-xs">
          El paso <strong className="text-white">Rasterización</strong> (resaltado) es donde vive el Scan-Line.
          La GPU proyecta el triángulo 3D al plano 2D y luego usa este algoritmo para decidir
          qué píxeles pertenecen al interior.
        </p>
      </section>

      {/* Sección 1: Rasterización */}
      <SectionCard
        icon="🖥️"
        title="1. Rasterización — la eficiencia que escala"
        accent="bg-indigo-50 text-indigo-800"
      >
        <p>
          El enfoque ingenuo sería revisar cada píxel de la pantalla Full HD
          (1920 × 1080 = <strong>2 millones de píxeles</strong>) por cada polígono y
          preguntar: "¿está este punto dentro del triángulo?". Eso es una complejidad de:
        </p>

        {/* Comparativa de complejidad */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Comparativa de complejidad</p>
          <ComplexityBar
            label="Brute force (revisar toda la pantalla)"
            pct={95}
            color="bg-red-400"
            formula="O(W \times H)"
          />
          <ComplexityBar
            label="Scan-Line (solo filas del polígono)"
            pct={18}
            color="bg-emerald-400"
            formula="O(\text{filas} \times \bar{n})"
          />
          <p className="text-xs text-slate-500">
            Donde <InlineCode>filas</InlineCode> = alto del polígono en pantalla y{' '}
            <InlineCode>n̄</InlineCode> = número promedio de intersecciones por scanline (típicamente 2–6).
            Para un polígono que ocupa el 10% de la pantalla, el Scan-Line puede ser{' '}
            <strong className="text-emerald-700">50–100× más rápido</strong>.
          </p>
        </div>

        <p>
          La Edge Table concentra toda la información relevante por fila de antemano —
          el algoritmo <em>sabe exactamente</em> dónde mirar sin explorar lo que no existe.
          Esto es gestión de recursos, no solo matemáticas.
        </p>
      </SectionCard>

      {/* Sección 2: Interpolación */}
      <SectionCard
        icon="🎨"
        title="2. Sombreado, texturas y Z-Buffer — interpolación por scan"
        accent="bg-purple-50 text-purple-800"
      >
        <p>
          El Scan-Line no solo pinta color sólido. Mientras recorre la línea horizontal
          de <InlineCode>x_inicio</InlineCode> a <InlineCode>x_fin</InlineCode>, puede interpolar
          linealmente cualquier atributo del vértice por cada píxel:
        </p>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-600">Fórmula de interpolación lineal (lerp)</p>
          <div className="text-center py-2">
            <Formula
              formula="v(x) = v_1 + \frac{x - x_1}{x_2 - x_1} \cdot (v_2 - v_1)"
              display
            />
          </div>
          <p className="text-xs text-slate-500">
            Donde <Formula formula="v" /> es el atributo a interpolar (color, textura UV, profundidad Z)
            y <Formula formula="x_1, x_2" /> son los extremos del span actual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: '🌈',
              title: 'Gouraud Shading',
              desc: 'Vértice izquierdo rojo, derecho azul → degradado interpolado píxel a píxel. Base del sombreado suave sin costoso cálculo por-fragmento.',
            },
            {
              icon: '🖼️',
              title: 'Texture Mapping',
              desc: 'Interpolación de coordenadas UV: cada píxel del span sabe exactamente qué texel de la imagen le corresponde.',
            },
            {
              icon: '📐',
              title: 'Z-Buffer',
              desc: 'Interpolación de profundidad: si el valor Z del píxel actual es mayor al almacenado, ese píxel está tapado y no se dibuja.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
              <span className="text-xl">{icon}</span>
              <p className="font-semibold text-slate-800 text-xs">{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-slate-600">
          Todo esto ocurre en el mismo recorrido horizontal — el Scan-Line es un{' '}
          <em>pipeline de interpolación</em> disfrazado de algoritmo de relleno.
        </p>
      </SectionCard>

      {/* Sección 3: Antialiasing */}
      <SectionCard
        icon="✨"
        title="3. Antialiasing — cuando el 50% importa"
        accent="bg-amber-50 text-amber-800"
      >
        <p>
          ¿Has notado que las líneas inclinadas a veces parecen "escaleras de píxeles"?
          Ese fenómeno se llama <strong>aliasing</strong>. Una variante del Scan-Line
          lo mitiga calculando la <em>cobertura</em> de cada píxel:
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Aliased */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-600">Sin antialiasing</p>
            <div className="rounded-lg bg-slate-900 p-3 grid grid-cols-5 gap-0.5">
              {[
                1,0,0,0,0,
                1,1,0,0,0,
                0,1,1,0,0,
                0,0,1,1,0,
                0,0,0,1,1,
              ].map((v, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${v ? 'bg-white' : 'bg-slate-800'}`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">Borde = encendido o apagado (1 o 0)</p>
          </div>

          {/* Anti-aliased */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-600">Con antialiasing</p>
            <div className="rounded-lg bg-slate-900 p-3 grid grid-cols-5 gap-0.5">
              {[
                0.9,0.2,0,  0,  0,
                0.8,0.9,0.2,0,  0,
                0.1,0.8,0.9,0.2,0,
                0,  0.1,0.8,0.9,0.1,
                0,  0,  0.1,0.8,0.9,
              ].map((v, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: `rgba(255,255,255,${v})` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">Cobertura parcial → intensidad proporcional</p>
          </div>
        </div>

        <p>
          Si el polígono cubre el <strong>50% de un píxel</strong>, se pinta con{' '}
          <strong>50% de intensidad</strong>. El Scan-Line calcula este porcentaje
          comparando el área de intersección entre el píxel (cuadrado unitario) y
          el borde del polígono — sin iterar sobre sub-píxeles de forma ingenua.
        </p>
      </SectionCard>

      {/* Sección 4: Implementaciones */}
      <SectionCard
        icon="⚙️"
        title="4. Dónde sigue vivo hoy"
        accent="bg-emerald-50 text-emerald-800"
      >
        <p>
          Las GPUs modernas usan <em>Tiled Rendering</em> y pipelines masivamente paralelos,
          pero el concepto Scan-Line sigue presente en:
        </p>

        <ul className="space-y-3">
          {[
            {
              title: 'Software Renderers',
              icon: '💻',
              desc: 'Sistemas embebidos sin GPU (microcontroladores, terminales), emuladores, y renderers de CPU como el de Doom (1993) o el runtime de WebAssembly. Cuando no hay aceleración por hardware, el Scan-Line en CPU es el camino.',
            },
            {
              title: 'Renderizado de fuentes tipográficas',
              icon: '🔤',
              desc: 'Cada carácter que ves en pantalla es una curva de Bézier (TrueType / OpenType) que se rasteriza en tiempo real. FreeType, el motor de fuentes de Linux/Android/macOS, usa exactamente este algoritmo para rellenar los contornos de cada glifo a cada tamaño y resolución.',
            },
            {
              title: 'Impresoras y plotters',
              icon: '🖨️',
              desc: 'Un PDF es geometría vectorial. Ghostscript y los RIPs (Raster Image Processors) de impresoras láser convierten esos vectores a puntos físicos usando Scan-Line fill antes de enviar la imagen al motor de impresión.',
            },
            {
              title: 'Ray casting en videojuegos retro',
              icon: '🎮',
              desc: 'Doom y Wolfenstein 3D usan variantes del Scan-Line para renderizar columnas de píxeles verticales — una transformación del algoritmo del 2D al pseudo-3D que fue revolucionaria para su época.',
            },
          ].map(({ title, icon, desc }) => (
            <li key={title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Perspectiva de ingeniería de sistemas */}
      <section className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-indigo-600 shrink-0" />
          <h2 className="font-bold text-indigo-800 text-lg">Perspectiva de Ingeniería de Sistemas</h2>
        </div>

        <p className="text-indigo-800 text-sm leading-relaxed">
          Para un ingeniero de sistemas, el Scan-Line es básicamente un problema de{' '}
          <strong>gestión de memoria y ciclos de CPU</strong>. Analízalo así:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Enfoque ingenuo</p>
            <div className="text-center py-1">
              <Formula formula="\text{for } y \in [0, H]: \text{ for } x \in [0, W]: \text{ test}(x, y)" display />
            </div>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• <Formula formula="W \times H" /> iteraciones por polígono</li>
              <li>• Cache miss masivos (acceso no secuencial)</li>
              <li>• Escala mal con resolución: 4K = 4× más trabajo</li>
            </ul>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Scan-Line</p>
            <div className="text-center py-1">
              <Formula formula="\text{for } y \in [y_{min}, y_{max}]: \text{ fill}(x_1, x_2)" display />
            </div>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Solo filas donde existe el polígono</li>
              <li>• Acceso secuencial a memoria (cache-friendly)</li>
              <li>• La AET amortiza el costo de intersección</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-indigo-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-700">El truco clave: coherencia espacial</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            El Scan-Line explota el hecho de que las intersecciones de una arista con
            scanlines consecutivas son <em>casi iguales</em>: solo cambian en{' '}
            <Formula formula="\Delta x = 1/m" />. Esto es{' '}
            <strong>coherencia espacial</strong> — el mismo principio que hace eficientes
            los índices B-tree, los caches de CPU y los skip lists. En lugar de recomputar,
            se <em>actualiza incrementalmente</em>.
          </p>
        </div>

        <p className="text-indigo-700 text-sm">
          <strong>Analogía directa:</strong> la AET es una estructura de datos de{' '}
          <em>estado diferencial</em> — como un changelog en una base de datos replicada.
          No se recalcula todo desde cero; solo se aplican los deltas (aristas que entran o salen)
          en cada paso. Eso es O(cambios) por scanline, no O(estado total).
        </p>
      </section>

      {/* Teaser: polígonos con huecos */}
      <section className="rounded-2xl border border-dashed border-indigo-300 bg-white p-6 space-y-3">
        <p className="font-semibold text-slate-800">¿Y los polígonos con huecos internos?</p>
        <p className="text-slate-600 text-sm leading-relaxed">
          Una letra <strong>'O'</strong> o una <strong>'A'</strong> tiene un hueco interior.
          La regla even-odd los maneja naturalmente: si la scanline cruza 4 aristas,
          los pares (1,2) y (3,4) definen zonas rellenas, pero el espacio entre (2,3) queda vacío —
          exactamente el hueco de la letra.
        </p>
        <div className="flex gap-2">
          <Link
            to="/simulador"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Verlo en el simulador
          </Link>
          <Link
            to="/laboratorio"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Dibujarlo en el laboratorio
          </Link>
        </div>
      </section>

      {/* Quiz */}
      <section>
        <Quiz title="Quiz · Aplicaciones" questions={QUIZ_QUESTIONS} />
      </section>
    </main>
  );
}
