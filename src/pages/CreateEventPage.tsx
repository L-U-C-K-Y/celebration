import { useState } from 'react';
import { Calendar, Clock, Bell, ArrowLeft, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CreateEventPageProps {
  onNavigate: (path: string) => void;
}

const EVENT_TYPES = [
  'Birthday',
  'Anniversary',
  'Graduation',
  'Wedding',
  'Baby Shower',
  'Retirement',
  'Other'
] as const;

type EventType = typeof EVENT_TYPES[number];

interface Reminder {
  days: number;
  type: 'email' | 'push';
}

const DEFAULT_REMINDERS: Reminder[] = [
  { days: 7, type: 'email' },
];

export function CreateEventPage({ onNavigate }: CreateEventPageProps) {
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Birthday');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addReminder = () => {
    setReminders(prev => [...prev, { days: 1, type: 'email' }]);
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, field: keyof Reminder, value: string | number) => {
    setReminders(prev => prev.map((reminder, i) => {
      if (i === index) {
        return { ...reminder, [field]: field === 'days' ? parseInt(value as string) : value };
      }
      return reminder;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title || !type) return;

    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Show optimistic toast
      toast({
        title: 'Creating event...',
        description: 'Your event and reminders are being set up.',
      });

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          date: date.toISOString(),
          type,
          created_by: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create reminders
      const { error: remindersError } = await supabase
        .from('event_reminders')
        .insert(
          reminders.map(reminder => ({
            event_id: event.id,
            days_before: reminder.days,
            notification_type: reminder.type,
          }))
        );

      if (remindersError) throw remindersError;

      // Show success toast
      toast({
        title: 'Event created!',
        description: 'Your event and reminders have been set up successfully.',
        variant: 'success',
      });

      // Return to home page
      onNavigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Create Event Reminder</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Event Title</Label>
              <Input
                id="title"
                placeholder="Birthday, Anniversary, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="bg-white/20 border-white/20 text-white placeholder:text-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Event Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full bg-white/20 border-white/20 text-white rounded-md px-3 py-2"
                required
                disabled={loading}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={loading}
                    className={cn(
                      'w-full justify-start text-left font-normal bg-white/20 border-white/20 text-white',
                      !date && 'text-white/60'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={loading}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Reminders</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addReminder}
                  disabled={loading || reminders.length >= 5}
                  className="text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </div>

              <div className="space-y-3">
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={reminder.days}
                      onChange={(e) => updateReminder(index, 'days', e.target.value)}
                      className="bg-white/20 border-white/20 text-white"
                      disabled={loading}
                    />
                    <select
                      value={reminder.type}
                      onChange={(e) => updateReminder(index, 'type', e.target.value)}
                      className="bg-white/20 border-white/20 text-white rounded-md px-3 py-2"
                      disabled={loading}
                    >
                      <option value="email">Email</option>
                      <option value="push">Push</option>
                    </select>
                    {reminders.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReminder(index)}
                        disabled={loading}
                        className="text-white hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-blue-600 hover:bg-white/90" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Set Reminder'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white/80">
            <p>We'll send you notifications when the date is approaching.</p>
          </div>
        </div>
      </div>
    </div>
  );
}