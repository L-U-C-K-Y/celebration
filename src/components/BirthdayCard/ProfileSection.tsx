import { Cake, Crown, Clock } from 'lucide-react';

interface ProfileSectionProps {
  name: string;
  age: number;
  birthDateString: string;
  imageUrl?: string;
  isWithin24Hours: boolean;
  timeLeft: string;
}

export function ProfileSection({
  name,
  age,
  birthDateString,
  imageUrl,
  isWithin24Hours,
  timeLeft,
}: ProfileSectionProps) {
  return (
    <div className="text-center space-y-6">
      {/* Profile */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transform hover:scale-105 transition-transform border-4 border-white/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Cake className="w-16 h-16 text-white" />
          )}
        </div>
        <div className="absolute -right-4 top-0">
          <Crown className="w-8 h-8 text-yellow-300" />
        </div>
      </div>

      {/* Name, Age, Countdown */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{name}</h2>
        <div className="text-xl font-medium">
          Turning {age} on {birthDateString}! 🎉
        </div>

        {isWithin24Hours && (
          <div className="flex items-center justify-center space-x-2 bg-white/10 px-3 py-1 rounded-full inline-block">
            <Clock className="w-4 h-4 text-red-300" />
            <span className="text-sm font-medium">{timeLeft} left to celebrate!</span>
          </div>
        )}
      </div>
    </div>
  );
}