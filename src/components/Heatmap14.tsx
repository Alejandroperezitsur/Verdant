import { memo } from 'react';
import { cn } from '@/lib/utils';

interface Heatmap14Props {
  dates: string[];
  completed: boolean[];
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const Heatmap14 = memo(function Heatmap14({ dates, completed }: Heatmap14Props) {
  // Get day of week for each date
  const getDayLabel = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    return DAY_LABELS[day === 0 ? 6 : day - 1]; // Adjust so Monday is first
  };

  return (
    <div className="flex gap-1">
      {dates.map((date, i) => (
        <div key={date} className="flex flex-col items-center gap-0.5">
          <div
            className={cn(
              'w-4 h-4 rounded-sm transition-all duration-200',
              completed[i]
                ? 'bg-[#4CAF50]'
                : 'bg-[#E0E0E0]'
            )}
            title={`${date}: ${completed[i] ? 'Completado' : 'Pendiente'}`}
          />
          <span className="text-[8px] text-[#9E9E9E]">{getDayLabel(date)}</span>
        </div>
      ))}
    </div>
  );
});
