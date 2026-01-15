import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  uid: string | null;
  setUid: (uid: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [uid, setUid] = useState<string | null>("demo-user-123");

  return (
    <AuthContext.Provider value={{ uid, setUid, isAuthenticated: !!uid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
