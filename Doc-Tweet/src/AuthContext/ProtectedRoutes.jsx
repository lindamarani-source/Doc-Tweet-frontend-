import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";


function protectedRoutes({ roles = [], verify = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div>Checking user details....</div>;

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && roles.includes(user.role)) {
    return <Navigate to="/home" />;
  }

  if (verify && user.role == 'doctor' && !user.is_verified) {
    return <Navigate to="/pending" />;
  }

  return <Outlet />;
}

export default protectedRoutes;