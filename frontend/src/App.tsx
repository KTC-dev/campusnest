import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPlaceholder from "@/pages/DashboardPlaceholder";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Any authenticated role can reach /dashboard; it renders a
            role-specific view once StudentDashboard/LandlordDashboard/
            AdminDashboard ship in Phase 2/4. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Route>

        {/* Example of a role-restricted route, ready for Phase 4's
            AdminDashboard: <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}> */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
