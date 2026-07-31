import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoutes({ roles = [], verify = false }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]"><p className="text-gray-500">Checking user details...</p></div>;

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  if (verify && user.role === 'doctor' && !user.is_verified) {
    return <Navigate to="/pending" />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;