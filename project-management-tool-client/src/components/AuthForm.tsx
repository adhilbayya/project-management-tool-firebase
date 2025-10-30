import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Loader2 } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthForm({ isDarkMode }: { isDarkMode: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(
          err.message.includes("wrong-password")
            ? "Invalid email or password"
            : err.message
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 `}>
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-xl ${
          isDarkMode
            ? "bg-gray-800/70 border border-gray-700"
            : "bg-white/80 border border-gray-200"
        }`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            PM
          </div>
        </div>

        <h2
          className={`text-2xl font-bold text-center mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <p
          className={`text-center text-sm mb-6 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {mode === "signup"
            ? "Start managing your projects today"
            : "Sign in to continue to your dashboard"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              isDarkMode
                ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            } focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              isDarkMode
                ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            } focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
            required
          />

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
            } flex items-center justify-center gap-2`}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div
              className={`absolute inset-0 flex items-center ${
                isDarkMode ? "border-gray-600" : "border-gray-300"
              }`}
            >
              <div className="w-full border-t border-inherit"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className={`px-2 ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-500"
                }`}
              >
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 6.5c1.61 0 3.05.55 4.18 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.41 6.16-4.41z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p
          className={`mt-6 text-center text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-blue-500 hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-500 hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
