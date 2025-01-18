import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  reminder_days: number;
  is_recurring: boolean;
  has_celebration: boolean;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadEvents = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);

      const from = (pageNumber - 1) * limit;
      const to = from + limit - 1;

      const { data, error: eventsError, count } = await supabase
        .from('events')
        .select(`
          *,
          celebrations(id)
        `, { count: 'exact' })
        .range(from, to)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      const eventsWithCelebration = data.map(event => ({
        ...event,
        has_celebration: event.celebrations && event.celebrations.length > 0
      }));

      if (pageNumber === 1) {
        setEvents(eventsWithCelebration);
      } else {
        setEvents(prev => [...prev, ...eventsWithCelebration]);
      }

      setHasMore(count !== null && from + data.length < count);
      setPage(pageNumber);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    error,
    hasMore,
    loadMore: () => loadEvents(page + 1)
  };
}