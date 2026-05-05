import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import LoanOrderEditPage from "@/pages/loanOrderEdit";

const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LoanOrdersPage = lazy(() => import("@/pages/loanOrders"));
const LoanOrderMobilesPage = lazy(() => import("@/pages/loanOrderMobile"));
const LoanRemainingPage = lazy(() => import("@/pages/loanRemaining"));
const LoanRemainingCreatePage = lazy(() => import("@/pages/loanRemainingCreate"));
const LoanRemainingViewPage = lazy(() => import("@/pages/loanRemainingView"));
const LoanRemainingEditPage = lazy(() => import("@/pages/loanRemainingEdit"));
const LoanPaidOffLettersPage = lazy(() => import("@/pages/loanPaidOffLetters"));
const LoanOrderCreatePage = lazy(() => import("@/pages/loanOrderCreate"));
const LoanOrderViewPage = lazy(() => import("@/pages/loanOrderView"));
const LoanOrderMobileViewPage = lazy(() => import("@/pages/loanOrderMobileView"));
const LoanOrderMobileEditPage = lazy(() => import("@/pages/loanOrderMobileEdit"));
const LoanOrderMobileCreatePage = lazy(() => import("@/pages/loanOrderMobileCreate"));

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
            path: "/loan-orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrdersPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-orders/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderViewPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-orders/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/loan-orders/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderEditPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /loan-order-mobiles
            path: "/loan-order-mobiles",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderMobilesPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-order-mobiles/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderMobileViewPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-order-mobiles/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderMobileCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/loan-order-mobiles/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanOrderMobileEditPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /loan-remaining
            path: "/loan-remaining",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanRemainingPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-remaining/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanRemainingCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/loan-remaining/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanRemainingViewPage />
              </Suspense>
            ),
          },
          {
            path: "/loan-remaining/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoanRemainingEditPage />
              </Suspense>
            ),
          },
          {
            // Sidebar: /loan-paid-off-letters
            path: "/loan-paid-off-letters",
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
