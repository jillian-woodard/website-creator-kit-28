import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StyleProvider } from "@/lib/styleContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Interview from "./pages/Interview.tsx";
import Profile from "./pages/Profile.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Closet from "./pages/Closet.tsx";
import ConnectEmail from "./pages/ConnectEmail.tsx";
import Planner from "./pages/Planner.tsx";
import Guide from "./pages/Guide.tsx";
import ForYou from "./pages/ForYou.tsx";
import Saved from "./pages/Saved.tsx";
import About from "./pages/About.tsx";
import Pricing from "./pages/Pricing.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

// Supabase recovery links redirect to the Site URL (often "/"), not a
// specific route. Catch the "#...type=recovery..." hash wherever it lands
// and send the user to the actual reset-password form.
const RecoveryRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (
      window.location.hash.includes("type=recovery") &&
      window.location.pathname !== "/reset-password"
    ) {
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    }
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StyleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RecoveryRedirect />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/closet" element={<ProtectedRoute><Closet /></ProtectedRoute>} />
              <Route path="/closet/connect-email" element={<ProtectedRoute><ConnectEmail /></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
              <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
              <Route path="/for-you" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StyleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
