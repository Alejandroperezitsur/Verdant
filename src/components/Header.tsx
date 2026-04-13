import { Sprout } from 'lucide-react';
import type { UserLevel } from '@/types/habit';
import { USER_LEVELS } from '@/types/habit';

interface HeaderProps {
  userLevel: UserLevel;
  identityMessage: string;
}

export function Header({ userLevel, identityMessage }: HeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const levelInfo = USER_LEVELS[userLevel];

  return (
    <header className="mb-6 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: `${levelInfo.color}20` }}
        >
          <Sprout className="h-5 w-5" style={{ color: levelInfo.color }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1B1B]">Verdant</h1>
        </div>
      </div>
      <p className="text-sm text-[#6B6B6B] ml-[52px] capitalize">{formattedDate}</p>
      <p className="text-xs text-[#9E9E9E] mt-2 ml-[52px]">{identityMessage}</p>
    </header>
  );
}
