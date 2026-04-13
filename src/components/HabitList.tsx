import { memo, useMemo, useRef, useEffect } from 'react';
import type { Habit, RiskLevel } from '@/types/habit';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  show14Days: boolean;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onRecover: (id: string) => void;
  isCompletedOnDate: (habit: Habit, date: string) => boolean;
  getStreak: (habit: Habit) => number;
  getWeeklyProgress: (habit: Habit) => boolean[];
  get14DayProgress: (habit: Habit) => { dates: string[]; completed: boolean[] };
  getRiskLevel: (habit: Habit) => RiskLevel;
  getRecoveryMessage: (habit: Habit) => string | null;
  canSoftReset: (habit: Habit) => boolean;
  firstRiskId: string | null;
}

export const HabitList = memo(function HabitList({
  habits,
  show14Days,
  onToggle,
  onDelete,
  onRecover,
  isCompletedOnDate,
  getStreak,
  getWeeklyProgress,
  get14DayProgress,
  getRiskLevel,
  getRecoveryMessage,
  canSoftReset,
  firstRiskId,
}: HabitListProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const riskRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to first risk habit
  useEffect(() => {
    if (firstRiskId && riskRef.current) {
      riskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [firstRiskId]);

  // Sort: critical > at-risk > incomplete > complete
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const riskOrder = { critical: 0, 'at-risk': 1, normal: 2 };
      const aRisk = riskOrder[getRiskLevel(a)];
      const bRisk = riskOrder[getRiskLevel(b)];
      if (aRisk !== bRisk) return aRisk - bRisk;
      
      const aCompleted = isCompletedOnDate(a, today);
      const bCompleted = isCompletedOnDate(b, today);
      if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
      
      return getStreak(b) - getStreak(a);
    });
  }, [habits, getRiskLevel, isCompletedOnDate, today, getStreak]);

  return (
    <div className="space-y-3">
      {sortedHabits.map((habit) => (
        <div
          key={habit.id}
          ref={habit.id === firstRiskId ? riskRef : undefined}
        >
          <HabitCard
            habit={habit}
            isCompletedToday={isCompletedOnDate(habit, today)}
            streak={getStreak(habit)}
            weeklyProgress={getWeeklyProgress(habit)}
            day14Progress={get14DayProgress(habit)}
            riskLevel={getRiskLevel(habit)}
            recoveryMessage={getRecoveryMessage(habit)}
            canRecover={canSoftReset(habit)}
            show14Days={show14Days}
            onToggle={onToggle}
            onDelete={onDelete}
            onRecover={onRecover}
          />
        </div>
      ))}
    </div>
  );
});
