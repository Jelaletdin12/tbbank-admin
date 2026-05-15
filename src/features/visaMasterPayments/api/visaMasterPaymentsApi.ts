import apiClient from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IntlPaymentStatus = "pending" | "approved" | "rejected";
export type CurrencyType = "visa" | "mastercard";

export interface IntlPaymentItem {
  id: string;
  client_id: string;
  client_label: string;
  currency_type: CurrencyType;
  currency_type_label: string;
  created_at: string;
  province: string;
  province_label: string;
  branch: string;
  branch_label: string;
  status: IntlPaymentStatus;
  note: string | null;

  // Şahsy maglumatlar
  passport_first_name: string;
  passport_last_name: string;
  phone: string;
  email: string | null;
  home_address: string | null;

  // Töleg upgradyjynyň maglumatlary
  passport_series: string;
  passport_number: string;
  payer_full_name: string;
  payer_account_number: string;

  // Töleg kabul edijiniň maglumatlary
  receiver_info: string;

  // Kabul ediji talyp boyunca resminamalar (9 sany)
  doc_sberbank_account: string | null; // file url
  doc_school_enrollment: string | null;
  doc_summons: string | null;
  doc_passport_tm: string | null;
  doc_foreign_passport: string | null;
  doc_foreign_passport_copy: string | null;
  doc_exit_permission: string | null;
  doc_school_foreign_info: string | null;
  doc_school_departure_info: string | null;

  // Upgradyý boyunca resminamalar (6 sany)
  upd_doc_passport_tm: string | null;
  upd_doc_foreign_passport: string | null;
  upd_doc_visa: string | null;
  upd_doc_acceptance_letter: string | null;
  upd_doc_passport_biometric: string | null;
  upd_doc_passport_old: string | null;

  created_by: string;
  created_by_label: string;
}

export interface IntlPaymentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: IntlPaymentStatus | "";
  month?: string;
  province?: string;
}

export interface IntlPaymentListResponse {
  data: IntlPaymentItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type IntlPaymentCreatePayload = {
  client_id: string;
  status: IntlPaymentStatus;
  note: string;
  currency_type: CurrencyType;
  province: string;
  branch: string;

  passport_first_name: string;
  passport_last_name: string;
  phone: string;
  email: string;
  home_address: string;

  passport_series: string;
  passport_number: string;
  payer_full_name: string;
  payer_account_number: string;

  receiver_info: string;

  // kabul ediji docs
  doc_sberbank_account: File | null;
  doc_school_enrollment: File | null;
  doc_summons: File | null;
  doc_passport_tm: File | null;
  doc_foreign_passport: File | null;
  doc_foreign_passport_copy: File | null;
  doc_exit_permission: File | null;
  doc_school_foreign_info: File | null;
  doc_school_departure_info: File | null;

  // upgradyý docs
  upd_doc_passport_tm: File | null;
  upd_doc_foreign_passport: File | null;
  upd_doc_visa: File | null;
  upd_doc_acceptance_letter: File | null;
  upd_doc_passport_biometric: File | null;
  upd_doc_passport_old: File | null;
};

export type IntlPaymentUpdatePayload = IntlPaymentCreatePayload;

// ─── API Functions ────────────────────────────────────────────────────────────

const MOCK_INTL_PAYMENTS: IntlPaymentItem[] = [
  {
    id: "1",
    client_id: "1",
    client_label: "Jelaletdin",
    currency_type: "visa",
    currency_type_label: "Visa",
    created_at: "2024-05-07 12:00",
    province: "ashgabat",
    province_label: "Aşgabat",
    branch: "1",
    branch_label: "Merkezi şahamça",
    status: "pending",
    note: "Test sargyt",
    passport_first_name: "Aman",
    passport_last_name: "Amanow",
    phone: "99365123456",
    email: "aman@example.com",
    home_address: "Aşgabat ş., Magtymguly şaýoly 1",
    passport_series: "I-MR",
    passport_number: "123456",
    payer_full_name: "Aman Amanow",
    payer_account_number: "1234567890123456",
    receiver_info: "Test Receiver",
    doc_sberbank_account: null,
    doc_school_enrollment: null,
    doc_summons: null,
    doc_passport_tm: null,
    doc_foreign_passport: null,
    doc_foreign_passport_copy: null,
    doc_exit_permission: null,
    doc_school_foreign_info: null,
    doc_school_departure_info: null,
    upd_doc_passport_tm: null,
    upd_doc_foreign_passport: null,
    upd_doc_visa: null,
    upd_doc_acceptance_letter: null,
    upd_doc_passport_biometric: null,
    upd_doc_passport_old: null,
    created_by: "1",
    created_by_label: "Admin",
  },
];

export const intlPaymentApi = {
  list: async (params: IntlPaymentListParams): Promise<IntlPaymentListResponse> => {
    return {
      data: MOCK_INTL_PAYMENTS,
      meta: {
        current_page: params.page || 1,
        last_page: 1,
        per_page: params.per_page || 25,
        total: MOCK_INTL_PAYMENTS.length,
      },
    };

    const { data } = await apiClient.get("/intl-payments/visa-master", { params });
    return data;
  },

  getById: async (id: string): Promise<IntlPaymentItem> => {
    const mock = MOCK_INTL_PAYMENTS.find((p) => p.id === id);
    if (mock) return mock;

    const { data } = await apiClient.get(`/intl-payments/visa-master/${id}`);
    return data;
  },

  create: (payload: IntlPaymentCreatePayload): Promise<IntlPaymentItem> => {
    const form = buildFormData(payload);
    return apiClient
      .post("/intl-payments/visa-master", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (id: string, payload: IntlPaymentUpdatePayload): Promise<IntlPaymentItem> => {
    const form = buildFormData(payload);
    form.append("_method", "PUT");
    return apiClient
      .post(`/intl-payments/visa-master/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  delete: (id: string): Promise<void> => apiClient.delete(`/intl-payments/visa-master/${id}`).then((r) => r.data),
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const TEXT_FIELDS: (keyof IntlPaymentCreatePayload)[] = [
  "client_id",
  "status",
  "note",
  "currency_type",
  "province",
  "branch",
  "passport_first_name",
  "passport_last_name",
  "phone",
  "email",
  "home_address",
  "passport_series",
  "passport_number",
  "payer_full_name",
  "payer_account_number",
  "receiver_info",
];

const FILE_FIELDS: (keyof IntlPaymentCreatePayload)[] = [
  "doc_sberbank_account",
  "doc_school_enrollment",
  "doc_summons",
  "doc_passport_tm",
  "doc_foreign_passport",
  "doc_foreign_passport_copy",
  "doc_exit_permission",
  "doc_school_foreign_info",
  "doc_school_departure_info",
  "upd_doc_passport_tm",
  "upd_doc_foreign_passport",
  "upd_doc_visa",
  "upd_doc_acceptance_letter",
  "upd_doc_passport_biometric",
  "upd_doc_passport_old",
];

function buildFormData(payload: IntlPaymentCreatePayload): FormData {
  const form = new FormData();
  for (const key of TEXT_FIELDS) {
    const val = payload[key];
    if (val !== null && val !== undefined) form.append(key, String(val));
  }
  for (const key of FILE_FIELDS) {
    const file = payload[key];
    if (file instanceof File) form.append(key, file);
  }
  return form;
}
