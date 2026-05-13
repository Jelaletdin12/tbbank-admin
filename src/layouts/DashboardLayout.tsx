import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/app/store/authStore";
import { useThemeStore } from "@/app/store/themeStore";
import { useI18nStore } from "@/app/store/i18nStore";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import {
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  DollarSign,
  CreditCard,
  Database,
  Globe,
  Terminal,
  ChevronRight,
  LogOut,
  ChevronsUpDown,
  User,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { cn } from "@/lib/utils";
import Icon from "@/assets/icon.svg";

// ─── Collapsible wrappers ──────────────────────────────────────────────────────

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
const CollapsibleContent = CollapsiblePrimitive.Content;

// ─── Types ────────────────────────────────────────────────────────────────────

type NavSubSubItem = { title: string; url: string };
type NavSubItem = { title: string; url?: string; items?: NavSubSubItem[] };
type NavItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  items?: NavSubItem[];
};
type NavGroup = {
  label?: string;
  items: NavItem[];
};

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function isActiveItem(item: NavItem | NavSubItem, pathname: string): boolean {
  if ("url" in item && item.url && pathname === item.url) return true;
  if (item.items) return item.items.some((c) => isActiveItem(c, pathname));
  return false;
}

// ─── Sub-sub collapsible (3rd level) ──────────────────────────────────────────

function NavSubGroup({
  subItem,
  pathname,
}: {
  subItem: NavSubItem;
  pathname: string;
}) {
  const active = subItem.items?.some((s) => pathname === s.url) ?? false;
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between px-2 py-1 mt-1",
            "text-[10px] font-semibold uppercase tracking-widest select-none",
            "text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors duration-150 rounded-sm",
          )}
        >
          <span>{subItem.title}</span>
          <ChevronRight
            size={10}
            className={cn(
              "transition-transform duration-200",
              open && "rotate-90",
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <SidebarMenuSub className="border-l-2 border-sidebar-border/40 ml-3 pl-2 mt-0.5 gap-0">
          {subItem.items?.map((item, i) => (
            <SidebarMenuSubItem key={i}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname === item.url}
                size="sm"
                className={cn(
                  "rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                  "data-[active=true]:text-sidebar-foreground data-[active=true]:font-medium data-[active=true]:bg-sidebar-accent",
                )}
              >
                <Link to={item.url}>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Top-level collapsible nav item ──────────────────────────────────────────

function NavGroupItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const active = isActiveItem(item, pathname);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active && !collapsed) setOpen(true);
  }, [active, collapsed]);

  return (
    <Collapsible
      open={!collapsed && open}
      onOpenChange={(v) => !collapsed && setOpen(v)}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={active}
            tooltip={item.title}
            className={cn(
              "group/btn rounded-md font-medium",
              "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/70",
              "data-[active=true]:text-sidebar-foreground data-[active=true]:bg-sidebar-accent",
            )}
          >
            <item.icon
              className={cn("shrink-0", active && "text-sidebar-primary")}
            />
            <span>{item.title}</span>
            <ChevronRight
              size={14}
              className={cn(
                "ml-auto shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
                "group-data-[collapsible=icon]:hidden",
                open && !collapsed && "rotate-90",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <SidebarMenuSub className="border-l-2 border-sidebar-border/40 ml-3 pl-2 mt-0.5 gap-0">
          {item.items?.map((subItem, i) => {
            if (subItem.items) {
              return (
                <NavSubGroup key={i} subItem={subItem} pathname={pathname} />
              );
            }
            return (
              <SidebarMenuSubItem key={i}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.url}
                  className={cn(
                    "rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                    "data-[active=true]:text-sidebar-foreground data-[active=true]:font-medium data-[active=true]:bg-sidebar-accent",
                  )}
                >
                  <Link to={subItem.url ?? "#"}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Nav Group Label ──────────────────────────────────────────────────────────

function NavGroupLabel({ label }: { label: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (collapsed) {
    return <div className="my-1 h-px bg-sidebar-border/50" />;
  }

  return (
    <div className="px-2 pb-1 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none">
        {label}
      </p>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AppSidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.clearAuth);

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          title: t("Dashboard", "Baş sahypa"),
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t("Operations", "Operasiýalar"),
      items: [
        {
          title: t("Orders", "Sargytlar"),
          icon: FileText,
          items: [
            {
              title: t("Loan department", "Karz bölümi"),
              items: [
                {
                  title: t("Loan orders", "Karz sargytlary"),
                  url: "/loan-orders",
                },
                {
                  title: t("Loan order (Mobile)", "Karz sargyt (Mobile)"),
                  url: "/loan-order-mobiles",
                },
                {
                  title: t("Loan balance", "Karzyň galyndysy"),
                  url: "/loan-remaining",
                },
                {
                  title: t("Certificates", "Güwanamalar"),
                  url: "/loan-paid-off-letters",
                },
              ],
            },
            {
              title: t("Card department", "Kart bölümi"),
              items: [
                {
                  title: t("Order new card", "Täze kart açmak"),
                  url: "/order-new-card",
                },
                {
                  title: t("Card transactions", "Kart hereketleri"),
                  url: "/card-transactions",
                },
                {
                  title: t("Card requisites", "Kart rekwizitler"),
                  url: "/card-requisites",
                },
                {
                  title: t("Card balances", "Kart galyndylary"),
                  url: "/card-balances",
                },
                {
                  title: t("Card pins", "Kart pin bukjalar"),
                  url: "/card-pins",
                },
              ],
            },
            {
              title: t("International payments", "Halkara tölegler"),
              items: [
                {
                  title: t("Visa/Master payments", "Visa/Master tölegleri"),
                  url: "/visa-master",
                },
                {
                  title: t("Sber payments", "Sber tölegleri"),
                  url: "/sber-payments",
                },
              ],
            },
          ],
        },
        {
          title: t("Users", "Ulanyjylar"),
          icon: Users,
          items: [
            { title: t("Operators", "Operatorlar"), url: "/operators" },
            { title: t("Clients", "Müşderiler"), url: "/clients" },
            { title: t("All users", "Ähli ulanyjylar"), url: "/all-users" },
          ],
        },
        {
          title: t("Currencies", "Walýutalar"),
          icon: DollarSign,
          items: [
            {
              title: t("Currency rates", "Walýuta kurslary"),
              url: "/currency-rates",
            },
            {
              title: t(
                "Visa/Master, Sber Settings",
                "Visa/Master, Sber sazlamalary",
              ),
              url: "/visa-master-sber-settings",
            },
          ],
        },
        {
          title: t("Online payment history", "Onlaýn töleg taryhy"),
          url: "/online-payments-history",
          icon: CreditCard,
        },
      ],
    },
    {
      label: t("System", "Ulgam"),
      items: [
        {
          title: t("Settings", "Sazlamalar"),
          icon: Settings,
          items: [
            {
              title: t("Users", "Ulanyjylar"),
              items: [
                { title: t("Roles", "Rollar"), url: "/settings/users/roles" },
                {
                  title: t("Permissions", "Rugsatlar"),
                  url: "/settings/users/permissions",
                },
              ],
            },
            {
              title: t("Loan", "Karz"),
              items: [
                {
                  title: t("Loan types", "Karz görnüşleri"),
                  url: "/settings/loan/loan-types",
                },
                {
                  title: t("Required Documents", "Gerekli resminamalar"),
                  url: "/settings/loan/required-documents",
                },
              ],
            },
            {
              title: t("Card", "Kart"),
              items: [
                {
                  title: t(
                    "Card Issuance Reasons",
                    "Kartyň çykarylmagynyň sebäpleri",
                  ),
                  url: "/settings/card/card-reasons",
                },
                {
                  title: t("Card types", "Kart görnüşleri"),
                  url: "/settings/card/card-types",
                },
              ],
            },
            {
              title: t("Location", "Lokasiýa"),
              items: [
                {
                  title: t("Provinces", "Etraplar"),
                  url: "/settings/location/districts",
                },
                {
                  title: t("Branches", "Şahamçalar"),
                  url: "/settings/location/branches",
                },
              ],
            },
            {
              title: t("Language", "Dil"),
              items: [
                {
                  title: t("Locale Manager", "Locale Manager"),
                  url: "/settings/language/locale-manager",
                },
                {
                  title: t("Resources", "Resources"),
                  url: "/settings/language/resources",
                },
              ],
            },
          ],
        },
        {
          title: t("Backups", "Bekaplar"),
          url: "/backups",
          icon: Database,
        },
        {
          title: t("Logs", "Loglar"),
          url: "/logs",
          icon: Terminal,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="h-14 flex-row items-center px-3 gap-2.5 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
          <img className="h-5 w-5" src={Icon} alt="" />
        </div>
        <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-semibold text-sm tracking-tight text-sidebar-foreground">
            TBBANK
          </span>
          <span className="truncate text-[10px] text-sidebar-foreground/40">
            Admin Panel v2.0
          </span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-2">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && <NavGroupLabel label={group.label} />}
            <SidebarMenu className="gap-0.5">
              {group.items.map((item, i) => {
                if (!item.items) {
                  return (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className={cn(
                          "rounded-md font-medium",
                          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/70",
                          "data-[active=true]:text-sidebar-foreground data-[active=true]:bg-sidebar-accent",
                        )}
                      >
                        <Link to={item.url ?? "#"}>
                          <item.icon
                            className={cn(
                              "shrink-0",
                              pathname === item.url && "text-sidebar-primary",
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return <NavGroupItem key={i} item={item} />;
              })}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      {/* Footer — user block */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Collapsible>
          {/* Items — trigger'dan ÖNCE render edilir, yukarı doğru açılır */}
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="mb-1 rounded-lg  py-1 group-data-[collapsible=icon]:hidden">
              <div className="px-3 py-2 border-b border-sidebar-border/50 mb-1">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                  {user?.name ?? "Admin"}
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/40">
                  {user?.email ?? ""}
                </p>
              </div>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-sidebar-accent/10 transition-colors">
                <User size={14} />
                <span>My profile</span>
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </CollapsibleContent>

          {/* Trigger — profil butonu */}
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground",
                "hover:bg-sidebar-accent/70 transition-colors",
              )}
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary text-xs font-semibold">
                {(user?.name ?? "A").charAt(0).toUpperCase()}
              </div>
              {/* Name + email */}
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.name ?? "Admin"}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/40">
                  {user?.email ?? ""}
                </span>
              </div>
              <ChevronsUpDown
                size={14}
                className="ml-auto shrink-0 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </Collapsible>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DashboardHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useI18nStore();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      )
        setLangMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const languages = [
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
    { code: "tk", label: "Türkmençe" },
  ] as const;

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    if (
      paths.length === 0 ||
      (paths.length === 1 && paths[0] === "dashboard")
    ) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("Dashboard", "Baş sahypa")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      );
    }
    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const url = `/${paths.slice(0, index + 1).join("/")}`;
          const formatted = path
            .replace(/-/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          const title = t(formatted, formatted);
          return (
            <React.Fragment key={url}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={url}>{title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    );
  };

  return (
    <header className="h-16 border-b border-border rounded-t-md bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 transition-colors" />
        <div className="hidden sm:block w-px h-4 bg-border/60" />
        <div className="text-sm text-muted-foreground min-w-0 truncate">
          <Breadcrumb>{generateBreadcrumbs()}</Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Language */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen((p) => !p)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe size={15} />
            <span className="uppercase font-medium text-xs hidden sm:block">
              {language}
            </span>
          </button>
          <div
            className={cn(
              "absolute right-0 mt-1.5 w-36 bg-popover border border-border rounded-lg shadow-lg py-1 z-50",
              "transition-all duration-150 origin-top-right",
              langMenuOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none",
            )}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setLangMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                  language === lang.code
                    ? "text-primary font-medium"
                    : "text-foreground",
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full ring-1 ring-background" />
        </button>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex  w-full  text-foreground ">
          <AppSidebar />

          <div className="flex-1 p-2 flex bg-sidebar flex-col min-w-0">
            <DashboardHeader />

            <main className="flex-1 p-4 rounded-b-md mb-1  bg-background">
              <Outlet />
            </main>

            <div className="text-center text-[11px] text-muted-foreground/30 py-3 ">
              © 2026 TBBANK.GOV.TM
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
