// src/components/Column.tsx
import { useDroppable } from "@dnd-kit/core";
import type { CardType } from "./Card";
import Card from "./Card";

interface ColumnProps {
  title: string;
  id: string;
  cards: CardType[];
  isDarkMode: boolean;
  onDeleteCard: (cardId: string, fromList: string) => void;
}

const Column = ({
  title,
  id,
  cards,
  isDarkMode,
  onDeleteCard,
}: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-h-0 rounded-lg shadow-sm transition-all
        ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}
        ${isOver ? "ring-2 ring-blue-500 ring-inset" : ""}
      `}
    >
      {/* Fixed Header */}
      <div
        className={`p-3 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h2
          className={`font-semibold text-sm ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {title} <span className="text-xs opacity-70">({cards.length})</span>
        </h2>
      </div>

      {/* Scrollable Body – Takes Remaining Space */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {cards.length === 0 ? (
          <p
            className={`text-center text-xs italic ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            No cards
          </p>
        ) : (
          cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              isDarkMode={isDarkMode}
              onDelete={() => onDeleteCard(card._id, id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
