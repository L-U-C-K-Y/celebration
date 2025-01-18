import { useState, useRef } from 'react';
import { Play, Pause, Share2, Download, Music2, Volume2, VolumeX } from 'lucide-react';
import { Activity } from '@/types';

interface CelebrationCollageProps {
  activities: Activity[];
}

export function CelebrationCollage({ activities }: CelebrationCollageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<number>();

  // Process all content from activities
  const slides = activities.flatMap(activity => {
    if (activity.type === 'message') {
      return [{
        type: 'message',
        content: activity.content as string,
        author: activity.author,
      }];
    } else if (activity.type === 'photo' || activity.type === 'video') {
      return (Array.isArray(activity.content) ? activity.content : [activity.content]).map(url => ({
        type: activity.type,
        url,
        author: activity.author,
      }));
    }
    return [];
  });

  const startSlideshow = () => {
    setIsPlaying(true);
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide(prev => 
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000); // Longer duration to allow reading messages
  };

  const pauseSlideshow = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Birthday Celebration',
          text: 'Check out this beautiful celebration collage!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const currentSlideContent = slides[currentSlide];

  return (
    <div className="bg-black/90 rounded-lg overflow-hidden">
      {/* Content Display */}
      <div className="relative aspect-video bg-black">
        {currentSlideContent.type === 'message' ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600">
            <div className="max-w-lg text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20">
                  {currentSlideContent.author.imageUrl ? (
                    <img
                      src={currentSlideContent.author.imageUrl}
                      alt={currentSlideContent.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {currentSlideContent.author.name[0]}
                    </div>
                  )}
                </div>
                <span className="text-white font-medium">
                  {currentSlideContent.author.name}
                </span>
              </div>
              <p className="text-2xl text-white font-medium leading-relaxed">
                {currentSlideContent.content}
              </p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={currentSlideContent.url}
              alt="Celebration moment"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20">
                  {currentSlideContent.author.imageUrl ? (
                    <img
                      src={currentSlideContent.author.imageUrl}
                      alt={currentSlideContent.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {currentSlideContent.author.name[0]}
                    </div>
                  )}
                </div>
                <span className="text-white text-sm">
                  {currentSlideContent.author.name}
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? pauseSlideshow : startSlideshow}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
          <Music2 className="w-6 h-6 text-white/60" />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => {/* Add download logic */}}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Download className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                if (!isPlaying) startSlideshow();
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${
                currentSlide === index ? 'ring-2 ring-white' : 'opacity-60'
              }`}
            >
              {slide.type === 'message' ? (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-xs p-2">
                  {(slide.content as string).slice(0, 20)}...
                </div>
              ) : (
                <img
                  src={slide.url}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}