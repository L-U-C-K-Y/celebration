import { Calendar, Gift, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BottomNav({ currentPath, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      icon: Calendar,
      label: 'Birthdays',
      path: '/birthdays',
    },
    {
      icon: Gift,
      label: 'Celebrations',
      path: '/celebrations',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full',
              'text-muted-foreground hover:text-primary transition-colors',
              currentPath === item.path && 'text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => onNavigate('/create')}
          className="flex flex-col items-center justify-center flex-1 h-full"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Create</span>
        </button>
      </div>
    </div>
  );
}