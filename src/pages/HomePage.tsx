import { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Bell, Cake, Settings } from 'lucide-react';
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

import { HeroSection } from '@/components/home/HeroSection';
import { RecentCelebrations } from '@/components/home/RecentCelebrations';
import { EventsList } from '@/components/home/EventsList';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  has_celebration: boolean;
  celebrations: { id: string }[] | null;
  recurrence_pattern?: string | null;
}

interface Celebration {
  id: string;
  title: string;
  date: string;
  image_url?: string;
  activities: any[];
}

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
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
          celebrations (id),
          recurrence_pattern,
          recurrence_end_date
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
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <HeroSection
          isFirstVisit={isFirstVisit}
          onCreateClick={() => setCreateDialogOpen(true)}
        />

        <RecentCelebrations
          celebrations={celebrations}
          onNavigate={onNavigate}
        />

        <EventsList
          events={events}
          onNavigate={onNavigate}
        />

        {/* Settings FAB */}
        <button 
          className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          onClick={() => onNavigate('/settings')}
        >
          <Settings className="w-6 h-6" />
        </button>

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
    </div>
  );
}