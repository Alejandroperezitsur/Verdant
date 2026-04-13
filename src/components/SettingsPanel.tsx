import { useState, useRef, useCallback } from 'react';
import { Settings, Download, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { downloadExport, readImportFile } from '@/lib/storage';
import type { Habit, UserIdentity, AppSettings } from '@/types/habit';

interface SettingsPanelProps {
  onExport: () => Promise<object>;
  onImport: (data: { habits: Habit[]; identity?: UserIdentity; settings?: AppSettings }) => Promise<void>;
}

export function SettingsPanel({ onExport, onImport }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    const data = await onExport();
    downloadExport(data);
  }, [onExport]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readImportFile(file);
      await onImport(data as unknown as { habits: Habit[]; identity?: UserIdentity; settings?: AppSettings });
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        setOpen(false);
      }, 1500);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  }, [onImport]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-xl text-[#9E9E9E] hover:text-[#4CAF50] hover:bg-[#E8F5E9] transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl bg-white">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-[#1B1B1B]">Ajustes</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 py-6">
            {/* Export */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F6F8F6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
                  <Download className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-medium text-[#1B1B1B]">Exportar datos</p>
                  <p className="text-xs text-[#6B6B6B]">Descarga tu respaldo</p>
                </div>
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                className="h-10 px-4 rounded-xl border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]"
              >
                Exportar
              </Button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F6F8F6]">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  importStatus === 'success' ? 'bg-[#E8F5E9]' :
                  importStatus === 'error' ? 'bg-[#FFEBEE]' :
                  'bg-[#E3F2FD]'
                )}>
                  {importStatus === 'success' ? (
                    <Check className="h-5 w-5 text-[#4CAF50]" />
                  ) : importStatus === 'error' ? (
                    <X className="h-5 w-5 text-[#EF5350]" />
                  ) : (
                    <Upload className="h-5 w-5 text-[#2196F3]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#1B1B1B]">Importar datos</p>
                  <p className="text-xs text-[#6B6B6B]">
                    {importStatus === 'success' ? '¡Importado!' :
                     importStatus === 'error' ? 'Error al importar' :
                     'Restaura desde respaldo'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="h-10 px-4 rounded-xl border-[#2196F3] text-[#2196F3] hover:bg-[#E3F2FD]"
              >
                Importar
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
