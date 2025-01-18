import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Image as ImageIcon, MessageSquare, ArrowLeft, Cake, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateMediaFile, formatFileSize, generateThumbnail, uploadMedia } from '@/lib/utils';

interface CreatePageProps {
  onNavigate: (path: string) => void;
}

export function CreatePage({ onNavigate }: CreatePageProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load event data if creating from event
  useEffect(() => {
    const loadEventData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('eventId');
      if (!id) return;

      try {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;

        setEventId(id);
        setTitle(event.title);
        setDate(new Date(event.date));
        setTime('12:00'); // Default to noon
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load event data';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    };

    loadEventData();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      validateMediaFile(file);
      const thumbnail = await generateThumbnail(file);
      setImage(file);
      setPreview(thumbnail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !title) return;

    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Start a Supabase transaction
      const { error: insertError, data } = await supabase
        .from('celebrations')
        .insert({
          title,
          description,
          date: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            parseInt(time.split(':')[0]),
            parseInt(time.split(':')[1])
          ).toISOString(),
          location,
          created_by: user.id,
          event_id: eventId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        // The trigger will handle settings creation
        toast({
          title: 'Success!',
          description: 'Your celebration page has been created.',
          variant: 'success',
        });
        onNavigate(`/celebrations/${data.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create celebration';
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
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Create Celebration</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
            <Cake className="w-8 h-8 text-purple-600" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Celebration Title</Label>
              <Input
                id="title"
                placeholder="Birthday Party, Anniversary, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="bg-white/20 border-white/20 text-white placeholder:text-white/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10 bg-white/20 border-white/20 text-white"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="location"
                  placeholder="Where is the celebration?"
                  className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Textarea
                  id="description"
                  placeholder="Add some details about the celebration..."
                  className="min-h-[100px] pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-white">Cover Image</Label>
              {!preview ? (
                <div className="relative">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={loading || isUploading}
                  />
                  <Label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-white/60" />
                    <span className="text-sm text-white">
                      {isUploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                    <span className="text-xs text-white/60 mt-1">
                      Max size: {formatFileSize(50 * 1024 * 1024)}
                    </span>
                  </Label>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-purple-600 hover:bg-white/90" 
              disabled={loading || isUploading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Celebration'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white/80">
            <p>After creation, share the celebration page with friends and family to join in!</p>
          </div>
        </div>
      </div>
    </div>
  );
}