import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await api.get("/profile");
        setProfileComplete(Boolean(res.data.profileComplete));
      } catch (err) {
        localStorage.removeItem("token");
        setProfileComplete(null);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [token]);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
