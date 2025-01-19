import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

const PREDEFINED_THEMES = [
  {
    name: 'Royal Purple',
    colors: ['violet-600', 'purple-600', 'pink-600'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-violet-600 [&>div:nth-child(2)]:bg-purple-600 [&>div:nth-child(3)]:bg-pink-600',
    gradientClasses: 'from-violet-600 via-purple-600 to-pink-600'
  },
  {
    name: 'Ocean Dream',
    colors: ['blue-500', 'cyan-500', 'indigo-500'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-blue-500 [&>div:nth-child(2)]:bg-cyan-500 [&>div:nth-child(3)]:bg-indigo-500',
    gradientClasses: 'from-blue-500 via-cyan-500 to-indigo-500'
  },
  {
    name: 'Sunset Party',
    colors: ['yellow-400', 'orange-500', 'red-500'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-yellow-400 [&>div:nth-child(2)]:bg-orange-500 [&>div:nth-child(3)]:bg-red-500',
    gradientClasses: 'from-yellow-400 via-orange-500 to-red-500'
  },
  {
    name: 'Spring Joy',
    colors: ['green-400', 'emerald-500', 'teal-500'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-green-400 [&>div:nth-child(2)]:bg-emerald-500 [&>div:nth-child(3)]:bg-teal-500',
    gradientClasses: 'from-green-400 via-emerald-500 to-teal-500'
  },
  {
    name: 'Rose Garden',
    colors: ['rose-400', 'pink-500', 'fuchsia-500'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-rose-400 [&>div:nth-child(2)]:bg-pink-500 [&>div:nth-child(3)]:bg-fuchsia-500',
    gradientClasses: 'from-rose-400 via-pink-500 to-fuchsia-500'
  },
  {
    name: 'Golden Glow',
    colors: ['amber-400', 'yellow-500', 'orange-600'],
    previewClasses: 'space-x-0.5 [&>div:nth-child(1)]:bg-amber-400 [&>div:nth-child(2)]:bg-yellow-500 [&>div:nth-child(3)]:bg-orange-600',
    gradientClasses: 'from-amber-400 via-yellow-500 to-orange-600'
  }
];

interface ThemeColorSelectorProps {
  value: string[];
  onChange: (colors: string[]) => void;
}

export default function ThemeColorSelector({ value, onChange }: ThemeColorSelectorProps) {
  const isCurrentTheme = (colors: string[]) => {
    return colors.every((color, index) => color === value[index]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-white block">Theme Colors</Label>
      
      <div className="grid grid-cols-3 gap-2">
        {PREDEFINED_THEMES.map((theme) => (
          <button
            key={theme.name}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(theme.colors);
            }}
            className={`relative group p-2 rounded-lg transition-all ${
              isCurrentTheme(theme.colors)
                ? 'ring-2 ring-white'
                : 'hover:bg-white/10'
            }`}
          >
            <div className="space-y-1">
              <div className={`flex justify-center ${theme.previewClasses}`}>
                <div className="w-4 h-4 rounded-full" />
                <div className="w-4 h-4 rounded-full" />
                <div className="w-4 h-4 rounded-full" />
              </div>
              <span className="text-white text-xs">{theme.name}</span>
            </div>
            {isCurrentTheme(theme.colors) && (
              <Check className="absolute top-1 right-1 w-3 h-3 text-white" />
            )}
          </button>
        ))}
      </div>

      <div className="h-16 rounded-lg overflow-hidden">
        <div 
          className={`w-full h-full bg-gradient-to-br ${
            PREDEFINED_THEMES.find(theme => 
              isCurrentTheme(theme.colors)
            )?.gradientClasses || PREDEFINED_THEMES[0].gradientClasses
          }`}
        />
      </div>
    </div>
  );
}