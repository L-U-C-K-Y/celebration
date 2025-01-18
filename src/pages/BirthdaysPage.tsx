import { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Birthday {
  id: string;
  name: string;
  date: string;
  imageUrl?: string;
  daysUntil: number;
}

// Group birthdays by month
const groupBirthdaysByMonth = (birthdays: Birthday[]) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    return {
      name: new Date(2024, i, 1).toLocaleString('default', { month: 'long' }),
      birthdays: [] as Birthday[],
    };
  });

  birthdays.forEach((birthday) => {
    const month = new Date(birthday.date).getMonth();
    months[month].birthdays.push(birthday);
  });

  return months;
};

export function BirthdaysPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Example data
  const birthdays: Birthday[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      date: '2024-03-15',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop',
      daysUntil: 5,
    },
    {
      id: '2',
      name: 'Mike Smith',
      date: '2024-03-20',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
      daysUntil: 10,
    },
    {
      id: '3',
      name: 'Emma Wilson',
      date: '2024-04-05',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
      daysUntil: 26,
    },
  ];

  const groupedBirthdays = groupBirthdaysByMonth(birthdays);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 p-4 border-b space-y-4">
        <h1 className="text-2xl font-bold">Birthdays</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search birthdays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-4">
            {groupedBirthdays.map((month, index) => (
              <button
                key={month.name}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedMonth === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
                onClick={() => setSelectedMonth(index)}
              >
                {month.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Birthday List */}
      <div className="p-4 space-y-4">
        {groupedBirthdays[selectedMonth].birthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="bg-card rounded-lg overflow-hidden shadow-sm border"
          >
            <div className="flex items-center p-4 space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={birthday.imageUrl} alt={birthday.name} />
                <AvatarFallback>{birthday.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{birthday.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(birthday.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              {birthday.daysUntil <= 7 && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  {birthday.daysUntil} days
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}