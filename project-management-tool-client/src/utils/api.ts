import { auth } from "../firebase";

const API_BASE = import.meta.env.VITE_API_URL;

export const api = async <T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const user = auth.currentUser;
  let token: string | null = null;

  if (user) {
    try {
      token = await user.getIdToken();
    } catch {
      console.error("Failed to get Firebase token");
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const data = await res.json();
      errorMessage = (data as { error?: string }).error || errorMessage;
    } catch {
      // Ignore JSON parse error — use statusText
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
};
