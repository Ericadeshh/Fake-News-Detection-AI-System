import React, { useState, useEffect } from "react";
import type { AuthContextType } from "./AuthTypes";
import { AuthContext } from "./AuthTypes";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:5000/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 401) {
            logout();
            return;
          }
          if (!response.ok) throw new Error("Failed to fetch user");
          const data: { user: AuthContextType["user"] } = await response.json();
          setUser(data.user);
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
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Login failed: Invalid credentials");
      const data: { token: string; user: AuthContextType["user"] } =
        await response.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch {
      throw new Error("Login failed: Invalid credentials");
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok)
        throw new Error("Signup failed: Username may already exist");
      const data: { token: string; user: AuthContextType["user"] } =
        await response.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch {
      throw new Error("Signup failed: Username may already exist");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
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
