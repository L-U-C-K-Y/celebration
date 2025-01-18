import { Plus, Sparkles } from 'lucide-react';
import type { Activity } from '@/types';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedProps {
  activities: Activity[];
  onAddCelebration: () => void;
}

export function ActivityFeed({ activities, onAddCelebration }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Birthday Feed</span>
        <span className="text-sm">{activities.length} celebrations</span>
      </div>

      {/* Early Bird Alert */}
      {activities.length < 10 && (
        <div className="bg-yellow-400/20 text-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Be one of the first 10 celebrators!</span>
          </div>
          <span className="text-sm">{10 - activities.length} spots left</span>
        </div>
      )}

      {/* "Add Celebration" trigger */}
      <div className="flex gap-2">
        <button
          onClick={onAddCelebration}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Celebration</span>
        </button>
      </div>

      {/* Activity Feed Items */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white/10 rounded-lg p-4">
            <ActivityItem activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
}