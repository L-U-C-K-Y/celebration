import { useState } from 'react';
import { Trophy, Info } from 'lucide-react';
import type { TopCelebrator } from '@/types';

interface TopCelebratorsProps {
  celebrators: TopCelebrator[];
}

export function TopCelebrators({ celebrators }: TopCelebratorsProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-white/5 rounded-lg p-4 relative">
      <div className="flex items-center space-x-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-300" />
        <span className="font-medium">Top Celebrators</span>
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          className="bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-2 text-sm text-white/80 bg-white/10 p-3 rounded-md">
          These are the people whose posts and reactions have received
          the most engagement. Top scores = more community love!
        </div>
      )}

      <div className="space-y-2">
        {celebrators.map((celebrator, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2"
          >
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 flex items-center justify-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </span>
              <span>{celebrator.name}</span>
            </div>
            <div className="text-white/60 text-xs">
              {celebrator.score} pts | {celebrator.recentAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}