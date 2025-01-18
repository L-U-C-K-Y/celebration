import { useState } from 'react';
import { Camera, VideoIcon, X, ArrowLeft, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { validateMediaFile, formatFileSize, generateThumbnail } from '@/lib/utils';

interface AddCelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    email: string;
    emoji: string;
    message?: string;
    mediaType?: 'photo' | 'video';
    mediaFiles?: File[];
  }) => void;
}

export function AddCelebrationDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddCelebrationDialogProps) {
  const [step, setStep] = useState(1);
  const [emailInput, setEmailInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleMediaSelect = async (files: FileList | null) => {
    if (!files?.length) return;

    setError(null);
    setIsUploading(true);

    try {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of Array.from(files)) {
        // Validate each file
        try {
          validateMediaFile(file);
        } catch (err) {
          toast({
            title: 'Invalid file',
            description: err instanceof Error ? err.message : 'Unknown error',
            variant: 'destructive',
          });
          continue;
        }

        // Generate thumbnail
        try {
          const thumbnail = await generateThumbnail(file);
          newPreviews.push(thumbnail);
          newFiles.push(file);
        } catch (err) {
          toast({
            title: 'Preview generation failed',
            description: 'Could not generate preview for ' + file.name,
            variant: 'destructive',
          });
        }
      }

      if (newFiles.length > 0) {
        setMediaFiles(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
      }
    } catch (err) {
      setError('Failed to process media files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!emailInput || !selectedEmoji) return;

    onSubmit({
      email: emailInput,
      emoji: selectedEmoji,
      message: messageInput || undefined,
      mediaType: mediaType || undefined,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    });

    // Reset form
    setStep(1);
    setEmailInput('');
    setSelectedEmoji(null);
    setMessageInput('');
    setMediaType(null);
    setMediaFiles([]);
    setPreviews([]);
    setError(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setEmailInput('');
    setSelectedEmoji(null);
    setMessageInput('');
    setMediaType(null);
    setMediaFiles([]);
    setPreviews([]);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Your Celebration</DialogTitle>
          <DialogDescription className="text-white/80">
            Share your memories and wishes for this special day.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Email (required)</Label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-white/20 border-white/20 text-white placeholder:text-white/60"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label className="text-white">Pick an emoji</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['❤️', '🎉', '🎂', '🌟', '🎁', '🎈', '🎊', '💫'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-colors ${
                        selectedEmoji === emoji
                          ? 'bg-white/30'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Add media (optional)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={() => setMediaType('photo')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                      mediaType === 'photo'
                        ? 'bg-white/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Camera className="w-6 h-6 mb-2" />
                    <span>Photos</span>
                  </button>
                  <button
                    onClick={() => setMediaType('video')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                      mediaType === 'video'
                        ? 'bg-white/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <VideoIcon className="w-6 h-6 mb-2" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {mediaType && (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="file"
                      accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
                      multiple={mediaType === 'photo'}
                      onChange={(e) => handleMediaSelect(e.target.files)}
                      className="hidden"
                      id="media-upload"
                      disabled={isUploading}
                    />
                    <Label
                      htmlFor="media-upload"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">
                        {isUploading ? 'Uploading...' : `Click to upload ${mediaType}`}
                      </span>
                      <span className="text-xs text-white/60 mt-1">
                        Max size: {formatFileSize(50 * 1024 * 1024)}
                      </span>
                    </Label>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-white">Message (optional)</Label>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  rows={3}
                  className="w-full bg-white/20 border-white/20 text-white placeholder:text-white/60 rounded-lg p-3 mt-1"
                  placeholder="Write something nice..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {step === 1 ? (
            <>
              <DialogClose asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={() => setStep(2)}
                disabled={!emailInput || !selectedEmoji}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {isUploading ? 'Uploading...' : 'Submit'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}