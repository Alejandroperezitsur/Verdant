export type Frequency = 'daily' | 'weekly';
export type RiskLevel = 'normal' | 'at-risk' | 'critical';
export type UserLevel = 'seed' | 'sprout' | 'growing' | 'consistent' | 'unstoppable';

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  frequencyCount: number;
  icon: string;
  completedDates: string[];
  createdAt: string;
  // Streak inteligente
  streakCount: number;
  streakBuffer: number;
  lastCompletedDate: string | null;
  consecutiveFailures: number;
  riskLevel: RiskLevel;
  // Recovery
  preBreakStreak: number;
  breakDate: string | null;
}

export interface HabitFormData {
  name: string;
  frequency: Frequency;
  frequencyCount: number;
  icon: string;
}

export interface UserIdentity {
  level: UserLevel;
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  weeklyConsistency: number;
  totalDaysActive: number;
  perfectDaysCount: number;
  perfectDaysThisWeek: number;
  lastPerfectDayDate: string | null;
}

export interface WeeklyInsight {
  bestDay: string;
  weakestDay: string;
  consistencyRate: number;
  totalCompletions: number;
}

export interface DebugStats {
  consistencyRate: number;
  streakBuffer: number;
  riskLevel: RiskLevel;
  preBreakStreak: number;
  daysSinceLastCompletion: number;
}

export interface AppSettings {
  show14Days: boolean;
  lowEnergyMode: boolean;
}

export const HABIT_ICONS = [
  { name: 'Planta', value: 'leaf' },
  { name: 'Corazón', value: 'heart' },
  { name: 'Fuego', value: 'flame' },
  { name: 'Agua', value: 'droplet' },
  { name: 'Sol', value: 'sun' },
  { name: 'Luna', value: 'moon' },
  { name: 'Libro', value: 'book' },
  { name: 'Música', value: 'music' },
  { name: 'Ejercicio', value: 'dumbbell' },
  { name: 'Mente', value: 'brain' },
  { name: 'Comida', value: 'utensils' },
  { name: 'Ahorro', value: 'wallet' },
  { name: 'Código', value: 'code' },
  { name: 'Arte', value: 'brush' },
  { name: 'Viaje', value: 'plane' },
  { name: 'Estrella', value: 'star' },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Todos los días', shortLabel: 'Diario' },
  { value: 'weekly', label: 'Veces por semana', shortLabel: 'Semanal' },
] as const;

export const USER_LEVELS: Record<UserLevel, { label: string; threshold: number; color: string; message: string }> = {
  seed: { label: 'Semilla', threshold: 0, color: '#8D6E63', message: 'Todo gran cambio empieza con un paso' },
  sprout: { label: 'Brote', threshold: 30, color: '#66BB6A', message: 'Estás creciendo cada día' },
  growing: { label: 'Creciendo', threshold: 50, color: '#4CAF50', message: 'Tu constancia te define' },
  consistent: { label: 'Constante', threshold: 70, color: '#2E7D32', message: 'Eres alguien disciplinado' },
  unstoppable: { label: 'Imparable', threshold: 90, color: '#1B5E20', message: 'Nada puede detenerte' },
};

export const IDENTITY_MESSAGES = [
  { minConsistency: 0, message: 'Empieza con un pequeño paso hoy' },
  { minConsistency: 20, message: 'Cada día cuenta' },
  { minConsistency: 40, message: 'Estás construyendo disciplina' },
  { minConsistency: 60, message: 'Eres alguien constante' },
  { minConsistency: 80, message: 'Tu constancia te define' },
  { minConsistency: 90, message: 'Sigues avanzando sin parar' },
];

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
