import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomerKiosk } from "@/features/customer/CustomerKiosk";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { SuperAdminDashboard } from "@/features/admin/SuperAdminDashboard";
import { LandingPage } from "@/pages/LandingPage";
import { Onboarding } from "@/pages/Onboarding";
import { PendingApproval } from "@/pages/PendingApproval";
import { NotFound } from "@/pages/NotFound";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout showAdminActions>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Clerk Auth Routes (if needed, or use Clerk's modal) */}
          {/* <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} /> */}

          {/* Semi-Protected Routes (Must be logged in, but maybe no role yet) */}
          <Route
            path="/onboarding"
            element={
              <SignedIn>
                <Onboarding />
              </SignedIn>
            }
          />
          <Route
            path="/pending"
            element={
              <SignedIn>
                <PendingApproval />
              </SignedIn>
            }
          />

          {/* Protected Routes (Must be logged in AND Approved) */}
          <Route
            path="/kiosk"
            element={
              <AuthGuard>
                <CustomerKiosk />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <AuthGuard requireSuperAdmin>
                <SuperAdminDashboard />
              </AuthGuard>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
