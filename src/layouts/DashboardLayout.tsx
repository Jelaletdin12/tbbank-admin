import React, { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import Icon from '@/assets/icon.svg'

// ─── Collapsible wrappers ──────────────────────────────────────────────────────

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsibleContent = CollapsiblePrimitive.Content

// ─── Types ────────────────────────────────────────────────────────────────────

type NavSubSubItem = { title: string; url: string }
type NavSubItem = { title: string; url?: string; items?: NavSubSubItem[] }
type NavItem = {
  title: string
  url?: string
  icon: React.ElementType
  items?: NavSubItem[]
}

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function isActiveItem(item: NavItem | NavSubItem, pathname: string): boolean {
  if ('url' in item && item.url && pathname === item.url) return true
  if (item.items) return item.items.some((c) => isActiveItem(c, pathname))
  return false
}

// ─── Sub-sub collapsible (3rd level) ──────────────────────────────────────────

function NavSubGroup({ subItem, pathname }: { subItem: NavSubItem; pathname: string }) {
  const active = subItem.items?.some((s) => pathname === s.url) ?? false
  const [open, setOpen] = useState(active)

  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center justify-between px-2 py-1.5 mt-1',
            'text-[10px] font-bold uppercase tracking-widest select-none',
            'text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors duration-150 rounded-sm',
          )}
        >
          <span>{subItem.title}</span>
          <ChevronRight
            size={10}
            className={cn('transition-transform duration-200', open && 'rotate-90')}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          'overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
        )}
      >
        <SidebarMenuSub className="border-l border-sidebar-border/50 ml-2 pl-2 mt-0.5 gap-0.5">
          {subItem.items?.map((item, i) => (
            <SidebarMenuSubItem key={i}>
              <SidebarMenuSubButton asChild isActive={pathname === item.url} size="sm">
                <Link to={item.url}>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Top-level collapsible nav item ──────────────────────────────────────────

function NavGroupItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const { state } = useSidebar() // 'expanded' | 'collapsed'
  const collapsed = state === 'collapsed'
  const active = isActiveItem(item, pathname)
  const [open, setOpen] = useState(active)

  useEffect(() => {
    if (active && !collapsed) setOpen(true)
  }, [active, collapsed])

  return (
    <Collapsible open={!collapsed && open} onOpenChange={(v) => !collapsed && setOpen(v)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={active} tooltip={item.title}>
            <item.icon />
            <span>{item.title}</span>
            <ChevronRight
              size={14}
              className={cn(
                'ml-auto shrink-0 transition-transform duration-200',
                'group-data-[collapsible=icon]:hidden', // hide when icon-only
                open && !collapsed && 'rotate-90',
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <SidebarMenuSub>
          {item.items?.map((subItem, i) => {
            if (subItem.items) {
              return <NavSubGroup key={i} subItem={subItem} pathname={pathname} />
            }
            return (
              <SidebarMenuSubItem key={i}>
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AppSidebar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

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
            { title: t('Certificates', 'Karzyň ýapylandygy barada güwanamalar'), url: '/loan-paid-off-letters' },
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
            { title: t('Required Documents', 'Gerekli resminamalar'), url: '/settings/loan/documents' },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo */}
      <SidebarHeader className="h-14 flex-row items-center px-4 border-b border-sidebar-border gap-2.5 overflow-hidden">
        <img className="h-8 w-8 shrink-0" src={Icon} alt="" />
        <span className="font-bold text-base tracking-tight text-sidebar-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden transition-opacity duration-200">
          TBBANK
        </span>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-3">
        <SidebarMenu className="gap-0.5">
          {navItems.map((item, i) => {
            // Leaf item
            if (!item.items) {
              return (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url ?? '#'}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return <NavGroupItem key={i} item={item} />
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <span className="text-[10px] text-sidebar-foreground/25 group-data-[collapsible=icon]:hidden">
          TBBANK v2.0
        </span>
        <span className="text-[10px] text-sidebar-foreground/25 hidden group-data-[collapsible=icon]:block text-center">
          v2
        </span>
      </SidebarFooter>
    </Sidebar>
  )
}

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
  const userMenuRef = useRef<HTMLDivElement>(null)
  const langMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setLangMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          const url = `/${paths.slice(0, index + 1).join('/')}`
          const formatted = path
            .replace(/-/g, ' ')
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
          const title = t(formatted, formatted)
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
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 gap-3">
      {/* Left: sidebar trigger + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {/*
          SidebarTrigger handles BOTH:
          - Desktop: toggles collapsed/expanded (collapsible="icon")
          - Mobile: opens the Sheet overlay
          No custom mobile hamburger needed.
        */}
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 transition-colors" />

        <div className="text-sm text-muted-foreground min-w-0 truncate">
          <Breadcrumb>{generateBreadcrumbs()}</Breadcrumb>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Language */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen((p) => !p)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe size={16} />
            <span className="uppercase font-medium text-xs hidden sm:block">{language}</span>
          </button>
          <div
            className={cn(
              'absolute right-0 mt-1.5 w-36 bg-popover border border-border rounded-lg shadow-lg py-1 z-50',
              'transition-all duration-150 origin-top-right',
              langMenuOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none',
            )}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setLangMenuOpen(false) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
                  language === lang.code ? 'text-primary font-medium' : 'text-foreground',
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
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full ring-1 ring-background" />
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 h-8 pl-2 pr-2.5 rounded-md hover:bg-accent transition-colors ml-1"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block max-w-[100px] truncate">
              {user?.name ?? 'Admin'}
            </span>
            <ChevronDown
              size={13}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                userMenuOpen && 'rotate-180',
              )}
            />
          </button>

          <div
            className={cn(
              'absolute right-0 mt-1.5 w-44 bg-popover border border-border rounded-lg shadow-lg py-1 z-50',
              'transition-all duration-150 origin-top-right',
              userMenuOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none',
            )}
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-medium text-foreground truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
            >
              {t('Logout', 'Çykmak')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DashboardHeader />

            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Outlet />
            </main>

            <div className="text-center text-[11px] text-muted-foreground/30 py-3 border-t border-border/50">
              © 2026 TBBANK.GOV.TM
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}