import type { ProjectType } from "./Card";
import { DeleteOutline } from "@mui/icons-material";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { type User } from "firebase/auth";
import { api } from "../utils/api";
import { useEffect, useState } from "react";

interface SidebarProps {
  projects: ProjectType[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  onProjectDelete: (projectId: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isCollapsed: boolean;
  projectsData: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}

const Sidebar = ({
  projects,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  onProjectDelete,
  isDarkMode,
  onToggleTheme,
  isCollapsed,
  projectsData,
}: SidebarProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleDelete = async (projectId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmDelete) return;

    try {
      await api(`/cards/projects/${projectId}`, { method: "DELETE" });
      projectsData((prev) => prev.filter((p) => p._id !== projectId));
      onProjectDelete(projectId);
    } catch (err: unknown) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut(auth);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div
      className={`h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-12 md:w-16" : "w-64 md:w-80"
      } ${isDarkMode ? "bg-gray-900" : "bg-white"} border-r ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      } flex flex-col`}
    >
      {/* Header */}
      <div
        className={`p-2 md:p-4 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Avatar + Name */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </div>
              <span
                className={`text-sm md:text-base font-semibold truncate max-w-[120px] ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-1 md:p-1.5 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <span className="text-xs md:text-sm">
                {isDarkMode ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto">
        {!isCollapsed ? (
          <>
            {/* Current Project */}
            <div className="mb-4 md:mb-6">
              <h3
                className={`text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-3 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Current Project
              </h3>
              {selectedProject ? (
                <div
                  className={`p-2 md:p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <h4
                    className={`text-sm md:text-base font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedProject.title}
                  </h4>
                  {selectedProject.description && (
                    <p
                      className={`text-xs md:text-sm mt-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedProject.description}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  No project selected
                </div>
              )}
            </div>

            {/* All Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  All Projects
                </h3>
                <button
                  onClick={onCreateProject}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  + New
                </button>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {projects.length === 0 ? (
                  <div
                    className={`p-3 rounded-lg text-center text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No projects yet
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => onProjectSelect(project._id)}
                      className={`flex justify-between w-full text-left p-3 rounded-lg transition-colors group ${
                        selectedProjectId === project._id
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                          ? "hover:bg-gray-800 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {project.title}
                        </div>
                        {project.description && (
                          <div
                            className={`text-xs mt-1 truncate ${
                              selectedProjectId === project._id
                                ? "text-blue-100"
                                : isDarkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {project.description}
                          </div>
                        )}
                      </div>

                      {/* DELETE ICON – ONLY IN EXPANDED VIEW */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project._id);
                        }}
                        className=""
                      >
                        <DeleteOutline className="w-4 h-4" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* Collapsed View – NO DELETE ICON */
          <div className="space-y-2">
            <button
              onClick={onCreateProject}
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              title="Create New Project"
            >
              <span className="text-xl">+</span>
            </button>

            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => onProjectSelect(project._id)}
                className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                  selectedProjectId === project._id
                    ? isDarkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDarkMode
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title={project.title}
              >
                <span className="text-sm font-bold">
                  {project.title.charAt(0).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer – Logout at Bottom */}
      {!isCollapsed && (
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Project Management Tool
          </div>

          <button
            onClick={handleLogout}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              isDarkMode
                ? "bg-red-900/50 text-red-300 hover:bg-red-900"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
