import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://doc-tweet-backend.onrender.com";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || localStorage.getItem("doctweet_token") || null);
  const [loading, setLoading] = useState(true);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.removeItem("doctweet_token");
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctweet_token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || localStorage.getItem("doctweet_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/current_user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "content-type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.msg || "Invalid token");
        }

        setUser(data);
        setToken(savedToken);
      } catch (error) {
        console.warn("Auth check failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
