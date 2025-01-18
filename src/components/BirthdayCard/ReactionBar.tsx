interface ReactionBarProps {
  reactions: { type: string; count: number }[];
  onEmojiClick: (emoji: string) => void;
}

export function ReactionBar({ reactions, onEmojiClick }: ReactionBarProps) {
  return (
    <div className="flex justify-center flex-wrap gap-2">
      {reactions.map((reaction, index) => (
        <button
          key={index}
          onClick={() => onEmojiClick(reaction.type)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">{reaction.type}</span>
            <span className="font-medium">{reaction.count}</span>
          </div>
        </button>
      ))}
    </div>
  );
}