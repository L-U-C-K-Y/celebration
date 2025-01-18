import { useState, useEffect } from 'react';
import { 
  PartyPopper, 
  Gift, 
  Crown, 
  Calendar, 
  Plus, 
  Timer, 
  ArrowRight, 
  Check,
  Bell,
  Cake,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  has_celebration: boolean;
  celebrations: { id: string }[] | null;
}

interface Celebration {
  id: string;
  title: string;
  date: string;
  image_url?: string;
  activities: any[];
}

export function HomePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          type,
          celebrations (id)
        `)
        .eq('created_by', user.id)
        .order('date', { ascending: true })
        .limit(10);

      if (eventsError) throw eventsError;

      // Process events data
      const processedEvents = eventsData.map(event => ({
        ...event,
        has_celebration: event.celebrations && event.celebrations.length > 0
      }));

      setEvents(processedEvents);

      // Check if this is the first visit (no events)
      setIsFirstVisit(processedEvents.length === 0);

      // Load recent celebrations
      const { data: celebrationsData, error: celebrationsError } = await supabase
        .from('celebrations')
        .select(`
          id,
          title,
          date,
          image_url,
          activities (count)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (celebrationsError) throw celebrationsError;

      setCelebrations(celebrationsData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
          <p className="text-white">Loading your celebrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 pb-20">
      <div className="max-w-md mx-auto">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
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
              onClick={() => setCreateDialogOpen(true)}
            >
              <Gift className="w-4 h-4 mr-2" />
              {isFirstVisit ? 'Create Your First Event' : 'Start Celebrating'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Celebrations */}
        {celebrations.length > 0 && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-white">Recent Celebrations</h2>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 p-0"
                onClick={() => onNavigate('/celebrations')}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4">
                {celebrations.map(celebration => (
                  <Card 
                    key={celebration.id} 
                    className="bg-white/10 border-none min-w-[280px] cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => onNavigate(`/celebrations/${celebration.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={celebration.image_url} />
                          <AvatarFallback>{celebration.title[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-medium">{celebration.title}</h3>
                          <div className="flex items-center text-sm text-white/60">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(celebration.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Events List */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-3">Upcoming Events</h2>
          {events.length === 0 ? (
            <Card className="bg-white/10 border-none p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Calendar className="w-12 h-12 text-white/60" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">No events yet</h3>
                  <p className="text-white/60">
                    Create your first event to start tracking important dates
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate('/create-event')}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Event
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <Card 
                  key={event.id} 
                  className="bg-white/10 border-none cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => onNavigate(`/events/${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-white/20 text-white">
                          {event.title[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{event.title}</h3>
                          {event.has_celebration && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="text-sm text-white/60">
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 mr-1" />
                            {calculateCountdown(event.date)} days until {event.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event FAB */}
      <button 
        className="fixed right-4 bottom-4 bg-white text-purple-600 rounded-full p-4 shadow-lg hover:bg-white/90 transition-colors"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Options Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What would you like to create?</DialogTitle>
            <DialogDescription>
              Choose between a simple event reminder or a full celebration experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <button
              className="flex items-start space-x-4 bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors text-left"
              onClick={() => {
                setCreateDialogOpen(false);
                onNavigate('/create-event');
              }}
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Event Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a simple reminder for birthdays, anniversaries, or any special date. 
                  We'll notify you when it's coming up.
                </p>
              </div>
            </button>

            <button
              className="flex items-start space-x-4 bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors text-left"
              onClick={() => {
                setCreateDialogOpen(false);
                onNavigate('/create');
              }}
            >
              <div className="p-3 bg-purple-100 rounded-lg">
                <Cake className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Full Celebration</h3>
                <p className="text-sm text-muted-foreground">
                  Create an interactive celebration page where friends can share photos, 
                  messages, and celebrate together.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}