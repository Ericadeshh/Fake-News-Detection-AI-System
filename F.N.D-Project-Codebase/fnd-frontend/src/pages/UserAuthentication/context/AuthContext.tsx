import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await axios.get<{ user: User }>(
            "http://localhost:5000/me"
          );
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      }
    };
    initializeAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(
        "http://localhost:5000/login",
        {
          username,
          password,
        }
      );
      const { token: authToken, user: authUser } = response.data;
      localStorage.setItem("token", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      setToken(authToken);
      setUser(authUser);
      setIsAuthenticated(true);
    } catch {
      throw new Error("Login failed: Invalid credentials");
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(
        "http://localhost:5000/signup",
        {
          username,
          password,
        }
      );
      const { token: authToken, user: authUser } = response.data;
      localStorage.setItem("token", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      setToken(authToken);
      setUser(authUser);
      setIsAuthenticated(true);
    } catch {
      throw new Error("Signup failed: Username may already exist");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = user?.is_admin || false;

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
