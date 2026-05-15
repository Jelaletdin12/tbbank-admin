import apiClient from "@/lib/api/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoanPaidOffLetter {
  id: number;
  passportSeries: string;
  passportNumber: string;
  loanAccount: string;
  issuedAt: string;
}

export interface LoanPaidOffLetterListParams {
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

const MOCK_DATA: LoanPaidOffLetter[] = [
  { id: 1, passportSeries: "TM", passportNumber: "A123456", loanAccount: "LOAN-2024-001", issuedAt: "2025-01-10" },
  { id: 2, passportSeries: "TM", passportNumber: "B234567", loanAccount: "LOAN-2024-002", issuedAt: "2025-01-14" },
  { id: 3, passportSeries: "TM", passportNumber: "C345678", loanAccount: "LOAN-2024-003", issuedAt: "2025-01-17" },
  { id: 4, passportSeries: "TM", passportNumber: "D456789", loanAccount: "LOAN-2023-115", issuedAt: "2025-01-20" },
  { id: 5, passportSeries: "TM", passportNumber: "E567890", loanAccount: "LOAN-2023-116", issuedAt: "2025-01-23" },
  { id: 6, passportSeries: "TM", passportNumber: "F678901", loanAccount: "LOAN-2024-044", issuedAt: "2025-01-27" },
  { id: 7, passportSeries: "TM", passportNumber: "G789012", loanAccount: "LOAN-2024-055", issuedAt: "2025-02-01" },
  { id: 8, passportSeries: "TM", passportNumber: "H890123", loanAccount: "LOAN-2024-066", issuedAt: "2025-02-05" },
  { id: 9, passportSeries: "TM", passportNumber: "I901234", loanAccount: "LOAN-2024-077", issuedAt: "2025-02-09" },
  { id: 10, passportSeries: "TM", passportNumber: "J012345", loanAccount: "LOAN-2024-088", issuedAt: "2025-02-12" },
];

function applyMockFilters(params: LoanPaidOffLetterListParams): PaginatedResponse<LoanPaidOffLetter> {
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

export async function fetchLoanPaidOffLetters(params: LoanPaidOffLetterListParams): Promise<PaginatedResponse<LoanPaidOffLetter>> {
  if (USE_MOCK) return applyMockFilters(params);

  const { data } = await apiClient.get<PaginatedResponse<LoanPaidOffLetter>>("/loan-paid-off-letter-orders", { params });
  return data;
}

export async function deleteLoanPaidOffLetter(id: number): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_DATA.findIndex((r) => r.id === id);
    if (idx !== -1) MOCK_DATA.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/loan-paid-off-letter-orders/${id}`);
}
