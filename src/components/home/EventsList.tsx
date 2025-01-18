import { Calendar, Timer, Plus, Check, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  has_celebration: boolean;
  celebrations: { id: string }[] | null;
  recurrence_pattern?: string | null;
}

interface EventsListProps {
  events: Event[];
  onNavigate: (path: string) => void;
}

export function EventsList({ events, onNavigate }: EventsListProps) {
  const calculateCountdown = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
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
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{event.title}</h3>
                        {event.recurrence_pattern && (
                          <Repeat className="w-4 h-4 text-blue-300" />
                        )}
                      </div>
                      {event.has_celebration && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="text-sm text-white/60">
                      <div className="flex items-center space-between">
                        <div className="flex items-center mr-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 mr-1" />
                          {calculateCountdown(event.date)} days until {event.type}
                        </div>
                      </div>
                      {event.recurrence_pattern && (
                        <div className="flex items-center mt-1 text-blue-300">
                          <Repeat className="w-4 h-4 mr-1" />
                          <span className="capitalize">
                            Repeats {event.recurrence_pattern}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}