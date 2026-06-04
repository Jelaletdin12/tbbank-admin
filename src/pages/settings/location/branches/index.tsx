import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { DeleteDialog } from "@/components/deleteDialog";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import type { FilterField, ActiveFilter } from "@/components/dataTableToolbar";
import { useBranches, useDeleteBranch } from "@/features/branches/hooks/useBranches";
import type { Branch } from "@/features/branches/api/branchesApi";
import { getDistrictOptions } from "@/features/branches/api/branchesApi";

export function BranchesListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const lang = (i18n.language?.slice(0, 2) ?? "tk") as "tk" | "ru" | "en";

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { fieldId: "isActive", value: "" },
    { fieldId: "districtId", value: "" },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(["id", "code", "name", "districtName", "phone", "isActive", "actions"]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = useDeleteBranch();
  const isActiveFilter = activeFilters.find((f) => f.fieldId === "isActive")?.value ?? "";
  const districtIdFilter = activeFilters.find((f) => f.fieldId === "districtId")?.value ?? "";

  const { data, isLoading } = useBranches({ page, perPage, search, isActive: isActiveFilter, districtId: districtIdFilter });

  const districtOptions = getDistrictOptions().map((d) => ({
    value: String(d.id),
    label: d.name[lang],
  }));

  const filterFields: FilterField[] = [
    {
      id: "isActive",
      label: t("branches.fields.isActive", "Işjeň"),
      options: [
        { value: "true", label: t("common.active", "Işjeň") },
        { value: "false", label: t("common.inactive", "Işjeň däl") },
      ],
    },
    {
      id: "districtId",
      label: t("branches.fields.district", "Etrap"),
      options: districtOptions,
    },
  ];

  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)));
    setPage(1);
  };

  const handleFilterReset = () => {
    setActiveFilters([
      { fieldId: "isActive", value: "" },
      { fieldId: "districtId", value: "" },
    ]);
    setPage(1);
  };

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      cell: ({ row }) => <span className="text-primary font-mono text-sm font-medium">{row.original.id}</span>,
      size: 70,
    },
    {
      accessorKey: "code",
      id: "code",
      header: t("branches.fields.code", "KOD").toUpperCase(),
      cell: ({ row }) => <span className="text-sm font-mono text-foreground">{row.original.code}</span>,
      size: 100,
    },
    {
      accessorKey: "name",
      id: "name",
      header: t("branches.fields.name", "ADY").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.name[lang]}</span>,
    },
    {
      accessorKey: "districtName",
      id: "districtName",
      header: t("branches.fields.district", "ETRAP").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.districtName[lang]}</span>,
    },
    {
      accessorKey: "phone",
      header: t("branches.fields.phone", "TELEFON").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.phone}</span>,
      size: 150,
    },
    {
      accessorKey: "isActive",
      id: "isActive",
      header: t("branches.fields.isActive", "IŞJEŇ").toUpperCase(),
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-destructive" />
        ),
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TableActions
          onView={() => navigate(`/settings/location/branches/${row.original.id}`)}
          onEdit={() => navigate(`/settings/location/branches/${row.original.id}/edit`)}
          onDelete={() => setDeleteId(row.original.id)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 120,
    },
  ];

  const columnMeta = columns
    .filter((c) => c.id !== "actions" && (c as { accessorKey?: string }).accessorKey !== undefined)
    .map((c) => ({
      id: (c.id ?? (c as { accessorKey?: string }).accessorKey) as string,
      label: typeof c.header === "string" ? c.header : (c.id ?? (c as { accessorKey?: string }).accessorKey ?? ""),
    }));

  const totalPages = data ? Math.ceil(data.total / perPage) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("branches.title", "Şahamçalar")}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("common.search", "Gözlemek")}
        />
        <CreateButton
          label={t("branches.actions.create", "Şahamça döret")}
          onClick={() => navigate("/settings/location/branches/create")}
        />
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          hideSearch
          hideAction
        />

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          enableRowSelection
          getRowId={(row) => String(row.id)}
          currentPage={page}
          totalPages={totalPages}
          totalCount={data?.total}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("common.confirmDelete", "Öçürmegi tassyklaň")}
        description={t("branches.deleteConfirm", "Bu şahamçany öçürmek isleýärsiňizmi?")}
        onConfirm={() => {
          if (deleteId !== null) {
            deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BranchesListPage;
