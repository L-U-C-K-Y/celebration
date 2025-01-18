import { PartyPopper, Crown, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  isFirstVisit: boolean;
  onCreateClick: () => void;
}

export function HeroSection({ isFirstVisit, onCreateClick }: HeroSectionProps) {
  return (
    <Card className="mx-4 mt-4 bg-white/10 text-white border-none shadow-lg">
      <CardContent className="p-6 text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
            <PartyPopper className="w-10 h-10" />
          </div>
          <div className="absolute -right-2 top-0">
            <Crown className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
        <h2 className="text-xl font-bold">
          {isFirstVisit ? 'Welcome! Let\'s Start Celebrating' : 'Create Unforgettable Moments'}
        </h2>
        <p className="text-white/80">
          {isFirstVisit 
            ? 'Create your first event or celebration to get started'
            : 'Join thousands celebrating special occasions'}
        </p>
        <Button 
          className="w-full bg-white text-purple-600 hover:bg-white/90"
          onClick={onCreateClick}
        >
          <Gift className="w-4 h-4 mr-2" />
          {isFirstVisit ? 'Create Your First Event' : 'Start Celebrating'}
        </Button>
      </CardContent>
    </Card>
  );
}