import { useState, useCallback, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { Header } from '@/components/Header';
import { Stats } from '@/components/Stats';
import { HabitList } from '@/components/HabitList';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { CompletionBurst } from '@/components/CompletionBurst';
import { NearCompletion } from '@/components/NearCompletion';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import './App.css';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCompletionBurst, setShowCompletionBurst] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(0);
  
  const {
    habits,
    userIdentity,
    settings,
    isLoaded,
    isLowEnergy,
    identityMessage,
    addHabit,
    deleteHabit,
    toggleHabit,
    completeAllToday,
    recoverHabit,
    toggle14DaysView,
    isCompletedOnDate,
    getStreak,
    getWeeklyProgress,
    get14DayProgress,
    getMomentumScore,
    getTodayStats,
    getWeeklyInsight,
    getRiskLevel,
    getRecoveryMessage,
    canSoftReset,
    getFirstRiskHabitId,
    exportData,
    importData,
  } = useHabits();

  const handleAddHabit = useCallback(async (data: Parameters<typeof addHabit>[0]) => {
    await addHabit(data);
  }, [addHabit]);

  const handleCreateClick = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCompleteAll = useCallback(async () => {
    await completeAllToday();
  }, [completeAllToday]);

  const { completed: todayCompleted, total: todayTotal, rate: todayRate, isPerfect } = getTodayStats();
  const totalStreak = habits.reduce((sum, h) => sum + getStreak(h), 0);
  const weeklyInsight = getWeeklyInsight();
  const momentumScore = getMomentumScore();
  const firstRiskId = getFirstRiskHabitId();

  const allCompletedToday = todayCompleted === todayTotal && todayTotal > 0;
  const hasHabits = habits.length > 0;
  const remainingCount = todayTotal - todayCompleted;

  // Track completion burst
  useEffect(() => {
    if (hasHabits && isPerfect && prevCompleted > 0 && todayCompleted > prevCompleted) {
      setShowCompletionBurst(true);
    }
    setPrevCompleted(todayCompleted);
  }, [todayCompleted, isPerfect, hasHabits, prevCompleted]);

  // Low energy mode: show only 1-2 priority habits
  const visibleHabits = isLowEnergy 
    ? habits.slice(0, 2) 
    : habits;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-[#4CAF50]" />
          <p className="text-sm text-[#6B6B6B]">Cargando tu jardín...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        <div className="flex items-start justify-between">
          <Header 
            userLevel={userIdentity.level} 
            identityMessage={identityMessage}
          />
          {hasHabits && (
            <SettingsPanel onExport={exportData} onImport={importData} />
          )}
        </div>
        
        {hasHabits && (
          <Stats
            momentumScore={momentumScore}
            todayCompleted={todayCompleted}
            todayTotal={todayTotal}
            todayRate={todayRate}
            totalStreak={totalStreak}
            userIdentity={userIdentity}
            weeklyInsight={weeklyInsight}
            show14Days={settings.show14Days}
            onToggle14Days={toggle14DaysView}
          />
        )}

        {!hasHabits ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <>
            {/* Low energy message */}
            {isLowEnergy && (
              <div className="mb-4 p-4 rounded-2xl bg-[#FFF3E0] border border-[#FFCC80]">
                <p className="text-sm text-[#E65100]">
                  Hoy solo enfócate en lo esencial
                </p>
              </div>
            )}

            {/* Near completion trigger */}
            <NearCompletion 
              remaining={remainingCount} 
              onFocus={() => {}} 
            />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-[#1B1B1B]">Tus hábitos</h2>
                <p className="text-sm text-[#6B6B6B]">
                  {todayCompleted} de {todayTotal} completados
                </p>
              </div>
              {!allCompletedToday && todayTotal > 0 && (
                <Button
                  onClick={handleCompleteAll}
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9] text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Marcar todo
                </Button>
              )}
            </div>

            <HabitList
              habits={visibleHabits}
              show14Days={settings.show14Days}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
              onRecover={recoverHabit}
              isCompletedOnDate={isCompletedOnDate}
              getStreak={getStreak}
              getWeeklyProgress={getWeeklyProgress}
              get14DayProgress={get14DayProgress}
              getRiskLevel={getRiskLevel}
              getRecoveryMessage={getRecoveryMessage}
              canSoftReset={canSoftReset}
              firstRiskId={firstRiskId}
            />
          </>
        )}
      </div>

      {/* FAB */}
      {hasHabits && !isLowEnergy && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <Button
            onClick={handleCreateClick}
            className="h-14 px-6 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium shadow-lg shadow-[#4CAF50]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#4CAF50]/30 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo hábito
          </Button>
        </div>
      )}

      <AddHabitDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onAdd={handleAddHabit} 
      />

      <CompletionBurst 
        show={showCompletionBurst} 
        onComplete={() => setShowCompletionBurst(false)} 
      />
    </div>
  );
}

export default App;
