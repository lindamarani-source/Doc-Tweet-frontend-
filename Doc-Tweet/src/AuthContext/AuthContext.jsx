import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null) 
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)


  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }
  
  useEffect(() => {    
    if (token) {
      fetch(input, {
        headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
          setUser(data.user)
          setLoading(false)
          logout()
        })
        .catch(error => {
          console.error(error)
          setLoading(false)
        })
    }
  }, [token])

  useEffect(() => {
    const chechAuthStatus = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false)
        return;
      }

      try {
        const response = await fetch('', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'content-type': 'application/json'
          }
        });
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          console.warn('Invalid token');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Network error')
      } finally {
        setLoading(false)
      }
    }
    chechAuthStatus();
  }, []);

  
  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)