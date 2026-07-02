import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PropertyListingPage from "@/pages/PropertyListingPage";
import PropertyDetailsPage from "@/pages/PropertyDetailsPage";
import StudentDashboard from "@/pages/StudentDashboard";
import LandlordDashboard from "@/pages/LandlordDashboard";
import ListingFormPage from "@/pages/ListingFormPage";
import RoommateMatchesPage from "@/pages/RoommateMatchesPage";
import RoommateProfilePage from "@/pages/RoommateProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

// A single /dashboard route renders the right dashboard for the logged-in
// role. This keeps the URL stable across roles and matches how the app's
// nav links to "/dashboard" regardless of who's logged in.
function RoleDashboard() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "LANDLORD") return <LandlordDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/properties" element={<PropertyListingPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["LANDLORD"]} />}>
          <Route path="/dashboard/listings/new" element={<ListingFormPage />} />
          <Route path="/dashboard/listings/:id/edit" element={<ListingFormPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route path="/roommates" element={<RoommateMatchesPage />} />
          <Route path="/roommates/profile" element={<RoommateProfilePage />} />
        </Route>

        {/* Reserved for Phase 4: <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} /> </Route> */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
