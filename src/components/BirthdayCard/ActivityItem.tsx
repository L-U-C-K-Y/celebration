import { MoreHorizontal, VideoIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Activity } from '@/types';

interface ActivityItemProps {
  activity: Activity;
  onReportPost?: (id: string) => void;
}

export function ActivityItem({ activity, onReportPost }: ActivityItemProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      Math.min(
        prev + 1, 
        Array.isArray(activity.content) ? activity.content.length - 1 : 0
      )
    );
  };

  return (
    <div className="space-y-3">
      {/* Row: Author info + Report button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full overflow-hidden">
            {activity.author.imageUrl ? (
              <img
                src={activity.author.imageUrl}
                alt={activity.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                {activity.author.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{activity.author.name}</span>
                {activity.isEarlyBird && (
                  <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full">
                    Early Bird 🐦
                  </span>
                )}
              </div>
              <span className="text-xs text-white/60">{activity.timestamp}</span>
            </div>
          </div>
        </div>
        {onReportPost && (
          <button
            onClick={() => onReportPost(activity.id)}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      {/* The content */}
      <div className="ml-13">
        {activity.type === 'photo' && Array.isArray(activity.content) && (
          <div className="relative rounded-lg overflow-hidden bg-white/10">
            <div className="aspect-video relative">
              <img
                src={activity.content[currentMediaIndex]}
                alt="Birthday memory"
                className="w-full h-full object-cover"
              />
              
              {activity.content.length > 1 && (
                <>
                  {/* Navigation arrows */}
                  {currentMediaIndex > 0 && (
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-1 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                  )}
                  {currentMediaIndex < activity.content.length - 1 && (
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-1 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  )}

                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {activity.content.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activity.type === 'video' && (
          <div className="bg-white/10 rounded-lg p-3 flex items-center space-x-3">
            <VideoIcon className="w-5 h-5" />
            <div className="flex-1 text-sm text-white/70">
              Video content here...
            </div>
          </div>
        )}

        {activity.type === 'message' && (
          <p className="text-white/90">{activity.content}</p>
        )}

        {/* Reactions on the activity */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {activity.reactions.map((reaction, idx) => (
            <div
              key={idx}
              className="bg-white/5 rounded-full px-2 py-1 text-sm flex items-center space-x-1"
            >
              <span>{reaction.type}</span>
              <span className="text-white/60">{reaction.author}</span>
            </div>
          ))}
          <button className="bg-white/5 hover:bg-white/10 rounded-full px-2 py-1 text-sm transition-colors flex items-center space-x-1">
            <Plus className="w-3 h-3" />
            <span>Add React</span>
          </button>
        </div>
      </div>
    </div>
  );
}