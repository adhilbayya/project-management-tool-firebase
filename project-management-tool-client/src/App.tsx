// src/App.tsx
import { useState, useEffect } from "react";
import "./App.css";
import Board from "./components/Board";
import AuthForm from "./components/AuthForm";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {user ? (
        // Signed In → Show Board
        <div className="relative h-full">
          <Board isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        </div>
      ) : (
        // Signed Out → Show Auth Form
        <div className="flex items-center justify-center h-screen">
          <AuthForm isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );
}

export default App;
