import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  formula: string;
  display?: boolean;
  className?: string;
}

/** Renderiza una fórmula LaTeX usando KaTeX. Los strings de fórmula son controlados internamente. */
export function Formula({ formula, display = false, className = '' }: FormulaProps) {
  const html = katex.renderToString(formula, {
    displayMode: display,
    throwOnError: false,
    output: 'html',
  });

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
