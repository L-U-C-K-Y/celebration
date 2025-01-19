import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const previewCount = 3;
  const remainingCount = Math.max(0, contributors.length - previewCount);

  const previewContributors = contributors.slice(0, previewCount);

  return (
    <>
      <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => setDialogOpen(true)}>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-white/80" />
          <span className="text-sm text-white/80">Contributors</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {previewContributors.map((contributor) => (
              <Avatar key={contributor.id} className="w-6 h-6 border-2 border-purple-600">
                <AvatarImage src={contributor.avatar_url || undefined} />
                <AvatarFallback>
                  {contributor.full_name?.[0] || contributor.username[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {remainingCount > 0 && (
            <span className="text-sm text-white/60">+{remainingCount} more</span>
          )}
          <ArrowRight className="w-4 h-4 text-white/40" />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>All Contributors ({contributors.length})</span>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {contributors.map((contributor) => (
                <button
                  key={contributor.id}
                  onClick={() => {
                    onViewProfile(contributor.id);
                    setDialogOpen(false);
                  }}
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
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Contributors;