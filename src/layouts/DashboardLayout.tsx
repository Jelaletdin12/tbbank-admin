import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/app/store/authStore'
import { useThemeStore } from '@/app/store/themeStore'
import { useI18nStore } from '@/app/store/i18nStore'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
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
} from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import Icon from "@/assets/icon.svg"

// ─── Collapsible wrappers ──────────────────────────────────────────────────────

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsibleContent = CollapsiblePrimitive.Content

// ─── Header ───────────────────────────────────────────────────────────────────

function DashboardHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useI18nStore()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.clearAuth)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'tk', label: 'Türkmençe' },
  ] as const

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('Dashboard', 'Baş sahypa')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }

    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Dashboards</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          const url = `/${paths.slice(0, index + 1).join('/')}`
          const formattedPath = path
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          const title = t(formattedPath, formattedPath)

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
          )
        })}
      </BreadcrumbList>
    )
  }

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Breadcrumb>{generateBreadcrumbs()}</Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle language"
          >
            <Globe size={18} />
            <span className="text-sm font-medium uppercase">{language}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-md shadow-md py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setLangMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                    language === lang.code
                      ? 'text-primary font-medium bg-accent/50'
                      : 'text-foreground'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-accent py-1.5 px-3 rounded-md transition-colors"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <span className="text-sm font-medium text-foreground">{user?.name || 'Admin'}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-md py-1 z-50">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
              >
                {t('Logout', 'Çykmak')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type NavSubSubItem = { title: string; url: string }
type NavSubItem = { title: string; url?: string; items?: NavSubSubItem[] }
type NavItem = { title: string; url?: string; icon: React.ElementType; items?: NavSubItem[] }

/**
 * Checks if a nav item (or any of its children) matches the current path.
 */
function isNavItemActive(item: NavItem | NavSubItem, pathname: string): boolean {
  if ('url' in item && item.url) {
    if (pathname === item.url) return true
  }
  if (item.items) {
    return item.items.some((child) => isNavItemActive(child, pathname))
  }
  return false
}

/**
 * Sub-sub-level collapsible: renders a category header (non-link)
 * with its leaf link items inside a Radix Collapsible.
 *
 * Using Radix Collapsible instead of Accordion eliminates the
 * --radix-accordion-content-height measurement bug that causes
 * nested accordions to show incorrect heights.
 */
function NavSubGroup({
  subItem,
  pathname,
}: {
  subItem: NavSubItem
  pathname: string
}) {
  const isActive = subItem.items?.some((s) => pathname === s.url) ?? false
  const [open, setOpen] = useState(isActive)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'group flex w-full items-center justify-between px-2 py-1.5',
            'text-xs font-semibold uppercase tracking-wider',
            'text-sidebar-foreground/60 hover:text-sidebar-foreground',
            'transition-colors rounded-sm',
          )}
        >
          <span>{subItem.title}</span>
          <ChevronRight
            size={12}
            className={cn('transition-transform duration-200', open && 'rotate-90')}
          />
        </button>
      </CollapsibleTrigger>

      {/* No overflow:hidden animation — content renders at natural height */}
      <CollapsibleContent>
        <SidebarMenuSub className="border-l-0 pl-2 pr-0 mt-0">
          {subItem.items?.map((subSubItem, i) => (
            <SidebarMenuSubItem key={i}>
              <SidebarMenuSubButton asChild isActive={pathname === subSubItem.url} size='sm'>
                <Link to={subSubItem.url}>
                  <span>{subSubItem.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * Top-level nav item that has children (both sub-groups and direct links).
 */
function NavGroupItem({ item }: { item: NavItem }) {
  const pathname = useLocation().pathname
  const isActive = isNavItemActive(item, pathname)
  const [open, setOpen] = useState(isActive)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton  isActive={isActive} tooltip={item.title}>
            <item.icon />
            <span>{item.title}</span>
            <ChevronRight
              size={12}
              className={cn(
                'ml-auto transition-transform duration-200',
                open && 'rotate-90',
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem, subIndex) => {
            // Sub-item has further children → render as collapsible group
            if (subItem.items) {
              return (
                <NavSubGroup key={subIndex} subItem={subItem} pathname={pathname} />
              )
            }

            // Sub-item is a direct link
            return (
              <SidebarMenuSubItem key={subIndex}>
                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                  <Link to={subItem.url ?? '#'}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

function AppSidebar() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems: NavItem[] = [
    {
      title: t('Dashboard', 'Baş sahypa'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('Orders', 'Sargytlar'),
      icon: FileText,
      items: [
        {
          title: t('Loan department', 'KARZ BÖLÜMI'),
          items: [
            { title: t('Loan orders', 'Karz sargytlary'), url: '/loan-orders' },
            { title: t('Loan order (Mobile)', 'Karz sargyt (Mobile)'), url: '/loan-order-mobiles' },
            { title: t('Loan balance', 'Karzyň galyndysy'), url: '/loan-remaining' },
            { title: t('Certificates of loan repayment', 'Karzyň ýapylandygy barada güwanamalar'), url: '/loan-paid-off-letters' },
          ],
        },
        {
          title: t('Card department', 'KART BÖLÜMI'),
          items: [
            { title: t('Order new card', 'Täze kart açmak'), url: '/card-new' },
            { title: t('Card transactions', 'Kart hereketleri'), url: '/card-transactions' },
            { title: t('Card requisites', 'Kart rekwizitler'), url: '/card-requisites' },
            { title: t('Card balances', 'Kart galyndylary'), url: '/card-balances' },
            { title: t('Card pins', 'Kart pin bukjalar'), url: '/card-pins' },
          ],
        },
        {
          title: t('International payments', 'HALKARA TÖLEGLER'),
          items: [
            { title: t('Visa/Master payments', 'Visa/Master tölegleri'), url: '/intl-payments/visa-master' },
            { title: t('Sber payments', 'Sber tölegleri'), url: '/intl-payments/sber' },
          ],
        },
      ],
    },
    {
      title: t('Users', 'Ulanyjylar'),
      icon: Users,
      items: [
        { title: t('Operators', 'Operatorlar'), url: '/users/operators' },
        { title: t('Clients', 'Müşderiler'), url: '/users/clients' },
        { title: t('All users', 'Ähli ulanyjylar'), url: '/users/all' },
      ],
    },
    {
      title: t('Settings', 'Sazlamalar'),
      icon: Settings,
      items: [
        {
          title: t('Users', 'ULANYJYLAR'),
          items: [
            { title: t('Roles', 'Rollar'), url: '/settings/users/roles' },
            { title: t('Permissions', 'Rugsatlar'), url: '/settings/users/permissions' },
          ],
        },
        {
          title: t('Loan', 'KARZ'),
          items: [
            { title: t('Loan types', 'Karz görnüşleri'), url: '/settings/loan/types' },
            { title: t('Required Documents', 'Karz gerekli resminamalary'), url: '/settings/loan/documents' },
          ],
        },
        {
          title: t('Card', 'KART'),
          items: [
            { title: t('Card Issuance Reasons', 'Kartyň çykarylmagynyň sebäpleri'), url: '/settings/card/reasons' },
            { title: t('Card types', 'Kart görnüşleri'), url: '/settings/card/types' },
          ],
        },
        {
          title: t('Location', 'LOKASIÝA'),
          items: [
            { title: t('Provinces', 'Etraplar'), url: '/settings/location/districts' },
            { title: t('Branches', 'Şahamçalar'), url: '/settings/location/branches' },
          ],
        },
        {
          title: t('Language', 'DIL'),
          items: [
            { title: t('Locale Manager', 'Locale Manager'), url: '/settings/language/locale-manager' },
            { title: t('Resources', 'Resources'), url: '/settings/language/resources' },
          ],
        },
      ],
    },
    {
      title: t('Currencies', 'Walýutalar'),
      icon: DollarSign,
      items: [
        { title: t('Currency rates', 'Walýuta kurslary'), url: '/currencies/rates' },
        { title: t('Visa/Master, Sber Settings', 'Visa/Master, Sber sazlamalary'), url: '/currencies/settings' },
      ],
    },
    {
      title: t('Online payment history', 'Onlaýn töleg taryhy'),
      url: '/online-payments',
      icon: CreditCard,
    },
    {
      title: t('Backups', 'Bekaplar'),
      url: '/backups',
      icon: Database,
    },
    {
      title: t('Logs', 'Loglar'),
      url: '/logs',
      icon: Terminal,
    },
  ]

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-bold text-lg text-sidebar-primary">
          <img className='h-10' src={Icon} alt="" />
          <span>TBBANK</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="mt-4 gap-1 px-2 text-sm">
          {navItems.map((item, index) => {
            // Leaf item (no children)
            if (!item.items) {
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className='text-sm'
                  >
                    <Link to={item.url ?? '#'}>
                      <item.icon />
                      <span className='text-sm'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return <NavGroupItem key={index} item={item}  />
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground/40 pt-2 pb-6">
              © 2026 TBBANK.GOV.TM.
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}