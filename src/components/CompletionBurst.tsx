import { useEffect, useState, memo } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionBurstProps {
  show: boolean;
  onComplete?: () => void;
}

export const CompletionBurst = memo(function CompletionBurst({
  show,
  onComplete,
}: CompletionBurstProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (show) {
      setVisible(true);
      setPhase('in');
      
      const holdTimer = setTimeout(() => setPhase('hold'), 300);
      const outTimer = setTimeout(() => setPhase('out'), 2000);
      const completeTimer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2500);

      return () => {
        clearTimeout(holdTimer);
        clearTimeout(outTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center pointer-events-none',
        'transition-opacity duration-500',
        phase === 'out' ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#4CAF50]/10 backdrop-blur-sm" />

      {/* Content */}
      <div
        className={cn(
          'relative flex flex-col items-center gap-4 transition-all duration-300',
          phase === 'in' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Sparkles */}
        <div className="absolute -inset-8">
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                'absolute w-5 h-5 text-[#4CAF50] animate-pulse',
                phase === 'hold' && 'animate-bounce'
              )}
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Main icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#4CAF50]/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-[#4CAF50] flex items-center justify-center shadow-lg shadow-[#4CAF50]/40">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-xl font-semibold text-[#1B1B1B]">¡Día completo!</p>
          <p className="text-sm text-[#6B6B6B] mt-1">Sigues construyendo disciplina</p>
        </div>
      </div>
    </div>
  );
});
