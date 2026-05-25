import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CreditCard,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const areaData = [
  { month: "Ýan", loans: 420, cards: 240 },
  { month: "Few", loans: 380, cards: 290 },
  { month: "Mar", loans: 510, cards: 310 },
  { month: "Apr", loans: 470, cards: 280 },
  { month: "Maý", loans: 630, cards: 390 },
  { month: "Iýun", loans: 580, cards: 420 },
  { month: "Iýul", loans: 720, cards: 460 },
  { month: "Awg", loans: 690, cards: 500 },
  { month: "Sen", loans: 810, cards: 530 },
  { month: "Okt", loans: 760, cards: 480 },
  { month: "Noý", loans: 890, cards: 560 },
  { month: "Dek", loans: 950, cards: 610 },
];

const barData = [
  { day: "Du", approved: 28, rejected: 4 },
  { day: "Si", approved: 35, rejected: 6 },
  { day: "Ça", approved: 22, rejected: 3 },
  { day: "Pe", approved: 41, rejected: 8 },
  { day: "An", approved: 33, rejected: 5 },
  { day: "Şe", approved: 18, rejected: 2 },
  { day: "Ýe", approved: 12, rejected: 1 },
];

const pieData = [
  { name: "Kanagatlandyrylan", value: 6746, key: "approved" },
  { name: "Garaşylýar",        value: 208,  key: "pending" },
  { name: "Işlenilýär",        value: 157,  key: "processing" },
  { name: "Ýatyrylan",         value: 245,  key: "rejected" },
  { name: "Bellige alyndy",    value: 450,  key: "registered" },
];

const recentActivity = [
  { id: "#KS-2841", name: "Serdar Annagurban",  amount: "12 500 TMT", status: "approved", time: "2 min öň" },
  { id: "#KS-2840", name: "Aýgül Myradowa",     amount: "8 000 TMT",  status: "pending",  time: "14 min öň" },
  { id: "#KS-2839", name: "Kakajan Durdyýew",   amount: "25 000 TMT", status: "approved", time: "31 min öň" },
  { id: "#KS-2838", name: "Ogulgerek Sähedowa", amount: "5 500 TMT",  status: "rejected", time: "1 sa öň" },
  { id: "#KS-2837", name: "Merdan Hojamyradow", amount: "18 000 TMT", status: "approved", time: "2 sa öň" },
];

// ─── Chart configs ────────────────────────────────────────────────────────────

const areaConfig = {
  loans: { label: "Karzlar", color: "var(--chart-1)" },
  cards: { label: "Kartlar", color: "var(--chart-2)" },
} satisfies Record<string, { label: string; color: string }>;

const barConfig = {
  approved: { label: "Tassyklanan", color: "var(--chart-1)" },
  rejected: { label: "Ýatyryldy",  color: "var(--chart-5)" },
} satisfies Record<string, { label: string; color: string }>;

const pieConfig = {
  approved:   { label: "Kanagatlandyrylan", color: "var(--chart-2)" },
  pending:    { label: "Garaşylýar",        color: "var(--chart-4)" },
  processing: { label: "Işlenilýär",        color: "var(--chart-1)" },
  rejected:   { label: "Ýatyrylan",         color: "var(--chart-5)" },
  registered: { label: "Bellige alyndy",    color: "var(--chart-3)" },
} satisfies Record<string, { label: string; color: string }>;

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, change, icon: Icon, accent,
}: {
  title: string
  value: string
  change: number
  icon: React.ElementType
  accent: string
}) {
  const positive = change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accent)}>
          <Icon size={16} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className={cn(
          "mt-1 flex items-center gap-1 text-xs font-medium",
          positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
        )}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change)}% geçen aýa garanyňda
        </p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-36" />
      </CardContent>
    </Card>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100",
    pending:  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 hover:bg-amber-100",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 hover:bg-red-100",
  };
  const labels: Record<string, string> = {
    approved: "Tassyklandy",
    pending:  "Garaşylýar",
    rejected: "Ýatyryldy",
  };
  return (
    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", styles[status])}>
      {labels[status]}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage({ isLoading = false }: { isLoading?: boolean }) {
  const { t } = useTranslation();
  const total = pieData.reduce((s, d) => s + d.value, 0);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full flex flex-col justify-end relative">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between pb-6">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-2.5 w-6" />)}
                </div>
                <div className="ml-8 flex-1 relative overflow-hidden rounded-md">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="ml-8 mt-2 flex justify-between">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-2.5 w-6" />)}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pie chart skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-[160px] w-full flex items-center justify-center">
                <div className="relative h-[144px] w-[144px]">
                  <Skeleton className="h-full w-full rounded-full" />
                  <div className="absolute inset-0 m-auto h-[96px] w-[96px] rounded-full bg-card" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-1.5 w-1.5 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex flex-col justify-end relative">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between pb-6">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-2.5 w-6" />)}
                </div>
                <div className="ml-8 flex items-end justify-between gap-1.5 h-[148px]">
                  {[65, 85, 50, 95, 75, 40, 30].map((h, i) => (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                      <Skeleton className="flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
                      <Skeleton className="flex-1 rounded-t-sm" style={{ height: `${h * 0.15}%` }} />
                    </div>
                  ))}
                </div>
                <div className="ml-8 mt-2 flex justify-between">
                  {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-2.5 w-4" />)}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                {[12, 14].map((w, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className={`h-3 w-${w}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-4 w-12" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="text-right space-y-1.5 shrink-0">
                      <Skeleton className="h-3.5 w-20 ml-auto" />
                      <Skeleton className="h-4 w-16 ml-auto rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("Dashboard", "Baş sahypa")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("Overview of all operations", "Ähli amallaryň gysgaça görünüşi")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("Loan orders", "Karz sargytlary")}    value="2 841" change={12.4}  icon={FileText}   accent="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
        <StatCard title={t("Active cards", "Işjeň kartlar")}      value="6 968" change={5.1}   icon={CreditCard} accent="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400" />
        <StatCard title={t("Active clients", "Işjeň müşderiler")} value="1 204" change={-3.2}  icon={Users}      accent="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" />
        <StatCard title={t("Online payments", "Onlaýn tölegler")} value="438"   change={18.7}  icon={DollarSign} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
      </div>

      {/* Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("Loan & card trend", "Karz we kart tendensiýasy")}</CardTitle>
            <CardDescription>2024 — ýyllyk görünüş</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaConfig} className="h-[220px] w-full">
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-loans)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-loans)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillCards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-cards)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-cards)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="loans" stroke="var(--color-loans)" strokeWidth={2} fill="url(#fillLoans)" dot={false} />
                <Area type="monotone" dataKey="cards" stroke="var(--color-cards)" strokeWidth={2} fill="url(#fillCards)" dot={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Loan status", "Karz ýagdaýy")}</CardTitle>
            <CardDescription>{total.toLocaleString()} jemi sargyt</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="h-[160px] w-full">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" nameKey="name" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={`var(--color-${entry.key})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-3 space-y-1.5">
              {pieData.map((d) => (
                <div key={d.key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: `var(--color-${d.key})` }} />
                    {d.name}
                  </span>
                  <span className="font-medium tabular-nums">
                    {((d.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Weekly orders", "Hepdelik sargytlar")}</CardTitle>
            <CardDescription>{t("Last 7 days", "Soňky 7 gün")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[180px] w-full">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="rejected"  fill="var(--color-rejected)"  radius={[4, 4, 0, 0]} maxBarSize={20} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>{t("Recent activity", "Soňky hereketler")}</CardTitle>
              <CardDescription className="mt-0.5">
                {t("Latest loan orders", "Iň soňky karz sargytlary")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity size={12} />
              <span>Janly</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.id} · {item.time}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-sm font-medium tabular-nums">{item.amount}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}