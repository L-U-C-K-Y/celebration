import { useState } from 'react';
import { BirthdayCard } from '@/components/BirthdayCard';

export function CelebrationDetailsPage() {
  return (
    <div className="min-h-screen bg-background">
      <BirthdayCard />
    </div>
  );
}