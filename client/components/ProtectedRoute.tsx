import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: JSX.Element;
  role?: string;
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    //si tiene token pero no el rol correcto, lo mandamos a 403
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
