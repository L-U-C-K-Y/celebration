import { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Clock,
  Cake,
  Crown,
  Camera,
  PartyPopper,
  Plus,
  MessageCircle,
  Trophy,
  Sparkles,
  Info,
  MoreHorizontal,
  Video as VideoIcon,
  Play,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { ProfileSection } from './ProfileSection';
import { ReactionBar } from './ReactionBar';
import { TopCelebrators } from './TopCelebrators';
import { ActivityFeed } from './ActivityFeed';
import { AddCelebrationDialog } from './AddCelebrationDialog';
import { CelebrationCollage } from './CelebrationCollage';
import type { Person } from '@/types';

export function BirthdayCard() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMilestoneAlert, setShowMilestoneAlert] = useState(false);
  const [showTopCelebratorsInfo, setShowTopCelebratorsInfo] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPostSubmittedAlert, setShowPostSubmittedAlert] = useState(false);
  const [showCollage, setShowCollage] = useState(false);

  // Example data
  const person: Person = {
    name: 'Sarah Johnson',
    birthDate: '1990-03-15',
    age: 34,
    daysUntilBirthday: 0,
    isWithin24Hours: true,
    totalCelebrations: 842,
    milestones: {
      current: 842,
      next: 1000,
      reward: 'Epic Celebration Banner 🎊',
    },
    reactions: [
      { type: '❤️', count: 156 },
      { type: '🎉', count: 89 },
      { type: '🎂', count: 67 },
      { type: '🌟', count: 45 },
    ],
    activities: [
      {
        id: '1',
        type: 'photo',
        author: {
          name: 'Alex',
          imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop',
        },
        content: [
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop'
        ],
        timestamp: '2m ago',
        isEarlyBird: true,
        reactions: [
          { type: '❤️', author: 'Emma', timestamp: '1m ago' },
          { type: '🎉', author: 'John', timestamp: 'just now' },
        ],
      },
      {
        id: '2',
        type: 'message',
        author: {
          name: 'Emma',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        },
        content: 'Happy birthday! 🎉 Hope this year brings you all the joy you deserve! Remember all the amazing moments we shared last year - here\'s to creating even more wonderful memories together! 💫',
        timestamp: '5m ago',
        isEarlyBird: true,
        reactions: [{ type: '❤️', author: 'Michael', timestamp: '3m ago' }],
      },
      {
        id: '3',
        type: 'video',
        author: {
          name: 'Michael',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
        },
        content: [
          'https://example.com/video1.mp4',
          'https://example.com/video2.mp4'
        ],
        timestamp: '10m ago',
        reactions: [
          { type: '🎉', author: 'Alex', timestamp: '8m ago' },
          { type: '❤️', author: 'Emma', timestamp: '7m ago' },
        ],
      },
      {
        id: '4',
        type: 'photo',
        author: {
          name: 'Lisa',
          imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
        },
        content: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=400&auto=format&fit=crop',
        timestamp: '15m ago',
        reactions: [
          { type: '🌟', author: 'John', timestamp: '12m ago' },
        ],
      },
    ],
    topCelebrators: [
      { name: 'Alex', score: 156, recentAction: 'Shared a photo' },
      { name: 'Emma', score: 89, recentAction: 'Left a message' },
      { name: 'Michael', score: 67, recentAction: 'Sent video' },
    ],
  };

  // Countdown effect
  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 20);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleEmojiClick = (emoji: string) => {
    setDialogOpen(true);
  };

  const handleAddCelebration = (data: {
    email: string;
    emoji: string;
    message?: string;
    mediaType?: 'photo' | 'video';
    mediaFiles?: File[];
  }) => {
    setDialogOpen(false);
    setShowPostSubmittedAlert(true);
    setTimeout(() => setShowPostSubmittedAlert(false), 5000);
    triggerConfetti();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {showMilestoneAlert && (
        <Alert className="mb-4 bg-purple-100 border-purple-200">
          <AlertDescription>
            🎉 New milestone reached! {person.milestones.reward} unlocked!
          </AlertDescription>
        </Alert>
      )}

      {showPostSubmittedAlert && (
        <Alert className="mb-4 bg-green-100 border-green-300">
          <AlertDescription>
            We've emailed you a verification link. Once confirmed, your post
            will appear in the feed!
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 overflow-hidden text-white shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setShowCollage(true)}
            >
              <Play className="w-5 h-5" />
            </Button>
            <Share2
              className="w-6 h-6 cursor-pointer hover:text-pink-200 transition-colors"
              onClick={() => {
                alert('Share clicked! (Add real share logic here)');
              }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-6">
            <ProfileSection
              name={person.name}
              age={person.age}
              birthDateString={new Date(person.birthDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
              imageUrl={person.imageUrl}
              isWithin24Hours={person.isWithin24Hours}
              timeLeft={timeLeft}
            />

            <ReactionBar
              reactions={person.reactions}
              onEmojiClick={handleEmojiClick}
            />

            <TopCelebrators
              celebrators={person.topCelebrators}
            />

            <ActivityFeed
              activities={person.activities}
              onAddCelebration={() => setDialogOpen(true)}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-center pb-6">
          <div className="text-center space-y-3">
            <div className="text-sm font-medium">
              Create your birthday card ✨
            </div>
            <button className="bg-white text-purple-600 hover:bg-white/90 px-6 py-2 rounded-full flex items-center justify-center space-x-2 transition-colors font-medium">
              <Gift className="w-4 h-4" />
              <span>Make Your Own</span>
            </button>
          </div>
        </CardFooter>
      </Card>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <PartyPopper className="w-20 h-20 text-yellow-400 animate-bounce" />
          </div>
        </div>
      )}

      <AddCelebrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddCelebration}
      />

      <Dialog open={showCollage} onOpenChange={setShowCollage}>
        <DialogContent className="sm:max-w-3xl p-0 bg-black border-none">
          <CelebrationCollage activities={person.activities} />
        </DialogContent>
      </Dialog>
    </div>
  );
}