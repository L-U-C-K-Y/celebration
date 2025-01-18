import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Celebration {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  created_at: string;
  created_by: string;
  settings: {
    allow_downloads: boolean;
    allow_sharing: boolean;
    require_approval: boolean;
    background_music_url: string | null;
    theme_colors: string[];
  };
  activities: {
    id: string;
    type: 'photo' | 'video' | 'message';
    content: any;
    is_early_bird: boolean;
    created_at: string;
    author: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    reactions: {
      type: string;
      author: string;
      created_at: string;
    }[];
  }[];
}

export function useCelebration(id: string) {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCelebration() {
      try {
        setLoading(true);
        setError(null);

        // Fetch celebration with settings
        const { data: celebrationData, error: celebrationError } = await supabase
          .from('celebrations')
          .select(`
            *,
            settings:celebration_settings(*)
          `)
          .eq('id', id)
          .single();

        if (celebrationError) throw celebrationError;

        // Fetch activities with author and reactions
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select(`
            *,
            author:profiles!activities_created_by_fkey(*),
            reactions(
              type,
              author:profiles!reactions_created_by_fkey(username),
              created_at
            )
          `)
          .eq('celebration_id', id)
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;

        // Fetch media items for activities
        const activityIds = activities.map(a => a.id);
        const { data: mediaItems, error: mediaError } = await supabase
          .from('media_items')
          .select('*')
          .in('activity_id', activityIds)
          .eq('processing_status', 'completed');

        if (mediaError) throw mediaError;

        // Combine all data
        const fullCelebration = {
          ...celebrationData,
          activities: activities.map(activity => ({
            ...activity,
            content: activity.type === 'message' 
              ? activity.content
              : mediaItems
                  .filter(m => m.activity_id === activity.id)
                  .map(m => m.storage_path)
          }))
        };

        setCelebration(fullCelebration);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch celebration'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCelebration();
    }
  }, [id]);

  return { celebration, loading, error };
}