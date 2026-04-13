import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HabitFormData } from '@/types/habit';
import { HABIT_ICONS, FREQUENCY_OPTIONS } from '@/types/habit';
import { HabitIcon } from './HabitIcon';
import { cn } from '@/lib/utils';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: HabitFormData) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAdd }: AddHabitDialogProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [frequencyCount, setFrequencyCount] = useState(3);
  const [selectedIcon, setSelectedIcon] = useState('leaf');

  useEffect(() => {
    if (open) {
      setName('');
      setFrequency('daily');
      setFrequencyCount(3);
      setSelectedIcon('leaf');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        frequency,
        frequencyCount: frequency === 'daily' ? 7 : frequencyCount,
        icon: selectedIcon,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-[#E0E0E0] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1B1B1B]">
            Nuevo hábito
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#1B1B1B]">
              ¿Qué quieres cultivar?
            </Label>
            <Input
              id="name"
              placeholder="Ej: Meditar 10 minutos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50]/20 text-[#1B1B1B] placeholder:text-[#9E9E9E]"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1B1B1B]">Frecuencia</Label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value as 'daily' | 'weekly')}
                  className={cn(
                    'flex-1 h-11 rounded-xl text-sm font-medium transition-all duration-200',
                    frequency === opt.value
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#F6F8F6] text-[#6B6B6B] hover:bg-[#E8F5E9]'
                  )}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>
            {frequency === 'weekly' && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-[#6B6B6B]">Veces por semana:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFrequencyCount(num)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200',
                        frequencyCount === num
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-[#F6F8F6] text-[#6B6B6B] hover:bg-[#E8F5E9]'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1B1B1B]">Icono</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setSelectedIcon(icon.value)}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-200',
                    selectedIcon === icon.value
                      ? 'bg-[#E8F5E9] ring-2 ring-[#4CAF50]'
                      : 'bg-[#F6F8F6] hover:bg-[#E8F5E9]'
                  )}
                >
                  <HabitIcon icon={icon.value} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl border-[#E0E0E0] text-[#6B6B6B] hover:bg-[#F6F8F6]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 h-12 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Crear hábito
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
