import { LabCanvas } from '../components/lab/LabCanvas';
import { Quiz } from '../components/quiz/Quiz';
import type { QuizQuestion } from '../components/quiz/Quiz';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: '¿Qué convención de vértices evita el doble conteo en los picos del polígono?',
    options: [
      'Incluir yMax, excluir yMin.',
      'Incluir yMin, excluir yMax, e ignorar aristas horizontales.',
      'Incluir todos los vértices en los picos.',
      'Excluir todos los vértices compartidos.',
    ],
    correct: 1,
    explanation:
      'La convención estándar es incluir el extremo inferior (yMin) y excluir el extremo superior (yMax) de cada arista. Las aristas horizontales se ignoran. Esto asegura que en un vértice "pico" se cuente exactamente un cruce, no dos.',
  },
  {
    question: 'Si dibujas un polígono no convexo (con concavidades), ¿cuántos spans puede haber en una misma scanline?',
    options: [
      'Siempre exactamente uno.',
      'Máximo dos.',
      'Puede haber más de uno si la scanline cruza múltiples "islas" del polígono.',
      'El algoritmo no puede manejar polígonos cóncavos.',
    ],
    correct: 2,
    explanation:
      'En un polígono cóncavo (como una estrella de 5 puntas), una scanline puede cruzar múltiples regiones del interior, generando más de un span por scanline. La regla even-odd maneja esto correctamente emparejando intersecciones de a dos.',
  },
  {
    question: '¿Cuál es la ventaja del incremento incremental x += 1/m vs. calcular la intersección desde cero en cada scanline?',
    options: [
      'El incremento es más preciso.',
      'El incremento solo requiere una suma por arista, no una división.',
      'El incremento funciona con aristas horizontales.',
      'El incremento elimina la necesidad de la Edge Table.',
    ],
    correct: 1,
    explanation:
      'Calcular la intersección desde cero requiere una división (y multiplicación) por scanline. Con x += 1/m, solo se hace una suma — el valor 1/m se computa una vez al crear la arista. Esto es especialmente eficiente en hardware con multiplicadores lentos (como el hardware de los 60-70s).',
  },
];

export function Laboratorio() {
  return (
    <main className="flex-1 max-w-5xl mx-auto px-6 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Laboratorio</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Dibuja tu propio polígono y ejecuta el algoritmo Scan-Line en tiempo real.
        </p>
      </header>

      {/* Canvas principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LabCanvas />
        </div>

        {/* Panel de info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">Cómo funciona</h2>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
              <li>Haz clic en el canvas para agregar vértices. El primer vértice (naranja) es el punto de cierre.</li>
              <li>Agrega al menos <strong>3 vértices</strong> para formar un polígono.</li>
              <li>Pulsa <strong>Rellenar</strong> para ejecutar el Scan-Line fill.</li>
              <li>El relleno se muestra en verde (emerald).</li>
              <li>Pulsa <strong>Limpiar</strong> para empezar de nuevo.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-slate-800">Export / Import</h2>
            <p className="text-sm text-slate-600">
              Guarda tus polígonos como JSON y compártelos. El formato es:
            </p>
            <pre className="text-xs bg-slate-50 rounded-lg p-3 text-slate-700 overflow-x-auto font-mono">
{`{
  "vertices": [
    { "x": 100, "y": 50 },
    { "x": 200, "y": 150 },
    { "x": 50,  "y": 150 }
  ]
}`}
            </pre>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-indigo-700">Tip: Polígonos interesantes para probar</p>
            <ul className="text-xs text-indigo-600 list-disc list-inside space-y-1">
              <li>Estrella de 5 puntas (polígono cóncavo)</li>
              <li>Letra L o T (casos con múltiples spans)</li>
              <li>Un triángulo simple (caso más básico)</li>
              <li>Un polígono con muchos vértices para ver la ET en acción</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quiz */}
      <section>
        <Quiz title="Quiz · Laboratorio" questions={QUIZ_QUESTIONS} />
      </section>
    </main>
  );
}
