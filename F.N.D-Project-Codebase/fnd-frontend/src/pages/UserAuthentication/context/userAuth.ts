import { useContext } from "react";
import { AuthContext } from "./AuthTypes";
import type { AuthContextType } from "./AuthTypes";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context as AuthContextType;
};
