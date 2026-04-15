import { TimelineCard } from '../components/timeline/TimelineCard';
import { Quiz } from '../components/quiz/Quiz';
import type { QuizQuestion } from '../components/quiz/Quiz';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: '¿Quién es considerado el pionero de la computación gráfica interactiva?',
    options: [
      'John Carmack',
      'Ivan Sutherland',
      'Alan Turing',
      'Gordon Moore',
    ],
    correct: 1,
    explanation:
      'Ivan Sutherland desarrolló Sketchpad en 1963 como parte de su tesis doctoral en el MIT, el primer programa de dibujo interactivo. Ganó el Premio Turing en 1988.',
  },
  {
    question: '¿En qué año se presentó Sketchpad, el primer programa de dibujo interactivo?',
    options: ['1953', '1963', '1973', '1983'],
    correct: 1,
    explanation:
      'Sketchpad fue presentado en 1963 en el MIT. Permitía dibujar con un lápiz de luz en una pantalla CRT, un concepto revolucionario para la época.',
  },
  {
    question: 'El Teorema de la Curva de Jordan establece que:',
    options: [
      'Todo polígono tiene un centroide único.',
      'Una curva cerrada simple divide el plano en exactamente dos regiones: interior y exterior.',
      'Las curvas pueden tener dimensión fractal.',
      'Todo polígono convexo es relleable con el algoritmo Scan-Line.',
    ],
    correct: 1,
    explanation:
      'El Teorema de la Curva de Jordan (1887) establece que cualquier curva continua cerrada y simple en el plano divide el plano en exactamente dos regiones: una acotada (interior) y una no acotada (exterior). Es la base matemática del relleno de polígonos.',
  },
];

const TIMELINE_EVENTS = [
  {
    year: '1887',
    title: 'Teorema de la Curva de Jordan',
    description:
      'Camille Jordan prueba que una curva continua, cerrada y simple divide el plano en exactamente dos regiones: interior y exterior. Este resultado matemático es la base teórica del relleno de polígonos con la regla de paridad.',
    highlight: false,
  },
  {
    year: '1960',
    title: 'William Fetter acuña "Computer Graphics"',
    description:
      'El diseñador William Fetter, trabajando para Boeing, crea las primeras figuras humanas digitales para estudiar ergonomía de cabinas de avión. Él acuña el término "computer graphics".',
    highlight: false,
  },
  {
    year: '1963',
    title: 'Sketchpad — Ivan Sutherland (MIT)',
    description:
      'Ivan Sutherland presenta Sketchpad como tesis doctoral. Primer sistema de dibujo interactivo usando un lápiz de luz en pantalla CRT. Introduce conceptos como la jerarquía de objetos gráficos, constraints y el primer uso práctico del raster scan.',
    highlight: true,
  },
  {
    year: '1967',
    title: 'Algoritmo de relleno Scan-Line',
    description:
      'Se formalizan los primeros algoritmos de relleno de polígonos basados en scanlines para gráficos raster. El algoritmo aprovecha la coherencia horizontal: píxeles adyacentes en una misma fila comparten propiedades.',
    highlight: true,
  },
  {
    year: '1968',
    title: 'Sutherland & Sproull — Algoritmos fundamentales',
    description:
      'Ivan Sutherland y Robert Sproull documentan técnicas fundamentales de clipping, rasterización y relleno en la colección "A Characterization of Ten Hidden-Surface Algorithms". Se convierten en referencia estándar.',
    highlight: false,
  },
  {
    year: '1974',
    title: 'Bui Tuong Phong — Shading',
    description:
      'Bui Tuong Phong desarrolla el modelo de iluminación Phong en la Universidad de Utah. El grupo de Utah (Sutherland, Warnock, Catmull, Phong) convierte a esta universidad en el epicentro de la computación gráfica.',
    highlight: false,
  },
  {
    year: '1979',
    title: 'OpenGL y estándares de hardware',
    description:
      'SGI (Silicon Graphics) comienza a desarrollar hardware gráfico especializado. Los algoritmos de relleno como Scan-Line migran del software al hardware, logrando rasterización en tiempo real.',
    highlight: false,
  },
  {
    year: '1988',
    title: 'Premio Turing a Sutherland',
    description:
      'Ivan Sutherland recibe el Premio Turing de la ACM, el "Nobel de la computación", por "su contribución pionera a la computación gráfica interactiva con Sketchpad".',
    highlight: true,
  },
  {
    year: 'Hoy',
    title: 'GPU y rasterización masiva en paralelo',
    description:
      'Las GPUs modernas ejecutan variantes del algoritmo Scan-Line en miles de núcleos en paralelo. Una GPU típica puede rasterizar y rellenar millones de triángulos por segundo usando el mismo principio de coherencia scanline.',
    highlight: false,
  },
];

export function Historia() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-6 py-10 space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Historia</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Del lápiz de luz de Sutherland a las GPUs con miles de núcleos: la historia del relleno de polígonos.
        </p>
      </header>

      {/* Intro */}
      <section className="rounded-xl bg-indigo-50 border border-indigo-200 p-5 space-y-2">
        <p className="text-indigo-800 text-sm leading-relaxed">
          <strong>¿Sabías que…?</strong> El algoritmo Scan-Line nació en una época en que las computadoras
          ocupaban habitaciones enteras y una pantalla gráfica era un lujo inimaginable. Ivan Sutherland
          revolucionó el campo con un programa que permitía <em>dibujar con una computadora</em> — algo que
          antes parecía ciencia ficción.
        </p>
      </section>

      {/* Línea de tiempo */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Línea de tiempo</h2>
        <div>
          {TIMELINE_EVENTS.map((event) => (
            <TimelineCard key={event.year} {...event} />
          ))}
        </div>
      </section>

      {/* Figuras clave */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Figuras clave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              name: 'Ivan Sutherland',
              role: 'Padre de la computación gráfica',
              fact:
                'Desarrolló Sketchpad (1963) a los 25 años. Cofundó con David Evans el primer departamento universitario de computación gráfica en la Universidad de Utah.',
            },
            {
              name: 'Camille Jordan',
              role: 'Matemático (1838-1922)',
              fact:
                'Su teorema sobre curvas cerradas simples (1887) es la base matemática que justifica el algoritmo de ray casting para determinar si un punto está dentro de un polígono.',
            },
            {
              name: 'Robert Sproull',
              role: 'Pionero de algoritmos gráficos',
              fact:
                'Colaboró con Sutherland en la formalización de algoritmos de clipping y rasterización. Su libro "Principles of Interactive Computer Graphics" fue referencia durante décadas.',
            },
            {
              name: 'Edwin Catmull',
              role: 'Cofundador de Pixar',
              fact:
                'Alumno de Sutherland en Utah. Desarrolló el z-buffer y las texturas. Cofundó Pixar y ganó el Oscar técnico por sus contribuciones a la animación digital.',
            },
          ].map(({ name, role, fact }) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div>
                <p className="font-semibold text-slate-800">{name}</p>
                <p className="text-xs text-indigo-600 font-medium">{role}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section>
        <Quiz title="Quiz · Historia" questions={QUIZ_QUESTIONS} />
      </section>
    </main>
  );
}
