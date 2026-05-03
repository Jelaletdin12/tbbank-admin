import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { DashboardLayout } from "@/layouts/DashboardLayout";


const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LoanOrdersPage = lazy(() => import("@/pages/loanOrders"));
const LoanOrderMobilesPage = lazy(() => import("@/pages/loanOrderMobiles"));
const LoanRemainingPage = lazy(() => import("@/pages/loanRemaining"));
const LoanPaidOffLettersPage = lazy(() => import("@/pages/loanPaidOffLetters"));

function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-base)">
      <Spinner className="size-8 text-(--brand-500)" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    children: [
      {
        path: "/login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },

          { path: "/", element: <Navigate to="/dashboard" replace /> },

          // ── KARZ BÖLÜMI ──────────────────────────────────────────────────
          {
            path: "/resources/loan-orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrdersPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /resources/loan-order-mobiles
            path: "/resources/loan-order-mobiles",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderMobilesPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /resources/loan-remaining
            path: "/resources/loan-remaining",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanRemainingPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /resources/loan-paid-off-letters
            path: "/resources/loan-paid-off-letters",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanPaidOffLettersPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
