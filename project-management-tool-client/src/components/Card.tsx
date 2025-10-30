import { useDraggable } from "@dnd-kit/core";
import { DeleteOutline } from "@mui/icons-material";

export interface CardType {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  userId: string;
}

export interface ProjectType {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  userId: string;
}

const Card = ({
  card,
  isDarkMode = false,
  onDelete,
}: {
  card: CardType;
  isDarkMode?: boolean;
  onDelete?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card._id,
      data: { fromList: card.status },
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
    willChange: "transform",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`
        p-2 md:p-3 border rounded-lg transition-all duration-200
        touch-action-none -webkit-touch-callout-none user-select-none
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
            : "bg-white border-gray-300 hover:bg-gray-50"
        }
        shadow-md hover:shadow-lg
        border-l-4
        ${
          card.status === "in-progress"
            ? "border-l-yellow-400"
            : card.status === "done"
            ? "border-l-green-400"
            : "border-l-red-400"
        }
      `}
    >
      <h4
        className={`flex justify-between text-xs md:text-sm font-bold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {card.title}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={`p-1 rounded-md transition-colors ${
            isDarkMode
              ? "hover:bg-red-900/50 text-red-300"
              : "hover:bg-red-100 text-red-700"
          }`}
        >
          <DeleteOutline className="w-4 h-4" />
        </button>
      </h4>
      {card.description && (
        <p
          className={`text-xs mt-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {card.description}
        </p>
      )}
    </div>
  );
};

export default Card;
