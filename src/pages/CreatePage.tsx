import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  ArrowLeft,
  Cake,
  Loader2,
  AlertCircle,
  X,
  Crown,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  validateMediaFile,
  formatFileSize,
  generateThumbnail,
  uploadMedia,
} from "@/lib/utils";
import ThemeColorSelector from "@/components/create/ThemeColorSelector";

type CelebrationType =
  | "Birthday"
  | "Anniversary"
  | "Graduation"
  | "Wedding"
  | "Baby Shower"
  | "Retirement"
  | "Other";

const CELEBRATION_TYPES: {
  value: CelebrationType;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    value: "Birthday",
    label: "Birthday",
    icon: <span className="text-lg">🎂</span>,
  },
  {
    value: "Wedding",
    label: "Wedding",
    icon: <span className="text-lg">💒</span>,
  },
  {
    value: "Graduation",
    label: "Graduation",
    icon: <span className="text-lg">🎓</span>,
  },
  {
    value: "Anniversary",
    label: "Anniversary",
    icon: <span className="text-lg">💑</span>,
  },
  {
    value: "Baby Shower",
    label: "Baby Shower",
    icon: <span className="text-lg">👶</span>,
  },
  {
    value: "Retirement",
    label: "Retirement",
    icon: <span className="text-lg">🌅</span>,
  },
  { value: "Other", label: "Other", icon: <span className="text-lg">🎉</span> },
];

interface CreatePageProps {
  onNavigate: (path: string) => void;
}

export function CreatePage({ onNavigate }: CreatePageProps) {
  const [celebrationType, setCelebrationType] = useState<CelebrationType>("Birthday");
  const [celebrationDate, setCelebrationDate] = useState<Date>();
  const [celebrationTime, setCelebrationTime] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [celebrantName, setCelebrantName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [themeColors, setThemeColors] = useState(['violet-600', 'purple-600', 'pink-600']);
  const { toast } = useToast();

  // Generate title based on type and details
  useEffect(() => {
    if (celebrantName) {
      let newTitle = '';
      switch (celebrationType) {
        case 'Birthday':
          if (birthDate && celebrationDate) {
            const age = getAge(birthDate, celebrationDate);
            newTitle = `${celebrantName}'s ${age}${getOrdinalSuffix(age)} Birthday Celebration`;
          } else {
            newTitle = `${celebrantName}'s Birthday Celebration`;
          }
          break;
        case 'Baby Shower':
          newTitle = `${celebrantName}'s Baby Shower`;
          break;
        case 'Retirement':
          newTitle = `${celebrantName}'s Retirement Celebration`;
          break;
        case 'Wedding':
          newTitle = `${celebrantName}'s Wedding`;
          break;
        case 'Graduation':
          newTitle = `${celebrantName}'s Graduation`;
          break;
        case 'Anniversary':
          newTitle = `${celebrantName}'s Anniversary`;
          break;
        default:
          newTitle = `${celebrantName}'s Celebration`;
      }
      setTitle(newTitle);
    }
  }, [celebrationType, celebrantName, birthDate, celebrationDate]);

  const getAge = (birthDate: Date, referenceDate: Date = new Date()) => {
    return differenceInYears(referenceDate, birthDate);
  };

  const getDescriptionPreview = () => {
    if (!celebrantName || !celebrationDate) return '';
    
    const celebrationDateStr = format(celebrationDate, 'MMMM d, yyyy');
    
    switch (celebrationType) {
      case 'Birthday':
        if (birthDate && celebrationDate) {
          const age = getAge(birthDate, celebrationDate);
          return `Join us in celebrating ${celebrantName}'s ${age}${getOrdinalSuffix(age)} birthday on ${celebrationDateStr}!`;
        }
        return `Join us in celebrating ${celebrantName}'s birthday on ${celebrationDateStr}!`;
      case 'Baby Shower':
        return `Join us for ${celebrantName}'s baby shower on ${celebrationDateStr}!`;
      case 'Retirement':
        return `Celebrating ${celebrantName}'s retirement on ${celebrationDateStr}. Join us for this special occasion!`;
      case 'Wedding':
        return `${celebrantName}'s wedding celebration on ${celebrationDateStr}. Share your love and best wishes!`;
      case 'Graduation':
        return `Celebrating ${celebrantName}'s graduation on ${celebrationDateStr}. Congratulate this amazing achievement!`;
      case 'Anniversary':
        return `Join us in celebrating ${celebrantName}'s anniversary on ${celebrationDateStr}!`;
      default:
        return `Join us in celebrating with ${celebrantName} on ${celebrationDateStr}!`;
    }
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

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
      const message =
        err instanceof Error ? err.message : "Failed to process image";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
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
    if (!celebrationDate || !celebrationTime || !title || !celebrantName) return;

    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      toast({
        title: "Creating celebration...",
        description: "Your celebration page is being set up.",
      });

      // Create the recurring event for birthdays
      let eventId: string | null = null;
      if (celebrationType === "Birthday" && birthDate) {
        const { data: event, error: eventError } = await supabase
          .from("events")
          .insert({
            title,
            date: celebrationDate.toISOString(),
            type: celebrationType,
            created_by: user.id,
            is_recurring: true,
            recurrence_pattern: "yearly",
            recurrence_interval: 1,
          })
          .select()
          .single();

        if (eventError) throw new Error(eventError.message);
        eventId = event.id;
      }

      // Create the celebration
      const { data: celebration, error: celebrationError } = await supabase
        .from("celebrations")
        .insert({
          title,
          description: description || getDescriptionPreview(),
          date: new Date(
            celebrationDate.getFullYear(),
            celebrationDate.getMonth(),
            celebrationDate.getDate(),
            parseInt(celebrationTime.split(":")[0], 10),
            parseInt(celebrationTime.split(":")[1], 10)
          ).toISOString(),
          location,
          created_by: user.id,
          event_id: eventId,
          type: celebrationType,
          celebrant_name: celebrantName,
          celebrant_birth_date: birthDate?.toISOString(),
          is_public: true,
          theme_colors: themeColors,
          allow_downloads: true,
          allow_sharing: true,
          require_approval: false,
        })
        .select()
        .single();

      if (celebrationError) throw new Error(celebrationError.message);

      // Upload image if exists
      if (image) {
        const { error: uploadError } = await supabase.storage
          .from("celebrations")
          .upload(`${celebration.id}/cover`, image);

        if (uploadError) throw new Error(uploadError.message);
      }

      toast({
        title: "Success!",
        description: "Your celebration page has been created.",
        variant: "default",
      });

      onNavigate(`/celebrations/${celebration.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create celebration";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${
      themeColors.map((color, index) => 
        index === 0 ? `from-${color}` : 
        index === 1 ? `via-${color}` : 
        `to-${color}`
      ).join(' ')
    }`}>
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate("/")}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Create Celebration</h1>
          <div className="w-10" />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-4">
              <Label className="text-white block">Celebration Picture (Optional)</Label>
              <div className="relative inline-block">
                <div className={`w-32 h-32 mx-auto bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transform hover:scale-105 transition-transform border-4 border-white/30 ${!preview ? 'cursor-pointer' : ''}`}>
                  {preview ? (
                    <img
                      src={preview}
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Cake className="w-16 h-16 text-white" />
                  )}
                </div>
                {!preview && (
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageSelect}
                    disabled={loading || isUploading}
                  />
                )}
                {preview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 top-0 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                <div className="absolute -right-4 top-0">
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
              {isUploading && (
                <p className="text-sm text-white/60">Uploading...</p>
              )}
            </div>

            {celebrantName && celebrationDate && (
              <div className="bg-white/10 p-4 rounded-lg space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">{celebrantName}</h3>
                  {celebrationType === "Birthday" && birthDate && (
                    <div className="text-xl font-medium text-white">
                      Turning {getAge(birthDate, celebrationDate)} on{" "}
                      {format(celebrationDate, "MMMM d, yyyy")}! 🎉
                    </div>
                  )}
                </div>
              </div>
            )}

<div className="space-y-2">
              <Label className="text-white">Celebration Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {CELEBRATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCelebrationType(type.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                      celebrationType === type.value
                        ? "bg-white/30"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className="text-white">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Celebrant's Name</Label>
              <Input
                value={celebrantName}
                onChange={(e) => setCelebrantName(e.target.value)}
                className="bg-white/20 border-white/20 text-white placeholder:text-white/60"
                placeholder="Who are we celebrating?"
                required
              />
            </div>

            {celebrationType === "Birthday" && (
              <div className="space-y-2">
                <Label className="text-white">Birth Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/20 border-white/20 text-white",
                        !birthDate && "text-white/60"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {birthDate
                        ? format(birthDate, "MMMM d, yyyy")
                        : "Select birth date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-white/60">
                  The original birth date (used to calculate age)
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Celebration Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/20 border-white/20 text-white",
                        !celebrationDate && "text-white/60"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {celebrationDate ? format(celebrationDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={celebrationDate}
                      onSelect={setCelebrationDate}
                      initialFocus
                      fromDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-white/60">
                  When the celebration will take place
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10 bg-white/20 border-white/20 text-white"
                    value={celebrationTime}
                    onChange={(e) => setCelebrationTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {celebrantName && celebrationDate && (
              <div className="bg-white/10 p-4 rounded-lg space-y-2">
                <Label className="text-white">Preview</Label>
                <h3 className="text-xl font-medium text-white">{title}</h3>
                <p className="text-white/80">{getDescriptionPreview()}</p>
              </div>
            )}

            <div className="space-y-2">
              <ThemeColorSelector
                value={themeColors}
                onChange={setThemeColors}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                Location (Optional)
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="location"
                  placeholder="Where is the celebration?"
                  className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Additional Details (Optional)
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Textarea
                  id="description"
                  placeholder="Add some details about the celebration..."
                  className="min-h-[100px] pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-purple-600 hover:bg-white/90"
              disabled={
                loading || isUploading || !celebrantName || !celebrationDate || !celebrationTime
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Celebration"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white/80">
            <p>
              After creation, share the celebration page with friends and family
              to join in!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
