import apiClient from "@/lib/api/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoanRemaining {
  id: number;
  passportSeries: string;
  passportNumber: string;
  loanAccount: string;
}

export type LoanRemainingPayload = Omit<LoanRemaining, "id">;

export interface LoanRemainingListParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const USE_MOCK = true;

const MOCK_DATA: LoanRemaining[] = [
  { id: 1, passportSeries: "TM", passportNumber: "A111111", loanAccount: "NOVA-2024-001" },
  { id: 2, passportSeries: "TM", passportNumber: "B222222", loanAccount: "NOVA-2024-002" },
  { id: 3, passportSeries: "TM", passportNumber: "C333333", loanAccount: "NOVA-2023-078" },
  { id: 4, passportSeries: "TM", passportNumber: "D444444", loanAccount: "NOVA-2023-079" },
  { id: 5, passportSeries: "TM", passportNumber: "E555555", loanAccount: "NOVA-2024-033" },
  { id: 6, passportSeries: "TM", passportNumber: "F666666", loanAccount: "NOVA-2024-034" },
  { id: 7, passportSeries: "TM", passportNumber: "G777777", loanAccount: "NOVA-2024-051" },
  { id: 8, passportSeries: "TM", passportNumber: "H888888", loanAccount: "NOVA-2024-052" },
  { id: 9, passportSeries: "TM", passportNumber: "I999999", loanAccount: "NOVA-2024-063" },
  { id: 10, passportSeries: "TM", passportNumber: "J000000", loanAccount: "NOVA-2024-064" },
];

function applyMockFilters(params: LoanRemainingListParams): PaginatedResponse<LoanRemaining> {
  let result = [...MOCK_DATA];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.passportNumber.toLowerCase().includes(q) || r.loanAccount.toLowerCase().includes(q));
  }

  const total = result.length;
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 25;
  const start = (page - 1) * perPage;

  return { data: result.slice(start, start + perPage), total };
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function fetchLoanRemaining(params: LoanRemainingListParams): Promise<PaginatedResponse<LoanRemaining>> {
  if (USE_MOCK) return applyMockFilters(params);

  const { data } = await apiClient.get<PaginatedResponse<LoanRemaining>>("/nova-loan-remaining-orders", { params });
  return data;
}

export async function deleteLoanRemaining(id: number): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_DATA.findIndex((r) => r.id === id);
    if (idx !== -1) MOCK_DATA.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/nova-loan-remaining-orders/${id}`);
}

export async function fetchLoanRemainingById(id: number): Promise<LoanRemaining> {
  if (USE_MOCK) {
    const item = MOCK_DATA.find((r) => r.id === id);
    if (!item) throw new Error("Not found");
    return item;
  }
  const { data } = await apiClient.get<LoanRemaining>(`/nova-loan-remaining-orders/${id}`);
  return data;
}

export async function createLoanRemaining(payload: LoanRemainingPayload): Promise<LoanRemaining> {
  if (USE_MOCK) {
    const newItem: LoanRemaining = {
      id: Math.max(0, ...MOCK_DATA.map((d) => d.id)) + 1,
      ...payload,
    };
    MOCK_DATA.unshift(newItem);
    return newItem;
  }
  const { data } = await apiClient.post<LoanRemaining>("/nova-loan-remaining-orders", payload);
  return data;
}

export async function updateLoanRemaining(id: number, payload: LoanRemainingPayload): Promise<LoanRemaining> {
  if (USE_MOCK) {
    const idx = MOCK_DATA.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Not found");
    const updated = { ...MOCK_DATA[idx], ...payload };
    MOCK_DATA[idx] = updated;
    return updated;
  }
  const { data } = await apiClient.put<LoanRemaining>(`/nova-loan-remaining-orders/${id}`, payload);
  return data;
}
