import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
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
