import { memo } from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NearCompletionProps {
  remaining: number;
  onFocus: () => void;
}

export const NearCompletion = memo(function NearCompletion({
  remaining,
  onFocus,
}: NearCompletionProps) {
  if (remaining !== 1) return null;

  return (
    <button
      onClick={onFocus}
      className={cn(
        'w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0]',
        'border border-[#FFD54F]/50',
        'flex items-center gap-3 transition-all duration-200',
        'hover:shadow-md hover:shadow-[#FFD54F]/20 hover:-translate-y-0.5'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-[#FFC107]/20 flex items-center justify-center flex-shrink-0">
        <Target className="w-5 h-5 text-[#FF8F00]" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-[#E65100]">Te falta uno</p>
        <p className="text-sm text-[#F57C00]">Casi lo logras</p>
      </div>
      <ArrowRight className="w-5 h-5 text-[#FF8F00]" />
    </button>
  );
});
