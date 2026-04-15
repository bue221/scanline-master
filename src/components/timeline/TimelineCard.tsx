interface TimelineCardProps {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export function TimelineCard({ year, title, description, highlight = false }: TimelineCardProps) {
  return (
    <div className="flex gap-4">
      {/* Línea + punto */}
      <div className="flex flex-col items-center">
        <div
          className={[
            'w-3 h-3 rounded-full mt-1 shrink-0',
            highlight ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-400',
          ].join(' ')}
        />
        <div className="flex-1 w-px bg-slate-200 my-1" />
      </div>

      {/* Contenido */}
      <div className="pb-8">
        <span
          className={[
            'inline-block text-xs font-mono font-bold px-2 py-0.5 rounded mb-1',
            highlight
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          {year}
        </span>
        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
