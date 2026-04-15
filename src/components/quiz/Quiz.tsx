import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // índice de la opción correcta
  explanation: string;
}

interface QuizProps {
  title?: string;
  questions: QuizQuestion[];
}

export function Quiz({ title = 'Mini-Quiz', questions }: QuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [, setAnswers] = useState<boolean[]>([]);

  const q = questions[current];

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correct;
    setAnswers((prev) => [...prev, correct]);
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  function handleReset() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setAnswers([]);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center space-y-3">
        <p className="text-2xl font-bold text-indigo-700">{pct}%</p>
        <p className="text-slate-700">
          Respondiste {score} de {questions.length} correctamente.
        </p>
        <p className="text-sm text-slate-500">
          {pct >= 80 ? '¡Excelente comprensión! 🎉' : pct >= 50 ? 'Bien, pero puedes repasar un poco más.' : 'Te recomendamos leer de nuevo la sección.'}
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <RotateCcw size={14} /> Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="font-semibold text-indigo-700">{title}</span>
        <span>Pregunta {current + 1} / {questions.length}</span>
      </div>

      <p className="text-slate-800 font-medium leading-snug">{q.question}</p>

      <ul className="space-y-2">
        {q.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correct;
          let cls = 'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ';
          if (selected === null) {
            cls += 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700';
          } else if (isCorrect) {
            cls += 'border-emerald-400 bg-emerald-50 text-emerald-800 font-medium';
          } else if (isSelected) {
            cls += 'border-red-400 bg-red-50 text-red-800';
          } else {
            cls += 'border-slate-200 text-slate-400 cursor-default';
          }

          return (
            <li key={idx}>
              <button className={cls} onClick={() => handleSelect(idx)} disabled={selected !== null}>
                <span className="inline-flex items-center gap-2">
                  {selected !== null && isCorrect && <CheckCircle size={14} className="text-emerald-600 shrink-0" />}
                  {selected !== null && isSelected && !isCorrect && <XCircle size={14} className="text-red-600 shrink-0" />}
                  {opt}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected !== null && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
          <strong className="text-slate-700">Explicación:</strong> {q.explanation}
        </div>
      )}

      {selected !== null && (
        <button
          onClick={handleNext}
          className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {current + 1 >= questions.length ? 'Ver resultado' : 'Siguiente pregunta →'}
        </button>
      )}
    </div>
  );
}
