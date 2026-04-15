export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <p>
          ScanLine Master · Algoritmo Scan-Line para relleno de polígonos ·{' '}
          <span className="text-indigo-500">Computación Gráfica</span>
        </p>
        <p>
          Hecho por{' '}
          <a
            href="https://github.com/bue221"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            bue221
          </a>
        </p>
      </div>
    </footer>
  );
}
