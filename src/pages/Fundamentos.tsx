import { Formula } from '../components/common/Formula';
import { Quiz } from '../components/quiz/Quiz';
import type { QuizQuestion } from '../components/quiz/Quiz';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: '¿Qué determina si un píxel se rellena con la regla even-odd?',
    options: [
      'El número total de aristas del polígono.',
      'La paridad del número de aristas cruzadas por la scanline hasta ese punto.',
      'El ángulo de las aristas con respecto a la horizontal.',
      'La distancia del píxel al centroide del polígono.',
    ],
    correct: 1,
    explanation:
      'La regla even-odd (par-impar) dice que un punto es interior si el número de veces que un rayo hacia la derecha cruza el borde del polígono es impar. Si es par, el punto está afuera.',
  },
  {
    question: 'Si una scanline cruza 4 aristas, ¿qué ocurre con el píxel entre la 2ª y 3ª intersección?',
    options: [
      'Se rellena, porque está entre el 2º y 3º cruce (conteo impar→par→impar→par).',
      'No se rellena, ya que las intersecciones 2 y 3 son ambas "salida".',
      'Depende del color de fondo.',
      'Nunca puede haber 4 intersecciones en un polígono simple.',
    ],
    correct: 0,
    explanation:
      'Con la regla even-odd, los pares de intersecciones definen spans interior: (1ª,2ª), (3ª,4ª), … El píxel entre la 2ª y 3ª intersección está fuera (par→impar = entrada, pero el span [2,3] es exterior porque va de "fuera a dentro del exterior").',
  },
  {
    question: '¿Por qué se ignoran las aristas horizontales en el algoritmo Scan-Line?',
    options: [
      'Son difíciles de calcular computacionalmente.',
      'Causan errores de paridad al contar dos veces los vértices compartidos en extremos.',
      'Siempre están fuera del polígono.',
      'Solo existen en polígonos no simples.',
    ],
    correct: 1,
    explanation:
      'Una arista horizontal tendría invSlope = infinito. Pero más importante: incluirla rompería la paridad en los vértices donde coincide con una scanline, causando que un pico se cuente dos veces (doble cruce = sin relleno, cuando debería rellenarse).',
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function InfoBox({ color, children }: { color: 'indigo' | 'emerald' | 'amber'; children: React.ReactNode }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${colors[color]}`}>
      {children}
    </div>
  );
}

export function Fundamentos() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-6 py-10 space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Fundamentos</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Antes de ver el algoritmo en acción, necesitamos entender las bases matemáticas que lo hacen funcionar.
        </p>
      </header>

      {/* 1. Continuo vs Discreto */}
      <Section title="1. El problema: continuo vs. discreto">
        <p className="text-slate-600 leading-relaxed">
          Un polígono matemático está definido por vértices en el plano continuo{' '}
          <Formula formula="\mathbb{R}^2" />. Sin embargo, una pantalla digital es una cuadrícula finita de píxeles.
          El reto central de la computación gráfica es{' '}
          <strong>discretizar</strong> el espacio continuo de forma eficiente y sin errores visuales.
        </p>
        <InfoBox color="indigo">
          <p>
            <strong>Intuición:</strong> Imagina un polígono dibujado en papel milimetrado. El algoritmo Scan-Line
            recorre el papel <em>de arriba a abajo, fila por fila</em> (scanline por scanline),
            y en cada fila decide qué cuadraditos van de color.
          </p>
        </InfoBox>
      </Section>

      {/* 2. Regla even-odd */}
      <Section title="2. La regla de paridad (even-odd)">
        <p className="text-slate-600 leading-relaxed">
          Para saber si un punto está <em>dentro</em> del polígono, usamos el{' '}
          <strong>Teorema de la Curva de Jordan</strong>: una curva cerrada simple divide el plano en interior y exterior.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="font-semibold text-slate-700 text-sm">Algoritmo del rayo (Ray Casting):</p>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
            <li>Desde el punto{' '}<Formula formula="P" />, lanza un rayo horizontal hacia la derecha.</li>
            <li>Cuenta cuántas aristas del polígono cruza ese rayo.</li>
            <li>Si el número de cruces es <strong>impar</strong> → P está <strong>dentro</strong>.</li>
            <li>Si el número de cruces es <strong>par</strong> → P está <strong>fuera</strong>.</li>
          </ol>
        </div>
        <InfoBox color="emerald">
          En el contexto del Scan-Line, el "rayo" es simplemente la scanline completa, y los puntos de cruce
          son las <strong>intersecciones de la scanline con las aristas</strong>. Se rellenan los píxeles
          entre los pares de intersecciones: 1ª–2ª, 3ª–4ª, etc.
        </InfoBox>
      </Section>

      {/* 3. Aristas e intersecciones */}
      <Section title="3. Intersecciones de la scanline con aristas">
        <p className="text-slate-600 leading-relaxed">
          Dada una arista entre los vértices{' '}
          <Formula formula="(x_1, y_1)" /> y <Formula formula="(x_2, y_2)" />,
          la intersección con la scanline{' '}<Formula formula="y = Y" /> se calcula invirtiendo la ecuación de la recta:
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <Formula formula="x = x_1 + \frac{Y - y_1}{y_2 - y_1} \cdot (x_2 - x_1)" display />
        </div>

        <p className="text-slate-600">O equivalentemente, definiendo la <strong>pendiente inversa</strong>:</p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <Formula formula="\frac{1}{m} = \frac{\Delta x}{\Delta y} = \frac{x_2 - x_1}{y_2 - y_1}" display />
        </div>

        <InfoBox color="amber">
          <p>
            <strong>Clave del rendimiento:</strong> En lugar de recalcular la intersección con división para cada scanline,
            se usa la actualización incremental:
          </p>
          <div className="mt-2 text-center">
            <Formula formula="x_{k+1} = x_k + \frac{1}{m}" display />
          </div>
          <p className="mt-2">
            Esto reduce cada actualización a una sola suma — O(1) por arista por scanline.
            Esta optimización fue revolucionaria en la época de Ivan Sutherland (1963).
          </p>
        </InfoBox>
      </Section>

      {/* 4. Convenciones de vértices */}
      <Section title="4. Convenciones para evitar doble conteo">
        <p className="text-slate-600 leading-relaxed">
          Cuando una scanline pasa exactamente por un vértice compartido entre dos aristas, hay riesgo de
          contar ese cruce dos veces (o cero veces), arruinando la paridad. La convención estándar es:
        </p>
        <ul className="list-none space-y-2">
          {[
            { icon: '✅', text: 'Se incluye el extremo inferior (yMin) de cada arista — la arista "entra" al alcanzar su punto más bajo.' },
            { icon: '❌', text: 'Se excluye el extremo superior (yMax) — la arista "sale" antes de que la scanline llegue a su punto más alto.' },
            { icon: '⏭️', text: 'Las aristas horizontales (Δy = 0) se ignoran completamente — no contribuyen a la paridad.' },
          ].map(({ icon, text }) => (
            <li key={text} className="flex gap-3 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3">
              <span className="text-base shrink-0">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 5. La Edge Table */}
      <Section title="5. La Edge Table (ET)">
        <p className="text-slate-600 leading-relaxed">
          La <strong>Edge Table</strong> es una estructura que organiza todas las aristas del polígono, agrupadas por su{' '}
          <Formula formula="y_{Min}" />. Para cada arista almacena:
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Campo</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['yMin', 'Scanline mínima donde la arista es activa'],
                ['yMax', 'Scanline máxima (excluida)'],
                ['xAtYMin', 'Valor x en la scanline yMin'],
                ['1/m', 'Pendiente inversa: incremento de x por scanline'],
              ].map(([campo, desc]) => (
                <tr key={campo} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-indigo-700 font-medium">{campo}</td>
                  <td className="px-4 py-2 text-slate-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Quiz */}
      <section>
        <Quiz title="Quiz · Fundamentos" questions={QUIZ_QUESTIONS} />
      </section>
    </main>
  );
}
