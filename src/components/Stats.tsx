import { memo, useMemo } from 'react';
import { CheckCircle2, Flame, TrendingUp, Sparkles, Target, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import type { UserIdentity, WeeklyInsight } from '@/types/habit';
import { USER_LEVELS } from '@/types/habit';
import { cn } from '@/lib/utils';

interface StatsProps {
  momentumScore: number;
  todayCompleted: number;
  todayTotal: number;
  todayRate: number;
  totalStreak: number;
  userIdentity: UserIdentity;
  weeklyInsight: WeeklyInsight;
  show14Days: boolean;
  onToggle14Days: () => void;
}

export const Stats = memo(function Stats({
  momentumScore,
  todayCompleted,
  todayTotal,
  todayRate,
  totalStreak,
  userIdentity,
  weeklyInsight,
  show14Days,
  onToggle14Days,
}: StatsProps) {
  const levelInfo = USER_LEVELS[userIdentity.level];
  
  const motivationalText = useMemo(() => {
    if (todayRate === 100) return '¡Día perfecto! Sigue así';
    if (todayRate >= 75) return '¡Vas muy bien! Casi llegas';
    if (todayRate >= 50) return 'Buen progreso, continúa';
    if (todayRate > 0) return 'Cada paso cuenta';
    return 'Empieza con uno hoy';
  }, [todayRate]);

  const momentumColor = useMemo(() => {
    if (momentumScore >= 80) return 'bg-[#4CAF50]';
    if (momentumScore >= 60) return 'bg-[#8BC34A]';
    if (momentumScore >= 40) return 'bg-[#FFC107]';
    return 'bg-[#FF9800]';
  }, [momentumScore]);

  return (
    <div className="space-y-4 mb-6">
      {/* Identity Header */}
      <div className="text-center pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9]">
          <Sparkles className="h-4 w-4" style={{ color: levelInfo.color }} />
          <span className="text-sm font-medium" style={{ color: levelInfo.color }}>
            {levelInfo.label}
          </span>
        </div>
        <p className="text-xs text-[#6B6B6B] mt-2">
          {levelInfo.message}
        </p>
      </div>

      {/* Momentum Score */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-[#6B6B6B]">Momentum</p>
            <p className="text-3xl font-semibold text-[#1B1B1B]">{momentumScore}</p>
          </div>
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            momentumScore >= 80 ? 'bg-[#E8F5E9]' :
            momentumScore >= 60 ? 'bg-[#F1F8E9]' :
            momentumScore >= 40 ? 'bg-[#FFF8E1]' : 'bg-[#FFF3E0]'
          )}>
            <TrendingUp className={cn(
              'h-6 w-6',
              momentumScore >= 80 ? 'text-[#4CAF50]' :
              momentumScore >= 60 ? 'text-[#8BC34A]' :
              momentumScore >= 40 ? 'text-[#FFC107]' : 'text-[#FF9800]'
            )} />
          </div>
        </div>
        <div className="h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', momentumColor)}
            style={{ width: `${momentumScore}%` }}
          />
        </div>
        <p className="text-xs text-[#9E9E9E] mt-2">{motivationalText}</p>
      </div>

      {/* Perfect Days Banner */}
      {userIdentity.perfectDaysThisWeek > 0 && (
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF50] flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#1B5E20]">
              {userIdentity.perfectDaysThisWeek} día{userIdentity.perfectDaysThisWeek !== 1 ? 's' : ''} perfecto{userIdentity.perfectDaysThisWeek !== 1 ? 's' : ''} esta semana
            </p>
            <p className="text-xs text-[#388E3C]">
              Total: {userIdentity.perfectDaysCount} día{userIdentity.perfectDaysCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1B1B1B]">
                {todayCompleted}/{todayTotal}
              </p>
              <p className="text-xs text-[#6B6B6B]">Hoy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
              <Flame className="h-5 w-5 text-[#FF9800]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1B1B1B]">{totalStreak}</p>
              <p className="text-xs text-[#6B6B6B]">Racha total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Insights */}
      {weeklyInsight.consistencyRate > 0 && (
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E0E0E0] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#4CAF50]" />
              <span className="text-sm font-medium text-[#1B1B1B]">Tus patrones</span>
            </div>
            <button
              onClick={onToggle14Days}
              className="flex items-center gap-1 text-xs text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
            >
              {show14Days ? (
                <><ChevronLeft className="h-3 w-3" /> 7 días</>
              ) : (
                <>14 días <ChevronRight className="h-3 w-3" /></>
              )}
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-[#6B6B6B]">
              Tu mejor día es <span className="font-medium text-[#4CAF50]">{weeklyInsight.bestDay}</span>
            </p>
            {weeklyInsight.weakestDay !== weeklyInsight.bestDay && (
              <p className="text-[#6B6B6B]">
                Los <span className="font-medium text-[#FF9800]">{weeklyInsight.weakestDay}s</span> son más difíciles
              </p>
            )}
            <p className="text-xs text-[#9E9E9E] mt-2">
              Consistencia: {weeklyInsight.consistencyRate}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
