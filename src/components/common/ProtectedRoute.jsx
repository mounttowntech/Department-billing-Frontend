import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

  const { loading } = useAuth();

  const token = localStorage.getItem("token");

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;