import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Calendar, Gift } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UserProfilePageProps {
  userId: string;
  onNavigate: (path: string) => void;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  celebrations: {
    id: string;
    title: string;
    date: string;
    image_url: string | null;
  }[];
  common_celebrations: {
    id: string;
    title: string;
    date: string;
    image_url: string | null;
  }[];
}

export function UserProfilePage({ userId, onNavigate }: UserProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: currentUser } = await supabase.auth.getUser();
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch celebrations where this user has contributed
      const { data: celebrationsData, error: celebrationsError } = await supabase
        .from('activities')
        .select(`
          celebration:celebrations (
            id,
            title,
            date,
            image_url
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (celebrationsError) throw celebrationsError;

      // Fetch celebrations in common (where both users have activities)
      const { data: commonCelebrations, error: commonError } = await supabase
        .from('celebrations')
        .select(`
          id,
          title,
          date,
          image_url
        `)
        .in('id', 
          celebrationsData
            .map(item => item.celebration?.id)
            .filter(Boolean)
        )
        .filter('activities.created_by', 'eq', currentUser.user?.id);

      if (commonError) throw commonError;

      setProfile({
        ...profileData,
        celebrations: celebrationsData
          .map(item => item.celebration)
          .filter(Boolean)
          .filter((c, i, arr) => arr.findIndex(t => t.id === c.id) === i), // Remove duplicates
        common_celebrations: commonCelebrations || []
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
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
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
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
            <AlertDescription>Profile not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.full_name?.[0] || profile.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
                <p className="text-white/60">@{profile.username}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {profile.celebrations.length}
                </div>
                <div className="text-sm text-white/60">Celebrations</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {profile.common_celebrations.length}
                </div>
                <div className="text-sm text-white/60">In Common</div>
              </div>
            </div>

            {/* Common Celebrations */}
            {profile.common_celebrations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Celebrations in Common
                </h3>
                <div className="space-y-3">
                  {profile.common_celebrations.map(celebration => (
                    <button
                      key={celebration.id}
                      onClick={() => onNavigate(`/celebrations/${celebration.id}`)}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={celebration.image_url || undefined} />
                        <AvatarFallback>
                          <Gift className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">{celebration.title}</div>
                        <div className="text-sm text-white/60">
                          <Calendar className="w-3 h-3 inline-block mr-1" />
                          {new Date(celebration.date).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Celebrations */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Celebrations
              </h3>
              <div className="space-y-3">
                {profile.celebrations.slice(0, 5).map(celebration => (
                  <button
                    key={celebration.id}
                    onClick={() => onNavigate(`/celebrations/${celebration.id}`)}
                    className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={celebration.image_url || undefined} />
                      <AvatarFallback>
                        <Gift className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{celebration.title}</div>
                      <div className="text-sm text-white/60">
                        <Calendar className="w-3 h-3 inline-block mr-1" />
                        {new Date(celebration.date).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}