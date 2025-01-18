import { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface Contributor {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  contribution_count: number;
}

interface ContributorsProps {
  contributors: Contributor[];
  onViewProfile: (userId: string) => void;
}

export function Contributors({ contributors, onViewProfile }: ContributorsProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedContributors = showAll 
    ? contributors 
    : contributors.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-white/80" />
          <span className="font-medium text-white">Contributors</span>
        </div>
        <span className="text-sm text-white/60">{contributors.length} people</span>
      </div>

      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-2">
          {displayedContributors.map((contributor) => (
            <button
              key={contributor.id}
              onClick={() => onViewProfile(contributor.id)}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={contributor.avatar_url || undefined} />
                  <AvatarFallback>
                    {contributor.full_name?.[0] || contributor.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium text-white">
                    {contributor.full_name || contributor.username}
                  </div>
                  <div className="text-sm text-white/60">
                    {contributor.contribution_count} contributions
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40" />
            </button>
          ))}
        </div>
      </ScrollArea>

      {contributors.length > 5 && !showAll && (
        <Button
          variant="ghost"
          className="w-full text-white hover:bg-white/10"
          onClick={() => setShowAll(true)}
        >
          Show All Contributors
        </Button>
      )}
    </div>
  );
}