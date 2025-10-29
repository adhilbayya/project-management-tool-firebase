// src/components/Board.tsx
import { useEffect, useState } from "react";
import type { CardType, ProjectType } from "./Card";
import Column from "./Column";
import Sidebar from "./Sidebar";
import ProjectModal from "./ProjectModal";
import CardModal from "./CardModal";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Card from "./Card";
import { auth } from "../firebase";
import { type User } from "firebase/auth";
import { api } from "../utils/api";

interface ColumnType {
  todo: CardType[];
  "in-progress": CardType[];
  done: CardType[];
  [key: string]: CardType[];
}

interface BoardProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Board = ({ isDarkMode, onToggleTheme }: BoardProps) => {
  const [columns, setColumns] = useState<ColumnType>({
    todo: [],
    "in-progress": [],
    done: [],
  });

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setProjects([]);
        setSelectedProjectId(null);
        setColumns({ todo: [], "in-progress": [], done: [] });
      }
    });
    return unsubscribe;
  }, []);

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await api<ProjectType[]>("/cards/projects");
        setProjects(data);
        setError(null);
      } catch (err: unknown) {
        setError("Failed to fetch projects. Is your server running?");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  // Fetch Cards
  useEffect(() => {
    const fetchCards = async () => {
      if (!selectedProjectId || !user) return;
      try {
        setIsLoading(true);
        const data = await api<CardType[]>(
          `/cards/projects/${selectedProjectId}/cards`
        );
        setColumns(organiseCardsByList(data));
        setError(null);
      } catch (err: unknown) {
        setError("Failed to fetch cards.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, [selectedProjectId, user]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const fromList = active.data.current?.fromList as string;
    if (!fromList) return;

    const card = columns[fromList]?.find((c) => c._id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const cardId = active.id as string;
    const fromList = active.data.current?.fromList as keyof ColumnType;
    const toList = over.id as keyof ColumnType;

    if (fromList === toList) return;

    const draggedCard = columns[fromList].find((c) => c._id === cardId);
    if (!draggedCard) return;

    // Optimistic UI
    setColumns((prev) => {
      const from = prev[fromList].filter((c) => c._id !== cardId);
      const to = [
        ...prev[toList],
        { ...draggedCard, status: toList as CardType["status"] },
      ];
      return { ...prev, [fromList]: from, [toList]: to };
    });

    // API Update
    try {
      await api(`/cards/projects/${selectedProjectId}/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify({ status: toList }),
      });
    } catch (err: unknown) {
      console.error("Failed to update card:", err);
      // Optional: revert state
    }
  };

  const handleDeleteProject = (deletedId: string) => {
    if (selectedProjectId === deletedId) {
      setSelectedProjectId(null);
      setColumns({ todo: [], "in-progress": [], done: [] });
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleCreateProject = async (title: string, description: string) => {
    try {
      const newProject = await api<ProjectType>("/cards/projects", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setProjects((prev) => [...prev, newProject]);
      setSelectedProjectId(newProject._id);
    } catch (err: unknown) {
      console.error("Failed to create project:", err);
      alert("Failed to create project.");
    }
  };

  const handleCreateCard = async (title: string, description: string) => {
    if (!selectedProjectId) return;
    try {
      const newCard = await api<CardType>(
        `/cards/projects/${selectedProjectId}/cards`,
        {
          method: "POST",
          body: JSON.stringify({ title, description, status: "todo" }),
        }
      );
      setColumns((prev) => ({
        ...prev,
        todo: [...prev.todo, newCard],
      }));
    } catch (err: unknown) {
      console.error("Failed to create card:", err);
      alert("Failed to create card.");
    }
  };

  const handleDeleteCard = async (cardId: string, fromList: string) => {
    if (!selectedProjectId) return;
    try {
      await api(`/cards/projects/${selectedProjectId}/cards/${cardId}`, {
        method: "DELETE",
      });
      setColumns((prev) => ({
        ...prev,
        [fromList]: prev[fromList].filter((c) => c._id !== cardId),
      }));
    } catch (err: unknown) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Please log in to continue.
      </div>
    );
  }

  if (isLoading) return <div className="text-center p-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
          onCreateProject={() => setShowProjectModal(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          isCollapsed={sidebarCollapsed}
          onProjectDelete={handleDeleteProject}
          projectsData={setProjects}
        />

        <div className="flex-1 flex flex-col transition-all duration-300">
          <div
            className={`p-3 md:p-4 border-b ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-2 rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div>
                  <h1
                    className={`text-lg md:text-xl lg:text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedProject
                      ? selectedProject.title
                      : "Project Management Tool"}
                  </h1>
                  {selectedProject?.description && (
                    <p
                      className={`text-xs md:text-sm mt-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedProject.description}
                    </p>
                  )}
                </div>
              </div>
              {selectedProjectId && (
                <button
                  onClick={() => setShowCardModal(true)}
                  className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  + Add Card
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 p-2 md:p-5 overflow-hidden">
            {projects.length === 0 ? (
              <div className="text-center p-10 text-gray-500">
                No projects found. Create your first project!
              </div>
            ) : selectedProjectId ? (
              /* 3 FIXED COLUMNS – FULL HEIGHT GRID */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
                <Column
                  title="To Do"
                  id="todo"
                  cards={columns["todo"]}
                  isDarkMode={isDarkMode}
                  onDeleteCard={handleDeleteCard}
                />
                <Column
                  title="In Progress"
                  id="in-progress"
                  cards={columns["in-progress"]}
                  isDarkMode={isDarkMode}
                  onDeleteCard={handleDeleteCard}
                />
                <Column
                  title="Completed"
                  id="done"
                  cards={columns["done"]}
                  isDarkMode={isDarkMode}
                  onDeleteCard={handleDeleteCard}
                />
              </div>
            ) : (
              <div className="text-center p-10 text-gray-500">
                Please select a project.
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card card={activeCard} isDarkMode={isDarkMode} />
          ) : null}
        </DragOverlay>

        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onCreateProject={handleCreateProject}
          isDarkMode={isDarkMode}
        />
        <CardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          onCreateCard={handleCreateCard}
          isDarkMode={isDarkMode}
        />
      </div>
    </DndContext>
  );
};

const organiseCardsByList = (cards: CardType[]): ColumnType => {
  const columns: ColumnType = { todo: [], "in-progress": [], done: [] };
  cards.forEach((card) => {
    if (columns[card.status]) {
      columns[card.status].push(card);
    }
  });
  return columns;
};

export default Board;
