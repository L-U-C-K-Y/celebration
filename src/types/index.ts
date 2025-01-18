export interface Reaction {
  type: string;
  author: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'reaction' | 'photo' | 'video' | 'message';
  author: {
    name: string;
    imageUrl?: string;
  };
  content: string | string[]; // Updated to support multiple media items
  timestamp: string;
  isEarlyBird?: boolean;
  reactions: Reaction[];
}

export interface TopCelebrator {
  name: string;
  score: number;
  recentAction?: string;
}

export interface Person {
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  age: number;
  imageUrl?: string;
  daysUntilBirthday: number;
  reactions: { type: string; count: number }[];
  activities: Activity[];
  isWithin24Hours: boolean;
  totalCelebrations: number;
  milestones: {
    current: number;
    next: number;
    reward: string;
  };
  topCelebrators: TopCelebrator[];
}