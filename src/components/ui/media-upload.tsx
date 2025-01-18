import { Camera } from 'lucide-react';
import { Button } from './button';
import { validateMediaFile } from '@/lib/utils';

interface MediaUploadProps {
  id: string;
  accept?: string;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function MediaUpload({
  id,
  accept = 'image/*',
  maxFiles = 1,
  onFilesSelected,
  className,
}: MediaUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    files.slice(0, maxFiles).forEach(file => {
      try {
        validateMediaFile(file);
        validFiles.push(file);
      } catch (err) {
        console.error(`Invalid file ${file.name}:`, err);
      }
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className={className}>
      <input
        type="file"
        id={id}
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileChange}
        className="hidden"
      />
      <label htmlFor={id}>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 hover:bg-white/30"
          asChild
        >
          <span>
            <Camera className="h-4 w-4" />
          </span>
        </Button>
      </label>
    </div>
  );
}