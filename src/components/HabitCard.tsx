import { useState, useCallback, memo } from 'react';
import { Trash2, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Habit, RiskLevel } from '@/types/habit';
import { PlantViva } from './PlantViva';
import { Heatmap14 } from './Heatmap14';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  streak: number;
  weeklyProgress: boolean[];
  day14Progress: { dates: string[]; completed: boolean[] };
  riskLevel: RiskLevel;
  recoveryMessage: string | null;
  canRecover: boolean;
  show14Days: boolean;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onRecover: (id: string) => void;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const RISK_STYLES: Record<RiskLevel, { border: string; bg: string; text: string }> = {
  normal: { border: 'border-[#E0E0E0]', bg: 'bg-white', text: 'text-[#1B1B1B]' },
  'at-risk': { border: 'border-[#FFD54F]', bg: 'bg-[#FFFDE7]', text: 'text-[#F57F17]' },
  critical: { border: 'border-[#FF8A65]', bg: 'bg-[#FFF3E0]', text: 'text-[#E64A19]' },
};

export const HabitCard = memo(function HabitCard({
  habit,
  isCompletedToday,
  streak,
  weeklyProgress,
  day14Progress,
  riskLevel,
  recoveryMessage,
  canRecover,
  show14Days,
  onToggle,
  onDelete,
  onRecover,
}: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const styles = RISK_STYLES[riskLevel];

  const handleToggle = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!isCompletedToday) {
      setShowSuccessAnim(true);
      setTimeout(() => setShowSuccessAnim(false), 600);
    }
    onToggle(habit.id, today);
  }, [habit.id, isCompletedToday, onToggle]);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => onDelete(habit.id), 250);
  }, [habit.id, onDelete]);

  const handleRecover = useCallback(() => {
    onRecover(habit.id);
  }, [habit.id, onRecover]);

  return (
    <div
      className={cn(
        'group relative rounded-2xl border p-4 transition-all duration-250 ease-out',
        styles.border,
        styles.bg,
        isDeleting && 'opacity-0 scale-95',
        isCompletedToday && riskLevel === 'normal' && 'border-[#66BB6A] bg-[#FAFAFA]',
        showSuccessAnim && 'scale-[1.02]'
      )}
    >
      {/* Recovery banner */}
      {recoveryMessage && !isCompletedToday && (
        <div className={cn(
          'mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-sm',
          riskLevel === 'critical' ? 'bg-[#FFCCBC] text-[#BF360C]' : 'bg-[#FFF9C4] text-[#F57F17]'
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{recoveryMessage}</span>
          {canRecover && (
            <button
              onClick={handleRecover}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Retomar
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Plant Viva */}
        <PlantViva
          streak={streak}
          isCompletedToday={isCompletedToday}
          riskLevel={riskLevel}
          size={52}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-medium truncate', styles.text)}>{habit.name}</h3>
            {streak > 0 && (
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1',
                streak >= 21 ? 'bg-[#4CAF50] text-white' :
                streak >= 7 ? 'bg-[#A5D6A7] text-[#1B5E20]' :
                'bg-[#E8F5E9] text-[#4CAF50]'
              )}>
                {streak} día{streak !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Buffer indicator */}
          {habit.streakBuffer > 0 && streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-[#9E9E9E]">
                {habit.streakBuffer} día{habit.streakBuffer !== 1 ? 's' : ''} de margen
              </span>
            </div>
          )}

          {/* Weekly progress (7 days) */}
          {!show14Days && (
            <div className="flex items-center gap-2 mt-2">
              {weeklyProgress.map((completed, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5"
                  title={`${DAY_LABELS[i]}: ${completed ? 'Completado' : 'Pendiente'}`}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full transition-all duration-200',
                      completed
                        ? 'bg-[#4CAF50]'
                        : 'bg-[#E0E0E0]'
                    )}
                  />
                  <span className="text-[9px] text-[#9E9E9E]">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          )}

          {/* 14-day heatmap */}
          {show14Days && (
            <div className="mt-2">
              <Heatmap14 dates={day14Progress.dates} completed={day14Progress.completed} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-9 w-9 rounded-xl text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#FFEBEE] opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <button
            onClick={handleToggle}
            className={cn(
              'relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 overflow-hidden',
              isCompletedToday
                ? 'bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/30'
                : 'bg-[#F6F8F6] text-[#9E9E9E] hover:bg-[#E8F5E9] hover:text-[#4CAF50]'
            )}
          >
            {showSuccessAnim && (
              <span className="absolute inset-0 bg-white/40 rounded-xl animate-ping" />
            )}
            <Check className={cn(
              'h-5 w-5 transition-all duration-300',
              isCompletedToday && 'scale-110'
            )} />
          </button>
        </div>
      </div>
    </div>
  );
});
