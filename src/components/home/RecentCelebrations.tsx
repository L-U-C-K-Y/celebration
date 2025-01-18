import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from 'lucide-react';

interface Celebration {
  id: string;
  title: string;
  date: string;
  image_url?: string;
  activities: any[];
}

interface RecentCelebrationsProps {
  celebrations: Celebration[];
  onNavigate: (path: string) => void;
}

export function RecentCelebrations({ celebrations, onNavigate }: RecentCelebrationsProps) {
  if (celebrations.length === 0) return null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white">Recent Celebrations</h2>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 p-0"
          onClick={() => onNavigate('/celebrations')}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {celebrations.map(celebration => (
            <Card 
              key={celebration.id} 
              className="bg-white/10 border-none min-w-[280px] cursor-pointer hover:bg-white/20 transition-colors"
              onClick={() => onNavigate(`/celebrations/${celebration.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={celebration.image_url} />
                    <AvatarFallback>{celebration.title[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-medium">{celebration.title}</h3>
                    <div className="flex items-center text-sm text-white/60">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(celebration.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}