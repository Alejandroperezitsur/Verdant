import { memo } from 'react';
import { cn } from '@/lib/utils';

type PlantStage = 'seed' | 'sprout' | 'growing' | 'strong';

interface PlantVivaProps {
  streak: number;
  isCompletedToday: boolean;
  riskLevel: 'normal' | 'at-risk' | 'critical';
  size?: number;
  className?: string;
}

const getPlantStage = (streak: number): PlantStage => {
  if (streak >= 21) return 'strong';
  if (streak >= 11) return 'growing';
  if (streak >= 4) return 'sprout';
  return 'seed';
};

export const PlantViva = memo(function PlantViva({
  streak,
  isCompletedToday,
  riskLevel,
  size = 48,
  className,
}: PlantVivaProps) {
  const stage = getPlantStage(streak);
  const isStruggling = riskLevel !== 'normal';

  const vitalityClass = isStruggling
    ? 'opacity-60 grayscale-[0.3]'
    : isCompletedToday
    ? 'opacity-100'
    : 'opacity-90';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center transition-all duration-500',
        vitalityClass,
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Glow effect for strong plants */}
      {stage === 'strong' && isCompletedToday && (
        <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-full blur-xl animate-pulse" />
      )}

      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={cn(
          'transition-transform duration-500',
          isCompletedToday && 'scale-105'
        )}
      >
        {/* SEED STAGE */}
        {stage === 'seed' && (
          <g>
            {/* Soil */}
            <ellipse cx="24" cy="42" rx="12" ry="4" fill="#8D6E63" opacity="0.3" />
            {/* Seed */}
            <ellipse
              cx="24"
              cy="38"
              rx="6"
              ry="4"
              fill={isStruggling ? '#BCAAA4' : '#A5D6A7'}
              className="transition-all duration-500"
            />
            {/* Small sprout hint */}
            <path
              d="M24 36 Q24 32 22 30"
              stroke={isStruggling ? '#BCAAA4' : '#66BB6A'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity={streak > 1 ? 1 : 0}
              className="transition-opacity duration-500"
            />
          </g>
        )}

        {/* SPROUT STAGE */}
        {stage === 'sprout' && (
          <g>
            {/* Soil */}
            <ellipse cx="24" cy="42" rx="14" ry="5" fill="#8D6E63" opacity="0.3" />
            {/* Stem */}
            <path
              d="M24 38 Q24 30 24 24"
              stroke={isStruggling ? '#BCAAA4' : '#81C784'}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left leaf */}
            <ellipse
              cx="18"
              cy="26"
              rx="6"
              ry="3"
              fill={isStruggling ? '#D7CCC8' : '#A5D6A7'}
              transform="rotate(-30 18 26)"
              className="origin-center animate-pulse-soft"
            />
            {/* Right leaf */}
            <ellipse
              cx="30"
              cy="24"
              rx="6"
              ry="3"
              fill={isStruggling ? '#D7CCC8' : '#66BB6A'}
              transform="rotate(30 30 24)"
              className="origin-center animate-pulse-soft"
              style={{ animationDelay: '0.5s' }}
            />
          </g>
        )}

        {/* GROWING STAGE */}
        {stage === 'growing' && (
          <g>
            {/* Soil */}
            <ellipse cx="24" cy="42" rx="16" ry="5" fill="#8D6E63" opacity="0.3" />
            {/* Main stem */}
            <path
              d="M24 40 Q24 28 24 16"
              stroke={isStruggling ? '#BCAAA4' : '#4CAF50'}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Branch left */}
            <path
              d="M24 28 Q18 24 16 20"
              stroke={isStruggling ? '#BCAAA4' : '#66BB6A'}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Branch right */}
            <path
              d="M24 24 Q30 20 32 16"
              stroke={isStruggling ? '#BCAAA4' : '#81C784'}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaves */}
            <ellipse cx="14" cy="18" rx="7" ry="4" fill={isStruggling ? '#D7CCC8' : '#A5D6A7'} transform="rotate(-35 14 18)" />
            <ellipse cx="34" cy="14" rx="7" ry="4" fill={isStruggling ? '#D7CCC8' : '#66BB6A'} transform="rotate(35 34 14)" />
            <ellipse cx="24" cy="12" rx="6" ry="3" fill={isStruggling ? '#D7CCC8' : '#4CAF50'} />
          </g>
        )}

        {/* STRONG STAGE */}
        {stage === 'strong' && (
          <g>
            {/* Soil */}
            <ellipse cx="24" cy="42" rx="18" ry="6" fill="#8D6E63" opacity="0.3" />
            {/* Thick main stem */}
            <path
              d="M24 40 Q24 26 24 10"
              stroke={isStruggling ? '#BCAAA4' : '#2E7D32'}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left branch */}
            <path
              d="M24 30 Q16 26 12 20"
              stroke={isStruggling ? '#BCAAA4' : '#388E3C'}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right branch */}
            <path
              d="M24 24 Q32 20 36 14"
              stroke={isStruggling ? '#BCAAA4' : '#43A047'}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lower branch */}
            <path
              d="M24 34 Q30 32 34 28"
              stroke={isStruggling ? '#BCAAA4' : '#4CAF50'}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Large leaves */}
            <ellipse cx="10" cy="18" rx="9" ry="5" fill={isStruggling ? '#D7CCC8' : '#66BB6A'} transform="rotate(-40 10 18)" />
            <ellipse cx="38" cy="12" rx="9" ry="5" fill={isStruggling ? '#D7CCC8' : '#4CAF50'} transform="rotate(40 38 12)" />
            <ellipse cx="36" cy="26" rx="7" ry="4" fill={isStruggling ? '#D7CCC8' : '#81C784'} transform="rotate(25 36 26)" />
            <ellipse cx="24" cy="8" rx="7" ry="4" fill={isStruggling ? '#D7CCC8' : '#2E7D32'} />
            {/* Top crown */}
            <circle cx="24" cy="6" r="4" fill={isStruggling ? '#D7CCC8' : '#1B5E20'} opacity="0.8" />
          </g>
        )}
      </svg>

      {/* Revival animation overlay */}
      {isCompletedToday && isStruggling && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#4CAF50]/20 animate-ping" />
        </div>
      )}
    </div>
  );
});
