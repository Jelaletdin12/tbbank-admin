import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { DashboardLayout } from "@/layouts/DashboardLayout";

const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LoanOrdersPage = lazy(() => import("@/pages/loanDepartment/loanOrders"));
const LoanOrderMobilesPage = lazy(
  () => import("@/pages/loanDepartment/loanOrderMobile"),
);
const LoanRemainingPage = lazy(
  () => import("@/pages/loanDepartment/loanRemaining"),
);
const LoanRemainingCreatePage = lazy(
  () => import("@/pages/loanDepartment/loanRemainingCreate"),
);
const LoanRemainingViewPage = lazy(
  () => import("@/pages/loanDepartment/loanRemainingView"),
);
const LoanRemainingEditPage = lazy(
  () => import("@/pages/loanDepartment/loanRemainingEdit"),
);
const LoanPaidOffLettersPage = lazy(
  () => import("@/pages/loanDepartment/loanPaidOffLetters"),
);
const LoanOrderCreatePage = lazy(
  () => import("@/pages/loanDepartment/loanOrderCreate"),
);
const LoanOrderViewPage = lazy(
  () => import("@/pages/loanDepartment/loanOrderView"),
);
const LoanOrderMobileViewPage = lazy(
  () => import("@/pages/loanDepartment/loanOrderMobileView"),
);
const LoanOrderMobileEditPage = lazy(
  () => import("@/pages/loanDepartment/loanOrderMobileEdit"),
);
const LoanOrderMobileCreatePage = lazy(
  () => import("@/pages/loanDepartment/loanOrderMobileCreate"),
);
const LoanOrderEditPage = lazy(
  () => import("@/pages/loanDepartment/loanOrderEdit"),
);
const OrderNewCardPage = lazy(
  () => import("@/pages/cardDepartment/orderNewCard"),
);
const OrderNewCardCreatePage = lazy(
  () => import("@/pages/cardDepartment/orderNewCardCreate"),
);
const OrderNewCardViewPage = lazy(
  () => import("@/pages/cardDepartment/orderNewCardView"),
);
const OrderNewCardEditPage = lazy(
  () => import("@/pages/cardDepartment/orderNewCardEdit"),
);
const CardTransactionsPage = lazy(
  () => import("@/pages/cardDepartment/cardTransactions"),
);
const CardTransactionViewPage = lazy(
  () => import("@/pages/cardDepartment/cardTransactionsView"),
);
const CardTransactionCreatePage = lazy(
  () => import("@/pages/cardDepartment/cardTransactionsCreate"),
);
const CardTransactionEditPage = lazy(
  () => import("@/pages/cardDepartment/cardTransactionsEdit"),
);

const CardRequisitesPage = lazy(
  () => import("@/pages/cardDepartment/cardRequisites"),
);
const CardRequisiteViewPage = lazy(
  () => import("@/pages/cardDepartment/cardRequisitesView"),
);
const CardRequisiteCreatePage = lazy(
  () => import("@/pages/cardDepartment/cardRequisitesCreate"),
);
const CardRequisiteEditPage = lazy(
  () => import("@/pages/cardDepartment/cardRequisitesEdit"),
);
const CardBalancePage = lazy(() => import("@/pages/cardDepartment/cardBalance"));
const CardBalanceCreatePage = lazy(() => import("@/pages/cardDepartment/cardBalanceCreate"));
const CardBalanceViewPage = lazy(() => import("@/pages/cardDepartment/cardBalanceView"));
const CardBalanceEditPage = lazy(() => import("@/pages/cardDepartment/cardBalanceEdit"));
const CardPinsPage = lazy(() => import("@/pages/cardDepartment/cardPins"));
const CardPinsCreatePage = lazy(() => import("@/pages/cardDepartment/cardPinsCreate"));
const CardPinsViewPage = lazy(() => import("@/pages/cardDepartment/cardPinsView"));
const CardPinsEditPage = lazy(() => import("@/pages/cardDepartment/cardPinsEdit"));

const VisaMasterPaymentsPage = lazy(() => import("@/pages/internationalPayments/visaMasterPayments"));
const VisaMasterPaymentCreatePage = lazy(() => import("@/pages/internationalPayments/visaMasterPaymentsCreate"));
const VisaMasterPaymentViewPage = lazy(() => import("@/pages/internationalPayments/visaMasterPaymentsView"));
const VisaMasterPaymentEditPage = lazy(() => import("@/pages/internationalPayments/visaMasterPaymentsEdit"));
const SberPaymentPage = lazy(() => import("@/pages/internationalPayments/sberPayments"));
const SberPaymentCreatePage = lazy(() => import("@/pages/internationalPayments/sberPaymentsCreate"));
const SberPaymentViewPage = lazy(() => import("@/pages/internationalPayments/sberPaymentsView"));
const SberPaymentEditPage = lazy(() => import("@/pages/internationalPayments/sberPaymentsEdit"));



const OperatorsPage = lazy(() => import("@/pages/users/operators"));
const OperatorCreatePage = lazy(() => import("@/pages/users/operatorsCreate"));
const OperatorsViewPage = lazy(() => import("@/pages/users/operatorsView"));
const OperatorEditPage = lazy(() => import("@/pages/users/operatorsEdit"));

const AllUsersPage = lazy(() => import("@/pages/users/allUsers"));
const AllUserCreatePage = lazy(() => import("@/pages/users/allUsersCreate"));
const AllUsersViewPage = lazy(() => import("@/pages/users/allUsersView"));
const AllUserEditPage = lazy(() => import("@/pages/users/allUsersEdit"));

const ClientsPage = lazy(() => import("@/pages/users/clients"));
const ClientCreatePage = lazy(() => import("@/pages/users/clientsCreate"));
const ClientViewPage = lazy(() => import("@/pages/users/clientsView"));
const ClientEditPage = lazy(() => import("@/pages/users/clientsEdit"));

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
          {
            // Sidebar: /order-new-card
            path: "/order-new-card",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderNewCardPage />
              </Suspense>
            ),
          },
          {
            path: "/order-new-card/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderNewCardCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/order-new-card/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderNewCardViewPage />
              </Suspense>
            ),
          },
          {
            path: "/order-new-card/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderNewCardEditPage />
              </Suspense>
            ),
          },
          {
            path: "/card-transactions",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardTransactionsPage />
              </Suspense>
            ),
          },
          {
            path: "/card-transactions/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardTransactionCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/card-transactions/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardTransactionViewPage />
              </Suspense>
            ),
          },
          {
            path: "/card-transactions/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardTransactionEditPage />
              </Suspense>
            ),
          },
          {
            path: "/card-requisites",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardRequisitesPage />
              </Suspense>
            ),
          },
          {
            path: "/card-requisites/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardRequisiteCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/card-requisites/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardRequisiteViewPage />
              </Suspense>
            ),
          },
          {
            path: "/card-requisites/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardRequisiteEditPage />
              </Suspense>
            ),
          },
          {
            path: "/card-balances",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardBalancePage />
              </Suspense>
            ),
          },
          {
            path: "/card-balances/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardBalanceCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/card-balances/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardBalanceViewPage />
              </Suspense>
            ),
          },
          {
            path: "/card-balances/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardBalanceEditPage />
              </Suspense>
            ),
          },
          {
            path: "/card-pins",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardPinsPage />
              </Suspense>
            ),
          },
          {
            path: "/card-pins/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardPinsCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/card-pins/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardPinsViewPage />
              </Suspense>
            ),
          },
          {
            path: "/card-pins/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CardPinsEditPage />
              </Suspense>
            ),
          },
          { // Sidebar: /visa-master-payments
            path: "/visa-master",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VisaMasterPaymentsPage />
              </Suspense>
            ),
          },
          {
            path: "/visa-master-payments/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VisaMasterPaymentCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/visa-master-payments/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VisaMasterPaymentViewPage />
              </Suspense>
            ),
          },
          {
            path: "/visa-master-payments/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VisaMasterPaymentEditPage />
              </Suspense>
            ),
          },
          { // Sidebar: /sber-payments
            path: "/sber-payments",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SberPaymentPage />
              </Suspense>
            ),
          },
          {
            path: "/sber-payments/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SberPaymentCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/sber-payments/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SberPaymentViewPage />
              </Suspense>
            ),
          },
          {
            path: "/sber-payments/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SberPaymentEditPage />
              </Suspense>
            ),
          },
          { // Sidebar: /operators
            path: "/operators",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OperatorsPage />
              </Suspense>
            ),
          },
          {
            path: "/operators/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OperatorCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/operators/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OperatorsViewPage />
              </Suspense>
            ),
          },
          {
            path: "/operators/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OperatorEditPage />
              </Suspense>
            ),
          },
          { // Sidebar: /all-users
            path: "/all-users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AllUsersPage />
              </Suspense>
            ),
          },
          {
            path: "/all-users/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AllUserCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/all-users/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AllUsersViewPage />
              </Suspense>
            ),
          },
          {
            path: "/all-users/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AllUserEditPage />
              </Suspense>
            ),
          },
          { // Sidebar: /clients
            path: "/clients",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientsPage />
              </Suspense>
            ),
          },
          {
            path: "/clients/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientCreatePage />
              </Suspense>
            ),
          },
          {
            path: "/clients/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientViewPage />
              </Suspense>
            ),
          },
          {
            path: "/clients/:id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientEditPage />
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
