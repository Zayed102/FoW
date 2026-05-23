import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Toast from "./components/Toast";

import Login from "./pages/auth/Login";
import LoginForm from "./pages/auth/LoginForm";

import Dashboard from "./pages/coordinator/Dashboard";
import RequestDetail from "./pages/coordinator/RequestDetail";
import Notifications from "./pages/coordinator/Notifications";
import Reassignment from "./pages/coordinator/Reassignment";

import VisitList from "./pages/volunteer/VisitList";
import VisitDetail from "./pages/volunteer/VisitDetail";
import Schedule from "./pages/volunteer/Schedule";
import VisitRoute from "./pages/volunteer/Route";

function ToastContainer() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const { isAuthenticated, role } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={role === "volunteer" ? "/volunteer/visits" : "/coordinator/dashboard"}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="login/:role" element={<LoginForm />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<RootRedirect />} />

              <Route path="coordinator/dashboard" element={<Dashboard />} />
              <Route path="coordinator/requests/:id" element={<RequestDetail />} />
              <Route path="coordinator/notifications" element={<Notifications />} />
              <Route path="coordinator/reassignment" element={<Reassignment />} />

              <Route path="volunteer/visits" element={<VisitList />} />
              <Route path="volunteer/visits/:id" element={<VisitDetail />} />
              <Route path="volunteer/visits/:id/route" element={<VisitRoute />} />
              <Route path="volunteer/schedule" element={<Schedule />} />
            </Route>
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
