import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Bell, 
  Gift, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface EventDetailsPageProps {
  eventId: string;
  onNavigate: (path: string) => void;
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  has_celebration: boolean;
  reminders: Array<{
    id: string;
    days_before: number;
    notification_type: 'email' | 'push';
  }>;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
  recurrence_days?: number[] | null;
  recurrence_day_of_month?: number | null;
  recurrence_week_of_month?: number | null;
}

export function EventDetailsPage({ eventId, onNavigate }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [newReminder, setNewReminder] = useState({ days: 1, type: 'email' as const });
  const { toast } = useToast();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          celebrations (id),
          reminders:event_reminders (
            id,
            days_before,
            notification_type
          )
        `)
        .eq('id', eventId)
        .eq('created_by', user.id)
        .single();

      if (eventError) throw eventError;

      setEvent({
        ...eventData,
        has_celebration: eventData.celebrations && eventData.celebrations.length > 0,
        reminders: eventData.reminders || []
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load event';
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

  const addReminder = async () => {
    if (!event) return;

    try {
      const { error: insertError } = await supabase
        .from('event_reminders')
        .insert({
          event_id: event.id,
          days_before: newReminder.days,
          notification_type: newReminder.type
        });

      if (insertError) throw insertError;

      toast({
        title: 'Reminder added',
        description: 'Your new reminder has been set up.',
      });

      await loadEvent();
      setShowRemindersDialog(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add reminder';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const removeReminder = async (reminderId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('event_reminders')
        .delete()
        .eq('id', reminderId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Reminder removed',
        description: 'The reminder has been deleted.',
      });

      await loadEvent();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove reminder';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
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
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => onNavigate('/')}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Event not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const daysUntil = calculateCountdown(event.date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Event Details</h1>
          <div className="w-10" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Event Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto">
              <Calendar className="w-8 h-8 text-white" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
              <div className="text-white/80">{event.type}</div>
              {event.recurrence_pattern && (
                <div className="flex items-center justify-center mt-2 text-blue-300 space-x-2">
                  <Repeat className="w-4 h-4" />
                  <span className="capitalize">
                    Repeats {event.recurrence_pattern}
                    {event.recurrence_end_date && (
                      <> until {new Date(event.recurrence_end_date).toLocaleDateString()}</>
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white">
                {daysUntil} days until {event.type}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 text-white/80">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Reminders Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white/80">
                  <Bell className="w-4 h-4" />
                  <span>Reminders</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRemindersDialog(true)}
                  className="text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {event.reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-white/60" />
                      <span className="text-white">
                        {reminder.days_before} days before via {reminder.notification_type}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReminder(reminder.id)}
                      className="text-white hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!event.has_celebration && (
              <Button
                onClick={() => onNavigate(`/create?eventId=${event.id}`)}
                className="w-full bg-white text-purple-600 hover:bg-white/90"
              >
                <Gift className="w-4 h-4 mr-2" />
                Create Celebration
              </Button>
            )}

            {event.has_celebration && (
              <Button
                onClick={() => onNavigate(`/celebrations/${event.id}`)}
                className="w-full bg-white text-purple-600 hover:bg-white/90"
              >
                <Gift className="w-4 h-4 mr-2" />
                View Celebration
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
            <DialogDescription>
              Set up a new reminder for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Days Before</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={newReminder.days}
                onChange={(e) => setNewReminder(prev => ({ ...prev, days: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Type</Label>
              <select
                value={newReminder.type}
                onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as 'email' | 'push' }))}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="email">Email</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant=" outline" onClick={() => setShowRemindersDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addReminder}>
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}