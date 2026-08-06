import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PropertyListingPage from "@/pages/PropertyListingPage";
import PropertyDetailsPage from "@/pages/PropertyDetailsPage";
import StudentDashboard from "@/pages/StudentDashboard";
import LandlordDashboard from "@/pages/LandlordDashboard";
import MyPropertiesPage from "@/pages/MyPropertiesPage";
import ListingFormPage from "@/pages/ListingFormPage";
import RoommateMatchesPage from "@/pages/RoommateMatchesPage";
import RoommateProfilePage from "@/pages/RoommateProfilePage";
import RoommateProfileViewPage from "@/pages/RoommateProfileViewPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import HelpPage from "@/pages/HelpPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import ConversationsPage from "@/pages/ConversationsPage";
import VerificationPage from "@/pages/VerificationPage";
import NotFoundPage from "@/pages/NotFoundPage";

// A single /dashboard route renders the right dashboard for the logged-in
// role. This keeps the URL stable across roles and matches how the app's
// nav links to "/dashboard" regardless of who's logged in.
function RoleDashboard() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/help" element={<HelpPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/conversations/:id" element={<ConversationsPage />} />
          <Route path="/dashboard/listings/new" element={<ListingFormPage />} />
          <Route path="/dashboard/listings/:id/edit" element={<ListingFormPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["LANDLORD"]} />}>
          <Route path="/dashboard/properties" element={<MyPropertiesPage />} />
          <Route path="/verification" element={<VerificationPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route path="/roommates" element={<RoommateMatchesPage />} />
          <Route path="/roommates/profile" element={<RoommateProfilePage />} />
          <Route path="/roommates/:id" element={<RoommateProfileViewPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieConsentBanner />
    </BrowserRouter>
  );
}
