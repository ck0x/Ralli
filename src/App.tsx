import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomerKiosk } from "@/features/customer/CustomerKiosk";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { NotFound } from "@/pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout showAdminActions>
        <Routes>
          <Route path="/" element={<CustomerKiosk />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
