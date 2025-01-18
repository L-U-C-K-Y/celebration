import { useState, useEffect } from 'react';
import { Search, Calendar, Users, Heart, MessageSquare, Image as ImageIcon, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Celebration {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image_url?: string;
  stats: {
    participants: number;
    reactions: number;
    messages: number;
    photos: number;
  };
}

export function CelebrationsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const fetchCelebrations = async (pageNumber = 1, replace = true) => {
    try {
      const isFirstLoad = pageNumber === 1;
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const today = new Date().toISOString();
      const pageSize = 10;
      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch celebrations with their stats
      const query = supabase
        .from('celebrations')
        .select(`
          *,
          activities (count),
          reactions:activities(
            reactions(count)
          )
        `)
        .order('date', { ascending: activeTab === 'upcoming' })
        .range(from, to);

      // Add date filter based on active tab
      if (activeTab === 'upcoming') {
        query.gte('date', today);
      } else {
        query.lt('date', today);
      }

      // Add search filter if query exists
      if (searchQuery) {
        query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Process and transform the data
      const processedCelebrations = data?.map(celebration => ({
        ...celebration,
        stats: {
          participants: celebration.activities?.length || 0,
          reactions: celebration.reactions?.reduce((sum, activity) => sum + (activity.reactions?.[0]?.count || 0), 0) || 0,
          messages: celebration.activities?.filter((a: any) => a.type === 'message').length || 0,
          photos: celebration.activities?.filter((a: any) => a.type === 'photo').length || 0,
        }
      })) || [];

      if (replace) {
        setCelebrations(processedCelebrations);
      } else {
        setCelebrations(prev => [...prev, ...processedCelebrations]);
      }

      setHasMore(count !== null && from + processedCelebrations.length < count);
      setPage(pageNumber);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load celebrations';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCelebrations(1);
  }, [activeTab, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCelebrations(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchCelebrations(page + 1, false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      handleLoadMore();
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 pb-20"
      onScroll={handleScroll}
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('/')}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Celebrations</h1>
            <Button 
              onClick={() => onNavigate('/create')}
              className="bg-white text-purple-600 hover:bg-white/90"
              size="sm"
              disabled={loading}
            >
              Create
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search celebrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60"
              disabled={loading}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/20">
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
                disabled={loading}
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
                disabled={loading}
              >
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="text-white/80">Loading celebrations...</p>
          </div>
        ) : celebrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 rounded-lg p-8">
              <Calendar className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No celebrations found
              </h3>
              <p className="text-white/60 mb-6">
                {searchQuery
                  ? "No celebrations match your search"
                  : activeTab === 'upcoming'
                  ? "There are no upcoming celebrations"
                  : "There are no past celebrations"}
              </p>
              <Button
                onClick={() => onNavigate('/create')}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                Create a Celebration
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {celebrations.map((celebration) => (
              <div
                key={celebration.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => onNavigate(`/celebrations/${celebration.id}`)}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={celebration.image_url} />
                      <AvatarFallback>{celebration.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{celebration.title}</h3>
                      <p className="text-sm text-white/60 truncate">{celebration.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(celebration.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{celebration.stats.participants} attending</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{celebration.stats.reactions}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{celebration.stats.messages}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="h-4 w-4" />
                      <span>{celebration.stats.photos}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}