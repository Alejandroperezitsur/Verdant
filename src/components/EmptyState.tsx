import { Sprout, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center">
          <Sprout className="h-10 w-10 text-[#4CAF50]" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-[#1B1B1B] mb-2">
        Empieza tu transformación
      </h3>
      
      <p className="text-[#6B6B6B] max-w-sm mx-auto mb-2 leading-relaxed">
        Los grandes cambios comienzan con hábitos pequeños. 
        Crea tu primer hábito y empieza a crecer.
      </p>

      <div className="flex items-center justify-center gap-2 text-xs text-[#9E9E9E] mb-8">
        <Sparkles className="h-3 w-3" />
        <span>Te estás convirtiendo en alguien constante</span>
      </div>

      <Button
        onClick={onCreateClick}
        className="h-12 px-6 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#4CAF50]/25"
      >
        Crear hábito
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
