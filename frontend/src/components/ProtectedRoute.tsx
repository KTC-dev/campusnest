import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

// Wraps a set of nested routes: redirects to /login if unauthenticated,
// or to a "not authorized" state if the user's role isn't allowed.
// Usage: <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>...</Route>
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
