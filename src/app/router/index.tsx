import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PageErrorFallback } from "@/app/providers/ErrorBoundary";
import NotFoundPage from "@/pages/notFoundPage";

const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LoanOrdersPage = lazy(() => import("@/pages/loanDepartment/loanOrders"));
const LoanOrderMobilesPage = lazy(() => import("@/pages/loanDepartment/loanOrderMobile"));
const LoanRemainingPage = lazy(() => import("@/pages/loanDepartment/loanRemaining"));
const LoanRemainingCreatePage = lazy(() => import("@/pages/loanDepartment/loanRemainingCreate"));
const LoanRemainingViewPage = lazy(() => import("@/pages/loanDepartment/loanRemainingView"));
const LoanRemainingEditPage = lazy(() => import("@/pages/loanDepartment/loanRemainingEdit"));
const LoanPaidOffLettersPage = lazy(() => import("@/pages/loanDepartment/loanPaidOffLetters"));
const LoanPaidOffLettersCreatePage = lazy(() => import("@/pages/loanDepartment/loanPaidOffLettersCreate"));
const LoanPaidOffLettersViewPage = lazy(() => import("@/pages/loanDepartment/loanPaidOffLettersView"));
const LoanPaidOffLettersEditPage = lazy(() => import("@/pages/loanDepartment/loanPaidOffLettersEdit"));
const LoanOrderCreatePage = lazy(() => import("@/pages/loanDepartment/loanOrderCreate"));
const LoanOrderViewPage = lazy(() => import("@/pages/loanDepartment/loanOrderView"));
const LoanOrderMobileViewPage = lazy(() => import("@/pages/loanDepartment/loanOrderMobileView"));
const LoanOrderMobileEditPage = lazy(() => import("@/pages/loanDepartment/loanOrderMobileEdit"));
const LoanOrderMobileCreatePage = lazy(() => import("@/pages/loanDepartment/loanOrderMobileCreate"));
const LoanOrderEditPage = lazy(() => import("@/pages/loanDepartment/loanOrderEdit"));
const OrderNewCardPage = lazy(() => import("@/pages/cardDepartment/orderNewCard"));
const OrderNewCardCreatePage = lazy(() => import("@/pages/cardDepartment/orderNewCardCreate"));
const OrderNewCardViewPage = lazy(() => import("@/pages/cardDepartment/orderNewCardView"));
const OrderNewCardEditPage = lazy(() => import("@/pages/cardDepartment/orderNewCardEdit"));
const CardTransactionsPage = lazy(() => import("@/pages/cardDepartment/cardTransactions"));
const CardTransactionViewPage = lazy(() => import("@/pages/cardDepartment/cardTransactionsView"));
const CardTransactionCreatePage = lazy(() => import("@/pages/cardDepartment/cardTransactionsCreate"));
const CardTransactionEditPage = lazy(() => import("@/pages/cardDepartment/cardTransactionsEdit"));
const CardRequisitesPage = lazy(() => import("@/pages/cardDepartment/cardRequisites"));
const CardRequisiteViewPage = lazy(() => import("@/pages/cardDepartment/cardRequisitesView"));
const CardRequisiteCreatePage = lazy(() => import("@/pages/cardDepartment/cardRequisitesCreate"));
const CardRequisiteEditPage = lazy(() => import("@/pages/cardDepartment/cardRequisitesEdit"));
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
const CurrencyRatesPage = lazy(() => import("@/pages/currencies/currencyRates"));
const CurrencyRateCreatePage = lazy(() => import("@/pages/currencies/currencyRatesCreate"));
const CurrencyRateViewPage = lazy(() => import("@/pages/currencies/currencyRatesView"));
const CurrencyRateEditPage = lazy(() => import("@/pages/currencies/currencyRatesEdit"));
const VisaMasterSberSettingsPage = lazy(() => import("@/pages/currencies/visaMasterSberSettings"));
const VisaMasterSberSettingCreatePage = lazy(() => import("@/pages/currencies/visaMasterSberSettingsCreate"));
const VisaMasterSberSettingEditPage = lazy(() => import("@/pages/currencies/visaMasterSberSettingsEdit"));
const OnlinePaymentsHistoryPage = lazy(() => import("@/pages/onlinePaymentsHistory"));
const OnlinePaymentsHistoryViewPage = lazy(() => import("@/pages/onlinePaymentsHistory/onlinePaymenHistoryView"));
const RolesPage = lazy(() => import("@/pages/settings/users/roles"));
const RoleCreatePage = lazy(() => import("@/pages/settings/users/createRole"));
const RoleViewPage = lazy(() => import("@/pages/settings/users/rolesView"));
const RoleEditPage = lazy(() => import("@/pages/settings/users/editRole"));
const PermissionsPage = lazy(() => import("@/pages/settings/users/permissions"));
const PermissionCreatePage = lazy(() => import("@/pages/settings/users/permissionsCreate"));
const PermissionsViewPage = lazy(() => import("@/pages/settings/users/permissionsView"));
const PermissionEditPage = lazy(() => import("@/pages/settings/users/permissionsEdit"));
const LoanTypesPage = lazy(() => import("@/pages/settings/loan/loanTypes"));
const LoanTypeCreatePage = lazy(() => import("@/pages/settings/loan/loanTypesCreate"));
const LoanTypesViewPage = lazy(() => import("@/pages/settings/loan/loanTypesView"));
const LoanTypeEditPage = lazy(() => import("@/pages/settings/loan/loanTypesEdit"));
const RequiredDocumentsPage = lazy(() => import("@/pages/settings/loan/requiredDocuments"));
const RequiredDocumentCreatePage = lazy(() => import("@/pages/settings/loan/requiredDocumentsCreate"));
const RequiredDocumentsViewPage = lazy(() => import("@/pages/settings/loan/requiredDocumentsView"));
const RequiredDocumentEditPage = lazy(() => import("@/pages/settings/loan/requiredDocumentsEdit"));
const CardReasonsPage = lazy(() => import("@/pages/settings/card/reasons"));
const CardReasonCreatePage = lazy(() => import("@/pages/settings/card/reasonsCreate"));
const CardReasonsViewPage = lazy(() => import("@/pages/settings/card/reasonsView"));
const CardReasonEditPage = lazy(() => import("@/pages/settings/card/reasonsEdit"));
const CardTypesPage = lazy(() => import("@/pages/settings/card/cardTypes"));
const CardTypeCreatePage = lazy(() => import("@/pages/settings/card/cardTypesCreate"));
const CardTypesViewPage = lazy(() => import("@/pages/settings/card/cardTypesView"));
const CardTypeEditPage = lazy(() => import("@/pages/settings/card/cardTypesEdit"));
const DistrictsPage = lazy(() => import("@/pages/settings/location/districts"));
const DistrictCreatePage = lazy(() => import("@/pages/settings/location/districtsCreate"));
const DistrictsViewPage = lazy(() => import("@/pages/settings/location/districtsView"));
const DistrictEditPage = lazy(() => import("@/pages/settings/location/districtsEdit"));
const BranchesPage = lazy(() => import("@/pages/settings/location/branches"));
const BackupsPage = lazy(() => import("@/pages/backups"));
const BranchCreatePage = lazy(() => import("@/pages/settings/location/branchesCreate"));
const BranchesViewPage = lazy(() => import("@/pages/settings/location/branchesView"));
const BranchEditPage = lazy(() => import("@/pages/settings/location/branchesEdit"));

// ─── Guards ───────────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

type TitleFn = (t: (key: string, fallback: string) => string) => string;

type AppHandle = {
  title: TitleFn;
  indexPath?: string;
};

type AppRoute = Omit<RouteObject, "handle" | "children"> & {
  handle?: AppHandle;
  children?: AppRoute[];
};



// ─── Helpers ──────────────────────────────────────────────────────────────────

// Wraps a lazy page in Suspense — keeps route definitions clean
function page(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Pathless wrapper route — carries breadcrumb title, renders children via Outlet
function bc(titleFn: TitleFn, indexPath?: string): AppRoute {
  return {
    element: <Outlet />,
    handle: {
      title: titleFn,
      indexPath,
    },
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

const routes: AppRoute[] = [
  {
    element: <PublicGuard />,
    errorElement: <PageErrorFallback />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: page(LoginPage) },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    errorElement: <PageErrorFallback />,
    children: [
      {
        element: <DashboardLayout />,
        errorElement: <PageErrorFallback />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },

          {
            path: "/dashboard",
            handle: { title: (t) => t("nav.dashboard", "Baş sahypa") },
            element: page(DashboardPage),
          },

          // ── KARZ SARGYTLARY ───────────────────────────────────────────────
          {
            ...bc((t) => t("loanOrders.title", "Karz sargytlary"), "/loan-orders"),
            children: [
              { path: "/loan-orders", element: page(LoanOrdersPage) },
              {
                path: "/loan-orders/create",
                handle: { title: (t) => t("loanOrders.createTitle", "Karz sargyt döretmek") },
                element: page(LoanOrderCreatePage),
              },
              {
                path: "/loan-orders/:id",
                handle: { title: (t) => t("loanOrders.viewTitle", "Karz sargyt giňişleýin") },
                element: page(LoanOrderViewPage),
              },
              {
                path: "/loan-orders/:id/edit",
                handle: { title: (t) => t("loanOrders.editTitle", "Karz sargyt üýtgetmek") },
                element: page(LoanOrderEditPage),
              },
            ],
          },

          // ── KARZ SARGYT (MOBILE) ──────────────────────────────────────────
          {
            ...bc((t) => t("loanOrderMobiles.title", "Karz sargytlary (Mobile)"), "/loan-order-mobiles"),
            children: [
              { path: "/loan-order-mobiles", element: page(LoanOrderMobilesPage) },
              {
                path: "/loan-order-mobiles/create",
                handle: { title: (t) => t("loanOrderMobiles.createTitle", "Karz sargyt döretmek (Mobile)") },
                element: page(LoanOrderMobileCreatePage),
              },
              {
                path: "/loan-order-mobiles/:id",
                handle: { title: (t) => t("loanOrderMobiles.viewTitle", "Karz sargyt giňişleýin (Mobile)") },
                element: page(LoanOrderMobileViewPage),
              },
              {
                path: "/loan-order-mobiles/:id/edit",
                handle: { title: (t) => t("loanOrderMobiles.editTitle", "Karz sargyt üýtgetmek (Mobile)") },
                element: page(LoanOrderMobileEditPage),
              },
            ],
          },

          // ── KARZYŇ GALYNDYSY ──────────────────────────────────────────────
          {
            ...bc((t) => t("loanRemaining.title", "Karzyň galyndysy"), "/loan-remaining"),
            children: [
              { path: "/loan-remaining", element: page(LoanRemainingPage) },
              {
                path: "/loan-remaining/create",
                handle: { title: (t) => t("loanRemaining.createTitle", "Karz galyndy döretmek") },
                element: page(LoanRemainingCreatePage),
              },
              {
                path: "/loan-remaining/:id",
                handle: { title: (t) => t("loanRemaining.viewTitle", "Karz galyndy giňişleýin") },
                element: page(LoanRemainingViewPage),
              },
              {
                path: "/loan-remaining/:id/edit",
                handle: { title: (t) => t("loanRemaining.editTitle", "Karz galyndy üýtgetmek") },
                element: page(LoanRemainingEditPage),
              },
            ],
          },

          // ── GÜWANAMALAR ───────────────────────────────────────────────────
          {
            ...bc((t) => t("loanPaidOffLetters.title", "Güwanamalar"), "/loan-paid-off-letters"),
            children: [
              { path: "/loan-paid-off-letters", element: page(LoanPaidOffLettersPage) },
              {
                path: "/loan-paid-off-letters/create",
                handle: { title: (t) => t("loanPaidOffLetters.createTitle", "Güwanama döretmek") },
                element: page(LoanPaidOffLettersCreatePage),
              },
              {
                path: "/loan-paid-off-letters/:id",
                handle: { title: (t) => t("loanPaidOffLetters.viewTitle", "Güwanama giňişleýin") },
                element: page(LoanPaidOffLettersViewPage),
              },
              {
                path: "/loan-paid-off-letters/:id/edit",
                handle: { title: (t) => t("loanPaidOffLetters.editTitle", "Güwanama üýtgetmek") },
                element: page(LoanPaidOffLettersEditPage),
              },
            ],
          },

          // ── TÄZE KART AÇMAK ───────────────────────────────────────────────
          {
            ...bc((t) => t("cardOrder.title", "Täze kart açmak"), "/order-new-card"),
            children: [
              { path: "/order-new-card", element: page(OrderNewCardPage) },
              {
                path: "/order-new-card/create",
                handle: { title: (t) => t("cardOrder.createTitle", "Kart sargyt döretmek") },
                element: page(OrderNewCardCreatePage),
              },
              {
                path: "/order-new-card/:id",
                handle: { title: (t) => t("cardOrder.viewTitle", "Kart sargyt giňişleýin") },
                element: page(OrderNewCardViewPage),
              },
              {
                path: "/order-new-card/:id/edit",
                handle: { title: (t) => t("cardOrder.editTitle", "Kart sargyt üýtgetmek") },
                element: page(OrderNewCardEditPage),
              },
            ],
          },

          // ── KART HEREKETLERI ──────────────────────────────────────────────
          {
            ...bc((t) => t("cardTransactions.title", "Kart hereketleri"), "/card-transactions"),
            children: [
              { path: "/card-transactions", element: page(CardTransactionsPage) },
              {
                path: "/card-transactions/create",
                handle: { title: (t) => t("cardTransactions.createTitle", "Kart herekedi döretmek") },
                element: page(CardTransactionCreatePage),
              },
              {
                path: "/card-transactions/:id",
                handle: { title: (t) => t("cardTransactions.viewTitle", "Kart hereketi giňişleýin") },
                element: page(CardTransactionViewPage),
              },
              {
                path: "/card-transactions/:id/edit",
                handle: { title: (t) => t("cardTransactions.editTitle", "Kart herekedi üýtgetmek") },
                element: page(CardTransactionEditPage),
              },
            ],
          },

          // ── KART REKWIZITLER ──────────────────────────────────────────────
          {
            ...bc((t) => t("cardRequisites.title", "Kart rekwizitler"), "/card-requisites"),
            children: [
              { path: "/card-requisites", element: page(CardRequisitesPage) },
              {
                path: "/card-requisites/create",
                handle: { title: (t) => t("cardRequisites.createTitle", "Kart rekwizit döretmek") },
                element: page(CardRequisiteCreatePage),
              },
              {
                path: "/card-requisites/:id",
                handle: { title: (t) => t("cardRequisites.viewTitle", "Kart rekwizit giňişleýin") },
                element: page(CardRequisiteViewPage),
              },
              {
                path: "/card-requisites/:id/edit",
                handle: { title: (t) => t("cardRequisites.editTitle", "Kart rekwizit üýtgetmek") },
                element: page(CardRequisiteEditPage),
              },
            ],
          },

          // ── KART GALYNDYLARY ──────────────────────────────────────────────
          {
            ...bc((t) => t("cardBalance.title", "Kart galyndylary"), "/card-balances"),
            children: [
              { path: "/card-balances", element: page(CardBalancePage) },
              {
                path: "/card-balances/create",
                handle: { title: (t) => t("cardBalance.createTitle", "Kart galyndy döretmek") },
                element: page(CardBalanceCreatePage),
              },
              {
                path: "/card-balances/:id",
                handle: { title: (t) => t("cardBalance.viewTitle", "Kart galyndy giňişleýin") },
                element: page(CardBalanceViewPage),
              },
              {
                path: "/card-balances/:id/edit",
                handle: { title: (t) => t("cardBalance.editTitle", "Kart galyndy üýtgetmek") },
                element: page(CardBalanceEditPage),
              },
            ],
          },

          // ── KART PIN BUKJALAR ─────────────────────────────────────────────
          {
            ...bc((t) => t("cardPins.title", "Kart pin bukjalar"), "/card-pins"),
            children: [
              { path: "/card-pins", element: page(CardPinsPage) },
              {
                path: "/card-pins/create",
                handle: { title: (t) => t("cardPins.createTitle", "Kart pin bukja döretmek") },
                element: page(CardPinsCreatePage),
              },
              {
                path: "/card-pins/:id",
                handle: { title: (t) => t("cardPins.viewTitle", "Kart pin bukja giňişleýin") },
                element: page(CardPinsViewPage),
              },
              {
                path: "/card-pins/:id/edit",
                handle: { title: (t) => t("cardPins.editTitle", "Kart pin bukja üýtgetmek") },
                element: page(CardPinsEditPage),
              },
            ],
          },

          // ── VISA/MASTER TÖLEGLERI ─────────────────────────────────────────
          {
            ...bc((t) => t("visaMaster.title", "Visa/Master tölegleri"), "/visa-master"),
            children: [
              { path: "/visa-master", element: page(VisaMasterPaymentsPage) },
              {
                path: "/visa-master/create",
                handle: { title: (t) => t("visaMaster.createTitle", "Visa/Master töleg döretmek") },
                element: page(VisaMasterPaymentCreatePage),
              },
              {
                path: "/visa-master/:id",
                handle: { title: (t) => t("visaMaster.viewTitle", "Visa/Master töleg giňişleýin") },
                element: page(VisaMasterPaymentViewPage),
              },
              {
                path: "/visa-master/:id/edit",
                handle: { title: (t) => t("visaMaster.editTitle", "Visa/Master töleg üýtgetmek") },
                element: page(VisaMasterPaymentEditPage),
              },
            ],
          },

          // ── SBER TÖLEGLER ─────────────────────────────────────────────────
          {
            ...bc((t) => t("sberPayments.title", "Sber tölegler"), "/sber-payments"),
            children: [
              { path: "/sber-payments", element: page(SberPaymentPage) },
              {
                path: "/sber-payments/create",
                handle: { title: (t) => t("sberPayments.createTitle", "Sber töleg döretmek") },
                element: page(SberPaymentCreatePage),
              },
              {
                path: "/sber-payments/:id",
                handle: { title: (t) => t("sberPayments.viewTitle", "Sber töleg giňişleýin") },
                element: page(SberPaymentViewPage),
              },
              {
                path: "/sber-payments/:id/edit",
                handle: { title: (t) => t("sberPayments.editTitle", "Sber töleg üýtgetmek") },
                element: page(SberPaymentEditPage),
              },
            ],
          },

          // ── OPERATORLAR ───────────────────────────────────────────────────
          {
            ...bc((t) => t("operators.title", "Operatorlar"), "/operators"),
            children: [
              { path: "/operators", element: page(OperatorsPage) },
              {
                path: "/operators/create",
                handle: { title: (t) => t("operators.createTitle", "Operator döretmek") },
                element: page(OperatorCreatePage),
              },
              {
                path: "/operators/:id",
                handle: { title: (t) => t("operators.viewTitle", "Operator giňişleýin") },
                element: page(OperatorsViewPage),
              },
              {
                path: "/operators/:id/edit",
                handle: { title: (t) => t("operators.editTitle", "Operator üýtgetmek") },
                element: page(OperatorEditPage),
              },
            ],
          },

          // ── ÄHLI ULANYJYLAR ───────────────────────────────────────────────
          {
            ...bc((t) => t("allUsers.title", "Ähli ulanyjylar"), "/all-users"),
            children: [
              { path: "/all-users", element: page(AllUsersPage) },
              {
                path: "/all-users/create",
                handle: { title: (t) => t("allUsers.createTitle", "Ulanyjy döretmek") },
                element: page(AllUserCreatePage),
              },
              {
                path: "/all-users/:id",
                handle: { title: (t) => t("allUsers.viewTitle", "Ulanyjy giňişleýin") },
                element: page(AllUsersViewPage),
              },
              {
                path: "/all-users/:id/edit",
                handle: { title: (t) => t("allUsers.editTitle", "Ulanyjy üýtgetmek") },
                element: page(AllUserEditPage),
              },
            ],
          },

          // ── MÜŞDERILER ────────────────────────────────────────────────────
          {
            ...bc((t) => t("clients.title", "Müşderiler"), "/clients"),
            children: [
              { path: "/clients", element: page(ClientsPage) },
              {
                path: "/clients/create",
                handle: { title: (t) => t("clients.createTitle", "Müşderi döretmek") },
                element: page(ClientCreatePage),
              },
              {
                path: "/clients/:id",
                handle: { title: (t) => t("clients.viewTitle", "Müşderi giňişleýin") },
                element: page(ClientViewPage),
              },
              {
                path: "/clients/:id/edit",
                handle: { title: (t) => t("clients.editTitle", "Müşderi üýtgetmek") },
                element: page(ClientEditPage),
              },
            ],
          },

          // ── WALÝUTA KURSLARY ──────────────────────────────────────────────
          {
            ...bc((t) => t("currencyRates.title", "Walýuta kurslary"), "/currency-rates"),
            children: [
              { path: "/currency-rates", element: page(CurrencyRatesPage) },
              {
                path: "/currency-rates/create",
                handle: { title: (t) => t("currencyRates.createTitle", "Walýuta kursy döretmek") },
                element: page(CurrencyRateCreatePage),
              },
              {
                path: "/currency-rates/:id",
                handle: { title: (t) => t("currencyRates.viewTitle", "Walýuta kursy giňişleýin") },
                element: page(CurrencyRateViewPage),
              },
              {
                path: "/currency-rates/:id/edit",
                handle: { title: (t) => t("currencyRates.editTitle", "Walýuta kursy üýtgetmek") },
                element: page(CurrencyRateEditPage),
              },
            ],
          },

          // ── VISA/MASTER, SBER SAZLAMALARY ─────────────────────────────────
          {
            ...bc((t) => t("visaMasterSberSettings.title", "Visa/Master, Sber sazlamalary"), "/visa-master-sber-settings"),
            children: [
              { path: "/visa-master-sber-settings", element: page(VisaMasterSberSettingsPage) },
              {
                path: "/visa-master-sber-settings/create",
                handle: { title: (t) => t("visaMasterSberSettings.createTitle", "Sazlama döretmek") },
                element: page(VisaMasterSberSettingCreatePage),
              },
              {
                path: "/visa-master-sber-settings/:id/edit",
                handle: { title: (t) => t("visaMasterSberSettings.editTitle", "Sazlama üýtgetmek") },
                element: page(VisaMasterSberSettingEditPage),
              },
            ],
          },

          // ── ONLAÝN TÖLEG TARYHY ───────────────────────────────────────────
          {
            ...bc((t) => t("onlinePayments.title", "Onlaýn töleg taryhy"), "/online-payments-history"),
            children: [
              { path: "/online-payments-history", element: page(OnlinePaymentsHistoryPage) },
              {
                path: "/online-payments-history/:id",
                handle: { title: (t) => t("onlinePayments.viewTitle", "Töleg giňišleýin") },
                element: page(OnlinePaymentsHistoryViewPage),
              },
            ],
          },

          // ── BEKAPLAR ──────────────────────────────────────────────────────
          {
            path: "/backups",
            handle: { title: (t) => t("backups.title", "Bekaplar") },
            element: page(BackupsPage),
          },

          // ── SAZLAMALAR > ULANYJYLAR ───────────────────────────────────────
          {
            ...bc((t) => t("nav.settings", "Sazlamalar")),
            children: [
              // Roles
              {
                ...bc((t) => t("roles.title", "Rollar"), "/settings/users/roles"),
                children: [
                  { path: "/settings/users/roles", element: page(RolesPage) },
                  {
                    path: "/settings/users/roles/create",
                    handle: { title: (t) => t("roles.createTitle", "Rol döretmek") },
                    element: page(RoleCreatePage),
                  },
                  {
                    path: "/settings/users/roles/:id",
                    handle: { title: (t) => t("roles.viewTitle", "Rol giňişleýin") },
                    element: page(RoleViewPage),
                  },
                  {
                    path: "/settings/users/roles/:id/edit",
                    handle: { title: (t) => t("roles.editTitle", "Rol üýtgetmek") },
                    element: page(RoleEditPage),
                  },
                ],
              },
              // Permissions
              {
                ...bc((t) => t("permissions.title", "Rugsatlar"), "/settings/users/permissions"),
                children: [
                  { path: "/settings/users/permissions", element: page(PermissionsPage) },
                  {
                    path: "/settings/users/permissions/create",
                    handle: { title: (t) => t("permissions.createTitle", "Rugsat döretmek") },
                    element: page(PermissionCreatePage),
                  },
                  {
                    path: "/settings/users/permissions/:id",
                    handle: { title: (t) => t("permissions.viewTitle", "Rugsat giňişleýin") },
                    element: page(PermissionsViewPage),
                  },
                  {
                    path: "/settings/users/permissions/:id/edit",
                    handle: { title: (t) => t("permissions.editTitle", "Rugsat üýtgetmek") },
                    element: page(PermissionEditPage),
                  },
                ],
              },
              // Loan types
              {
                ...bc((t) => t("loanTypes.title", "Karz görnüşleri"), "/settings/loan/loan-types"),
                children: [
                  { path: "/settings/loan/loan-types", element: page(LoanTypesPage) },
                  {
                    path: "/settings/loan/loan-types/create",
                    handle: { title: (t) => t("loanTypes.createTitle", "Karz görnüşi döretmek") },
                    element: page(LoanTypeCreatePage),
                  },
                  {
                    path: "/settings/loan/loan-types/:id",
                    handle: { title: (t) => t("loanTypes.viewTitle", "Karz görnüşi giňişleýin") },
                    element: page(LoanTypesViewPage),
                  },
                  {
                    path: "/settings/loan/loan-types/:id/edit",
                    handle: { title: (t) => t("loanTypes.editTitle", "Karz görnüşi üýtgetmek") },
                    element: page(LoanTypeEditPage),
                  },
                ],
              },
              // Required documents
              {
                ...bc((t) => t("requiredDocuments.title", "Gerekli resminamalar"), "/settings/loan/required-documents"),
                children: [
                  { path: "/settings/loan/required-documents", element: page(RequiredDocumentsPage) },
                  {
                    path: "/settings/loan/required-documents/create",
                    handle: { title: (t) => t("requiredDocuments.createTitle", "Resminama döretmek") },
                    element: page(RequiredDocumentCreatePage),
                  },
                  {
                    path: "/settings/loan/required-documents/:id",
                    handle: { title: (t) => t("requiredDocuments.viewTitle", "Resminama giňişleýin") },
                    element: page(RequiredDocumentsViewPage),
                  },
                  {
                    path: "/settings/loan/required-documents/:id/edit",
                    handle: { title: (t) => t("requiredDocuments.editTitle", "Resminama üýtgetmek") },
                    element: page(RequiredDocumentEditPage),
                  },
                ],
              },
              // Card reasons
              {
                ...bc((t) => t("cardReasons.title", "Kart çykarylyş sebäpleri"), "/settings/card/card-reasons"),
                children: [
                  { path: "/settings/card/card-reasons", element: page(CardReasonsPage) },
                  {
                    path: "/settings/card/card-reasons/create",
                    handle: { title: (t) => t("cardReasons.createTitle", "Sebäp döretmek") },
                    element: page(CardReasonCreatePage),
                  },
                  {
                    path: "/settings/card/card-reasons/:id",
                    handle: { title: (t) => t("cardReasons.viewTitle", "Sebäp giňişleýin") },
                    element: page(CardReasonsViewPage),
                  },
                  {
                    path: "/settings/card/card-reasons/:id/edit",
                    handle: { title: (t) => t("cardReasons.editTitle", "Sebäp üýtgetmek") },
                    element: page(CardReasonEditPage),
                  },
                ],
              },
              // Card types
              {
                ...bc((t) => t("cardTypes.title", "Kart görnüşleri"), "/settings/card/card-types"),
                children: [
                  { path: "/settings/card/card-types", element: page(CardTypesPage) },
                  {
                    path: "/settings/card/card-types/create",
                    handle: { title: (t) => t("cardTypes.createTitle", "Kart görnüşi döretmek") },
                    element: page(CardTypeCreatePage),
                  },
                  {
                    path: "/settings/card/card-types/:id",
                    handle: { title: (t) => t("cardTypes.viewTitle", "Kart görnüşi giňişleýin") },
                    element: page(CardTypesViewPage),
                  },
                  {
                    path: "/settings/card/card-types/:id/edit",
                    handle: { title: (t) => t("cardTypes.editTitle", "Kart görnüşi üýtgetmek") },
                    element: page(CardTypeEditPage),
                  },
                ],
              },
              // Districts
              {
                ...bc((t) => t("districts.title", "Etraplar"), "/settings/location/districts"),
                children: [
                  { path: "/settings/location/districts", element: page(DistrictsPage) },
                  {
                    path: "/settings/location/districts/create",
                    handle: { title: (t) => t("districts.createTitle", "Etrap döretmek") },
                    element: page(DistrictCreatePage),
                  },
                  {
                    path: "/settings/location/districts/:id",
                    handle: { title: (t) => t("districts.viewTitle", "Etrap giňişleýin") },
                    element: page(DistrictsViewPage),
                  },
                  {
                    path: "/settings/location/districts/:id/edit",
                    handle: { title: (t) => t("districts.editTitle", "Etrap üýtgetmek") },
                    element: page(DistrictEditPage),
                  },
                ],
              },
              // Branches
              {
                ...bc((t) => t("branches.title", "Şahamçalar"), "/settings/location/branches"),
                children: [
                  { path: "/settings/location/branches", element: page(BranchesPage) },
                  {
                    path: "/settings/location/branches/create",
                    handle: { title: (t) => t("branches.createTitle", "Şahamça döretmek") },
                    element: page(BranchCreatePage),
                  },
                  {
                    path: "/settings/location/branches/:id",
                    handle: { title: (t) => t("branches.viewTitle", "Şahamça giňišleýin") },
                    element: page(BranchesViewPage),
                  },
                  {
                    path: "/settings/location/branches/:id/edit",
                    handle: { title: (t) => t("branches.editTitle", "Şahamça üýtgetmek") },
                    element: page(BranchEditPage),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes as RouteObject[]);