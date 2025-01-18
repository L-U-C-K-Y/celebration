import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNavigate: (path: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Celebrations</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => onNavigate('/settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}