import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Habit, 
  HabitFormData, 
  UserIdentity, 
  WeeklyInsight, 
  RiskLevel,
  UserLevel,
  DebugStats,
  AppSettings
} from '@/types/habit';
import { USER_LEVELS, DAY_NAMES, IDENTITY_MESSAGES } from '@/types/habit';
import { 
  getAllHabits, 
  saveHabit, 
  deleteHabit as deleteHabitDB,
  getUserIdentity,
  saveUserIdentity,
  getSettings,
  saveSettings,
  migrateFromLocalStorage
} from '@/lib/storage';

// Constants
const SOFT_RESET_HOURS = 48;
const SOFT_RESET_PERCENTAGE = 0.7;
const RISK_THRESHOLD = 2;
const CRITICAL_THRESHOLD = 3;
const LOW_ENERGY_THRESHOLD = 40;

interface UseHabitsReturn {
  habits: Habit[];
  userIdentity: UserIdentity;
  settings: AppSettings;
  isLoaded: boolean;
  isLowEnergy: boolean;
  identityMessage: string;
  addHabit: (data: HabitFormData) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  completeAllToday: () => Promise<void>;
  recoverHabit: (id: string) => Promise<void>;
  toggle14DaysView: () => Promise<void>;
  isCompletedOnDate: (habit: Habit, date: string) => boolean;
  getStreak: (habit: Habit) => number;
  getWeeklyProgress: (habit: Habit) => boolean[];
  get14DayProgress: (habit: Habit) => { dates: string[]; completed: boolean[] };
  getMomentumScore: () => number;
  getTodayStats: () => { completed: number; total: number; rate: number; isPerfect: boolean };
  getWeeklyInsight: () => WeeklyInsight;
  getRiskLevel: (habit: Habit) => RiskLevel;
  getRecoveryMessage: (habit: Habit) => string | null;
  canSoftReset: (habit: Habit) => boolean;
  getDebugStats: (habit: Habit) => DebugStats;
  getFirstRiskHabitId: () => string | null;
  exportData: () => Promise<object>;
  importData: (data: { habits: Habit[]; identity?: UserIdentity; settings?: AppSettings }) => Promise<void>;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userIdentity, setUserIdentity] = useState<UserIdentity>({
    level: 'seed',
    totalCompletions: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyConsistency: 0,
    totalDaysActive: 0,
    perfectDaysCount: 0,
    perfectDaysThisWeek: 0,
    lastPerfectDayDate: null,
  });
  const [settings, setSettings] = useState<AppSettings>({
    show14Days: false,
    lowEnergyMode: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await migrateFromLocalStorage();
      const [loadedHabits, loadedIdentity, loadedSettings] = await Promise.all([
        getAllHabits(),
        getUserIdentity(),
        getSettings(),
      ]);
      
      const updatedHabits = loadedHabits.map(updateRiskLevel);
      setHabits(updatedHabits);
      
      if (loadedIdentity) {
        setUserIdentity(loadedIdentity);
      }
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Calculate user level based on consistency
  const calculateUserLevel = useCallback((): UserLevel => {
    const { weeklyConsistency, bestStreak } = userIdentity;
    const score = (weeklyConsistency * 0.6) + (Math.min(bestStreak, 30) / 30 * 40);
    
    if (score >= USER_LEVELS.unstoppable.threshold) return 'unstoppable';
    if (score >= USER_LEVELS.consistent.threshold) return 'consistent';
    if (score >= USER_LEVELS.growing.threshold) return 'growing';
    if (score >= USER_LEVELS.sprout.threshold) return 'sprout';
    return 'seed';
  }, [userIdentity]);

  // Get identity message based on consistency
  const identityMessage = useMemo(() => {
    const { weeklyConsistency } = userIdentity;
    for (let i = IDENTITY_MESSAGES.length - 1; i >= 0; i--) {
      if (weeklyConsistency >= IDENTITY_MESSAGES[i].minConsistency) {
        return IDENTITY_MESSAGES[i].message;
      }
    }
    return IDENTITY_MESSAGES[0].message;
  }, [userIdentity]);

  // Check low energy mode
  const isLowEnergy = useMemo(() => {
    return userIdentity.weeklyConsistency < LOW_ENERGY_THRESHOLD && habits.length > 0;
  }, [userIdentity.weeklyConsistency, habits.length]);

  // Update user identity
  const updateUserIdentity = useCallback(async (updates: Partial<UserIdentity>) => {
    const newIdentity = { ...userIdentity, ...updates };
    newIdentity.level = calculateUserLevel();
    setUserIdentity(newIdentity);
    await saveUserIdentity(newIdentity);
  }, [userIdentity, calculateUserLevel]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings]);

  // Update risk level for a habit
  const updateRiskLevel = (habit: Habit): Habit => {
    const today = getToday();
    const lastCompleted = habit.lastCompletedDate;
    
    if (!lastCompleted) {
      return { ...habit, riskLevel: 'normal', consecutiveFailures: 0 };
    }
    
    const daysSince = getDaysBetween(lastCompleted, today);
    
    if (habit.completedDates.includes(today)) {
      return { ...habit, riskLevel: 'normal', consecutiveFailures: 0 };
    }
    
    let failures = 0;
    for (let i = 1; i <= daysSince; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (!habit.completedDates.includes(dateStr)) {
        failures++;
      }
    }
    
    let riskLevel: RiskLevel = 'normal';
    if (failures >= CRITICAL_THRESHOLD) {
      riskLevel = 'critical';
    } else if (failures >= RISK_THRESHOLD) {
      riskLevel = 'at-risk';
    }
    
    return { ...habit, riskLevel, consecutiveFailures: failures };
  };

  // Count perfect days
  const countPerfectDays = useCallback((allHabits: Habit[]): { total: number; thisWeek: number } => {
    if (allHabits.length === 0) return { total: 0, thisWeek: 0 };
    
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const dateMap = new Map<string, number>();
    
    allHabits.forEach(habit => {
      habit.completedDates.forEach(date => {
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });
    });
    
    let total = 0;
    let thisWeek = 0;
    
    dateMap.forEach((count, date) => {
      if (count === allHabits.length) {
        total++;
        const d = new Date(date);
        if (d >= startOfWeek) {
          thisWeek++;
        }
      }
    });
    
    return { total, thisWeek };
  }, []);

  // Add new habit
  const addHabit = useCallback(async (data: HabitFormData) => {
    const today = getToday();
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      frequency: data.frequency,
      frequencyCount: data.frequencyCount,
      icon: data.icon,
      completedDates: [],
      createdAt: today,
      streakCount: 0,
      streakBuffer: 1,
      lastCompletedDate: null,
      consecutiveFailures: 0,
      riskLevel: 'normal',
      preBreakStreak: 0,
      breakDate: null,
    };
    
    await saveHabit(newHabit);
    setHabits(prev => [...prev, newHabit]);
  }, []);

  // Delete habit
  const deleteHabit = useCallback(async (id: string) => {
    await deleteHabitDB(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  // Toggle habit completion
  const toggleHabit = useCallback(async (id: string, date: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    let updatedHabit: Habit;

    if (isCompleted) {
      updatedHabit = {
        ...habit,
        completedDates: habit.completedDates.filter(d => d !== date),
      };
    } else {
      const newCompletedDates = [...habit.completedDates, date].sort();
      
      let newStreak = habit.streakCount + 1;
      
      if (habit.breakDate && habit.preBreakStreak > 0) {
        const hoursSinceBreak = (new Date(date).getTime() - new Date(habit.breakDate).getTime()) / (1000 * 60 * 60);
        if (hoursSinceBreak <= SOFT_RESET_HOURS) {
          const recoveredStreak = Math.floor(habit.preBreakStreak * SOFT_RESET_PERCENTAGE);
          newStreak = Math.max(newStreak, recoveredStreak + 1);
        }
      }
      
      const weeksOfStreak = Math.floor(newStreak / 7);
      const newBuffer = Math.min(weeksOfStreak + 1, 4);
      
      updatedHabit = {
        ...habit,
        completedDates: newCompletedDates,
        streakCount: newStreak,
        streakBuffer: newBuffer,
        lastCompletedDate: date,
        consecutiveFailures: 0,
        riskLevel: 'normal',
        breakDate: null,
        preBreakStreak: 0,
      };
    }

    updatedHabit = updateRiskLevel(updatedHabit);
    await saveHabit(updatedHabit);
    
    const newHabits = habits.map(h => h.id === id ? updatedHabit : h);
    setHabits(newHabits);
    
    // Check for perfect day
    const todayStats = getTodayStatsFromHabits(newHabits);
    if (todayStats.isPerfect && !isCompleted) {
      const perfectDays = countPerfectDays(newHabits);
      await updateUserIdentity({
        totalCompletions: userIdentity.totalCompletions + 1,
        currentStreak: Math.max(userIdentity.currentStreak, updatedHabit.streakCount),
        bestStreak: Math.max(userIdentity.bestStreak, updatedHabit.streakCount),
        perfectDaysCount: perfectDays.total,
        perfectDaysThisWeek: perfectDays.thisWeek,
        lastPerfectDayDate: getToday(),
      });
    } else {
      await updateUserIdentity({
        totalCompletions: userIdentity.totalCompletions + (isCompleted ? -1 : 1),
        currentStreak: Math.max(userIdentity.currentStreak, updatedHabit.streakCount),
        bestStreak: Math.max(userIdentity.bestStreak, updatedHabit.streakCount),
      });
    }
  }, [habits, userIdentity, updateUserIdentity, countPerfectDays]);

  // Complete all habits today
  const completeAllToday = useCallback(async () => {
    const today = getToday();
    const incompleteHabits = habits.filter(h => !h.completedDates.includes(today));
    
    for (const habit of incompleteHabits) {
      await toggleHabit(habit.id, today);
    }
  }, [habits, toggleHabit]);

  // Recover habit (manual recovery button)
  const recoverHabit = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = getToday();
    const updatedHabit: Habit = {
      ...habit,
      completedDates: [...habit.completedDates, today],
      lastCompletedDate: today,
      consecutiveFailures: 0,
      riskLevel: 'normal',
      breakDate: null,
      preBreakStreak: 0,
    };

    await saveHabit(updatedHabit);
    setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
  }, [habits]);

  // Toggle 14 days view
  const toggle14DaysView = useCallback(async () => {
    await updateSettings({ show14Days: !settings.show14Days });
  }, [settings.show14Days, updateSettings]);

  // Check completion on date
  const isCompletedOnDate = useCallback((habit: Habit, date: string): boolean => {
    return habit.completedDates.includes(date);
  }, []);

  // Get display streak
  const getStreak = useCallback((habit: Habit): number => {
    return habit.streakCount;
  }, []);

  // Get weekly progress (last 7 days)
  const getWeeklyProgress = useCallback((habit: Habit): boolean[] => {
    const today = new Date();
    const progress: boolean[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      progress.push(habit.completedDates.includes(dateStr));
    }
    
    return progress;
  }, []);

  // Get 14 day progress
  const get14DayProgress = useCallback((habit: Habit): { dates: string[]; completed: boolean[] } => {
    const today = new Date();
    const dates: string[] = [];
    const completed: boolean[] = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      completed.push(habit.completedDates.includes(dateStr));
    }
    
    return { dates, completed };
  }, []);

  // Calculate momentum score (0-100)
  const getMomentumScore = useCallback((): number => {
    if (habits.length === 0) return 0;
    
    let totalScore = 0;
    habits.forEach(habit => {
      const weeklyProgress = getWeeklyProgress(habit);
      const weeklyCompleted = weeklyProgress.filter(Boolean).length;
      const weeklyRate = weeklyCompleted / 7;
      
      const streakBonus = Math.min(habit.streakCount / 21, 1) * 30;
      
      const riskPenalty = habit.riskLevel === 'critical' ? 20 : 
                         habit.riskLevel === 'at-risk' ? 10 : 0;
      
      const habitScore = (weeklyRate * 50) + streakBonus - riskPenalty;
      totalScore += Math.max(habitScore, 0);
    });
    
    return Math.min(Math.round(totalScore / habits.length), 100);
  }, [habits, getWeeklyProgress]);

  // Get today stats helper
  const getTodayStatsFromHabits = (allHabits: Habit[]) => {
    const today = getToday();
    const completed = allHabits.filter(h => h.completedDates.includes(today)).length;
    const total = allHabits.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isPerfect = completed === total && total > 0;
    return { completed, total, rate, isPerfect };
  };

  // Get today's stats
  const getTodayStats = useCallback(() => {
    return getTodayStatsFromHabits(habits);
  }, [habits]);

  // Get weekly insights
  const getWeeklyInsight = useCallback((): WeeklyInsight => {
    const dayStats: Record<number, { completed: number; total: number }> = {};
    
    for (let i = 0; i < 7; i++) {
      dayStats[i] = { completed: 0, total: 0 };
    }
    
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      habits.forEach(habit => {
        dayStats[dayOfWeek].total++;
        if (habit.completedDates.includes(dateStr)) {
          dayStats[dayOfWeek].completed++;
        }
      });
    }
    
    let bestDay = 1;
    let weakestDay = 1;
    let bestRate = -1;
    let weakestRate = 2;
    
    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.total === 0) return;
      const rate = stats.completed / stats.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestDay = parseInt(day);
      }
      if (rate < weakestRate) {
        weakestRate = rate;
        weakestDay = parseInt(day);
      }
    });
    
    const totalCompletions = Object.values(dayStats).reduce((sum, d) => sum + d.completed, 0);
    const totalPossible = Object.values(dayStats).reduce((sum, d) => sum + d.total, 0);
    
    return {
      bestDay: DAY_NAMES[bestDay],
      weakestDay: DAY_NAMES[weakestDay],
      consistencyRate: totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0,
      totalCompletions,
    };
  }, [habits]);

  // Get risk level
  const getRiskLevel = useCallback((habit: Habit): RiskLevel => {
    return habit.riskLevel;
  }, []);

  // Get recovery message
  const getRecoveryMessage = useCallback((habit: Habit): string | null => {
    if (habit.riskLevel === 'critical') {
      return 'Retomar hoy es lo importante';
    }
    if (habit.riskLevel === 'at-risk') {
      return 'No rompas el ritmo';
    }
    return null;
  }, []);

  // Check if can soft reset
  const canSoftReset = useCallback((habit: Habit): boolean => {
    if (!habit.breakDate || habit.preBreakStreak === 0) return false;
    const hoursSinceBreak = (new Date().getTime() - new Date(habit.breakDate).getTime()) / (1000 * 60 * 60);
    return hoursSinceBreak <= SOFT_RESET_HOURS;
  }, []);

  // Get first risk habit id for auto-focus
  const getFirstRiskHabitId = useCallback((): string | null => {
    const riskHabit = habits.find(h => h.riskLevel !== 'normal');
    return riskHabit?.id || null;
  }, [habits]);

  // Get debug stats
  const getDebugStats = useCallback((habit: Habit): DebugStats => {
    const today = getToday();
    const daysSinceLastCompletion = habit.lastCompletedDate 
      ? getDaysBetween(habit.lastCompletedDate, today)
      : 0;
    
    return {
      consistencyRate: habit.streakCount > 0 ? Math.round((habit.streakCount / (habit.streakCount + habit.consecutiveFailures)) * 100) : 0,
      streakBuffer: habit.streakBuffer,
      riskLevel: habit.riskLevel,
      preBreakStreak: habit.preBreakStreak,
      daysSinceLastCompletion,
    };
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    const { exportData: doExport } = await import('@/lib/storage');
    return doExport();
  }, []);

  // Import data
  const importData = useCallback(async (data: { habits: Habit[]; identity?: UserIdentity; settings?: AppSettings }) => {
    const { importData: doImport } = await import('@/lib/storage');
    await doImport(data);
    setHabits(data.habits);
    if (data.identity) setUserIdentity(data.identity);
    if (data.settings) setSettings(data.settings);
  }, []);

  return useMemo(() => ({
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
    getDebugStats,
    getFirstRiskHabitId,
    exportData,
    importData,
  }), [
    habits, userIdentity, settings, isLoaded, isLowEnergy, identityMessage,
    addHabit, deleteHabit, toggleHabit, completeAllToday, recoverHabit, toggle14DaysView,
    isCompletedOnDate, getStreak, getWeeklyProgress, get14DayProgress, getMomentumScore,
    getTodayStats, getWeeklyInsight, getRiskLevel, getRecoveryMessage, canSoftReset,
    getDebugStats, getFirstRiskHabitId, exportData, importData
  ]);
}
