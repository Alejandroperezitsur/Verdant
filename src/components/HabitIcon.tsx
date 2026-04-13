import type { LucideIcon } from 'lucide-react';
import { 
  Leaf, Heart, Flame, Droplet, Sun, Moon, BookOpen, 
  Music, Dumbbell, Brain, Utensils, Wallet, Code, 
  Paintbrush, Plane, Star
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  leaf: Leaf,
  heart: Heart,
  flame: Flame,
  droplet: Droplet,
  sun: Sun,
  moon: Moon,
  book: BookOpen,
  music: Music,
  dumbbell: Dumbbell,
  brain: Brain,
  utensils: Utensils,
  wallet: Wallet,
  code: Code,
  brush: Paintbrush,
  plane: Plane,
  star: Star,
};

interface HabitIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function HabitIcon({ icon, size = 20, className = '' }: HabitIconProps) {
  const IconComponent = iconMap[icon] || Leaf;
  
  return (
    <div className={`flex items-center justify-center rounded-full bg-[#E8F5E9] ${className}`}>
      <IconComponent size={size} className="text-[#4CAF50]" />
    </div>
  );
}
