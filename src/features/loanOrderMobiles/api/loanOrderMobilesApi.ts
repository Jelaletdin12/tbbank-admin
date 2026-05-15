import apiClient from "@/lib/api/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LoanOrderMobileStatus = "GARAŞYLÝAR" | "KANAGATLANDYRYLAN" | "RED_EDILDI" | "IŞLENÝÄR";

export interface LoanOrderMobile {
  id: string;
  loanType: string;
  createdAt: string;
  region: string;
  branch: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: LoanOrderMobileStatus;
  createdBy?: string;

  // ── Detail fields ─────────────────────────────────────────────────────────
  patronicName?: string | null;
  education?: string | null;
  marriageStatus?: string | null;
  dateOfBirth?: string | null;
  residence?: string | null;
  currentResidence?: string | null;

  // Passport
  passportSerie?: string | null;
  passportNumber?: string | null;
  passportDateOfIssue?: string | null;
  passportGivenBy?: string | null;
  bornPlace?: string | null;
  passportPage1Url?: string | null;
  passportPage23Url?: string | null;
  passportPage89Url?: string | null;
  passportPage32Url?: string | null;

  // Contact
  email?: string | null;
  phoneAdditional?: string | null;
  homePhone?: string | null;

  // Employment
  workCompany?: string | null;
  workHrPhone?: string | null;
  workRegion?: string | null;
  workProvince?: string | null;
  position?: string | null;
  salary?: number | null;
  workStartedAt?: string | null;

  // New fields
  note?: string | null;
  loanAmount?: number | null;
  loanHistory?: string | null;

  // Card (Zähmet haky)
  cardNumber?: string | null;
  cardName?: string | null;
  cardExpMonth?: string | null;
  cardExpYear?: string | null;

  // Guarantor (Zamun)
  guarantor1Name?: string | null;
  guarantor1Surname?: string | null;
  guarantor1Patronic?: string | null;
  guarantor1PassportSerie?: string | null;
  guarantor1PassportNumber?: string | null;
  guarantor1CardNumber?: string | null;
  guarantor1CardName?: string | null;
  guarantor1CardExpMonth?: string | null;
  guarantor1CardExpYear?: string | null;
  guarantor1Salary?: number | null;
}

export interface LoanOrderMobilePayload {
  status: string;
  loanType: string;
  region: string;
  branch: string;
  firstName: string;
  lastName: string;
  patronicName?: string;
  education: string;
  marriageStatus: string;
  dateOfBirth: string;
  residence: string;
  currentResidence?: string;
  passportSerie: string;
  passportNumber: string;
  passportDateOfIssue: string;
  passportGivenBy: string;
  bornPlace?: string;
  email?: string;
  phone: string;
  phoneAdditional?: string;
  homePhone?: string;
  workCompany: string;
  workHrPhone?: string;
  workRegion?: string;
  workProvince?: string;
  position: string;
  salary: number;
  workStartedAt: string;

  note?: string;
  loanAmount?: number;
  loanHistory?: string;

  cardNumber?: string;
  cardName?: string;
  cardExpMonth?: string;
  cardExpYear?: string;

  guarantor1Name?: string;
  guarantor1Surname?: string;
  guarantor1Patronic?: string;
  guarantor1PassportSerie?: string;
  guarantor1PassportNumber?: string;
  guarantor1CardNumber?: string;
  guarantor1CardName?: string;
  guarantor1CardExpMonth?: string;
  guarantor1CardExpYear?: string;
  guarantor1Salary?: number;
}

export interface LoanOrderMobileListParams {
  search?: string;
  region?: string;
  status?: LoanOrderMobileStatus;
  branch?: string;
  archived?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DATA: LoanOrderMobile[] = [
  {
    id: "LOM-0001",
    loanType: "Sarp ediş karzy",
    createdAt: "2025-01-15 09:42",
    region: "Aşgabat",
    branch: "Merkezi şahamça",
    firstName: "Oraz",
    lastName: "Annaýew",
    phone: "+99361123456",
    status: "GARAŞYLÝAR",
    note: "Müşderi dokumentleri tassyklamady",
    loanAmount: 15000,
    loanHistory: "positive",
    patronicName: "Myradowiç",
    education: "high",
    marriageStatus: "MARRIED",
    dateOfBirth: "1992-04-18",
    residence: "Aşgabat, Bitarap Türkmenistan şaýoly, 15",
    currentResidence: "Aşgabat, Garaşsyzlyk köçesi, 5",
    passportSerie: "I",
    passportNumber: "123456",
    passportDateOfIssue: "2015-03-10",
    passportGivenBy: "Aşgabat şäheriniň Içeri işler müdirligi",
    bornPlace: "Aşgabat şäheri",
    email: "oraz.annayew@email.com",
    phoneAdditional: "+99365443322",
    workCompany: "Türkmennebit",
    workHrPhone: "+99312456789",
    workRegion: "Aşgabat",
    workProvince: "Büzmeýin etraby",
    position: "Inžener",
    salary: 2500,
    workStartedAt: "2018-06-01",
    cardNumber: "4111111111111111",
    cardName: "ORAZ ANNAÝEW",
    cardExpMonth: "12",
    cardExpYear: "2027",
    guarantor1Name: "Berdi",
    guarantor1Surname: "Berdiýew",
    guarantor1Patronic: "Annagulyýewiç",
    guarantor1PassportSerie: "II",
    guarantor1PassportNumber: "654321",
    guarantor1CardNumber: "4222222222222222",
    guarantor1CardName: "BERDI BERDIÝEW",
    guarantor1CardExpMonth: "06",
    guarantor1CardExpYear: "2026",
    guarantor1Salary: 3000,
  },
  {
    id: "LOM-0002",
    loanType: "Awtoulag karzy",
    createdAt: "2025-01-18 11:05",
    region: "Ahal",
    branch: "Änew şahamçasy",
    firstName: "Merjen",
    lastName: "Hudaýewa",
    phone: "+99362234567",
    status: "KANAGATLANDYRYLAN",
    loanAmount: 30000,
    loanHistory: "new",
    patronicName: "Myratowna",
    education: "masters",
    marriageStatus: "SINGLE",
    dateOfBirth: "1995-11-20",
    residence: "Änew şäher, Garaşsyzlyk köçesi, 10",
    passportSerie: "I",
    passportNumber: "789012",
    passportDateOfIssue: "2018-07-22",
    passportGivenBy: "Ahal welaýatynyň Içeri işler müdirligi",
    bornPlace: "Änew şäheri",
    email: "merjen.hudayewa@email.com",
    workCompany: "Änew etrap hasap bölümi",
    position: "Hasapçy",
    salary: 1800,
    workStartedAt: "2019-03-15",
    cardNumber: "4333333333333333",
    cardName: "MERJEN HUDAÝEWA",
    cardExpMonth: "09",
    cardExpYear: "2028",
    guarantor1Name: "Merdan",
    guarantor1Surname: "Merdanow",
    guarantor1PassportSerie: "I",
    guarantor1PassportNumber: "345678",
    guarantor1CardNumber: "4444444444444444",
    guarantor1CardName: "MERDAN MERDANOW",
    guarantor1CardExpMonth: "03",
    guarantor1CardExpYear: "2025",
    guarantor1Salary: 2200,
  },
  {
    id: "LOM-0003",
    loanType: "Ipoteka karzy",
    createdAt: "2025-01-20 14:30",
    region: "Balkan",
    branch: "Balkanabat şahamçasy",
    firstName: "Serdar",
    lastName: "Durdyýew",
    phone: "+99363345678",
    status: "IŞLENÝÄR",
    loanAmount: 50000,
    loanHistory: "positive",
    patronicName: "Annagylyjowiç",
    education: "high",
    marriageStatus: "MARRIED",
    dateOfBirth: "1988-07-12",
    residence: "Balkanabat, Magtymguly köçesi, 25",
    passportSerie: "II",
    passportNumber: "456123",
    passportDateOfIssue: "2016-05-18",
    passportGivenBy: "Balkan welaýatynyň Içeri işler müdirligi",
    email: "serdar.durdyyew@email.com",
    workCompany: "Balkan nebit",
    position: "Operator",
    salary: 3200,
    workStartedAt: "2015-09-01",
    cardNumber: "4555555555555555",
    cardName: "SERDAR DURDYÝEW",
    cardExpMonth: "04",
    cardExpYear: "2029",
    guarantor1Name: "Döwran",
    guarantor1Surname: "Döwranow",
    guarantor1PassportSerie: "I",
    guarantor1PassportNumber: "789456",
    guarantor1CardNumber: "4666666666666666",
    guarantor1CardName: "DÖWRAN DÖWRANOW",
    guarantor1CardExpMonth: "11",
    guarantor1CardExpYear: "2027",
    guarantor1Salary: 3500,
  },
  {
    id: "LOM-0004",
    loanType: "Telekeçilik karzy",
    createdAt: "2025-01-22 08:15",
    region: "Lebap",
    branch: "Türkmenabat şahamçasy",
    firstName: "Aýna",
    lastName: "Meredowa",
    phone: "+99365456789",
    status: "RED_EDILDI",
    loanAmount: 25000,
    patronicName: "Begenjowna",
    education: "high",
    marriageStatus: "DIVORCED",
    dateOfBirth: "1991-02-28",
    residence: "Türkmenabat, Lebap köçesi, 8",
    passportSerie: "I",
    passportNumber: "321654",
    passportDateOfIssue: "2017-11-05",
    passportGivenBy: "Lebap welaýatynyň Içeri işler müdirligi",
    workCompany: "Hususy telekeçi",
    position: "Telekeçi",
    salary: 4000,
    workStartedAt: "2020-01-10",
    cardNumber: "4777777777777777",
    cardName: "AÝNA MEREDOWA",
    cardExpMonth: "07",
    cardExpYear: "2026",
  },
  {
    id: "LOM-0005",
    loanType: "Sarp ediş karzy",
    createdAt: "2025-01-25 16:00",
    region: "Mary",
    branch: "Mary-1 şahamçasy",
    firstName: "Begmyrat",
    lastName: "Oraz",
    phone: "+99366567890",
    status: "GARAŞYLÝAR",
    loanAmount: 8000,
    loanHistory: "new",
    patronicName: "Annageldiwiç",
    education: "middle",
    marriageStatus: "SINGLE",
    dateOfBirth: "2000-08-15",
    residence: "Mary şäher, Saýat köçesi, 3",
    passportSerie: "I",
    passportNumber: "567890",
    passportDateOfIssue: "2020-01-20",
    passportGivenBy: "Mary welaýatynyň Içeri işler müdirligi",
    workCompany: "Mary gurluşyk",
    position: "Işçi",
    salary: 1200,
    workStartedAt: "2022-06-01",
  },
  {
    id: "LOM-0006",
    loanType: "Bilim karzy",
    createdAt: "2025-01-28 10:20",
    region: "Daşoguz",
    branch: "Daşoguz şahamçasy",
    firstName: "Gülälek",
    lastName: "Saparowa",
    phone: "+99361678901",
    status: "KANAGATLANDYRYLAN",
    loanAmount: 12000,
    patronicName: "Mämmedowna",
    education: "phd",
    marriageStatus: "MARRIED",
    dateOfBirth: "1985-12-03",
    residence: "Daşoguz, Gurbansoltan eje köçesi, 12",
    passportSerie: "II",
    passportNumber: "901234",
    passportDateOfIssue: "2014-08-30",
    passportGivenBy: "Daşoguz welaýatynyň Içeri işler müdirligi",
    email: "gulalek.saparowa@email.com",
    workCompany: "Daşoguz uniwersiteti",
    position: "Mugallym",
    salary: 2000,
    workStartedAt: "2016-09-01",
    cardNumber: "4888888888888888",
    cardName: "GÜLÄLEK SAPAROWA",
    cardExpMonth: "02",
    cardExpYear: "2028",
    guarantor1Name: "Maksat",
    guarantor1Surname: "Saparow",
    guarantor1PassportSerie: "I",
    guarantor1PassportNumber: "112233",
    guarantor1CardNumber: "4999999999999999",
    guarantor1CardName: "MAKSAT SAPAROW",
    guarantor1CardExpMonth: "10",
    guarantor1CardExpYear: "2027",
    guarantor1Salary: 2500,
  },
  {
    id: "LOM-0007",
    loanType: "Awtoulag karzy",
    createdAt: "2025-02-01 13:45",
    region: "Aşgabat",
    branch: "Garaşsyzlyk şahamçasy",
    firstName: "Myrat",
    lastName: "Ataýew",
    phone: "+99362789012",
    status: "IŞLENÝÄR",
    loanAmount: 35000,
    patronicName: "Batyrowiç",
    education: "high",
    marriageStatus: "MARRIED",
    dateOfBirth: "1989-09-22",
    residence: "Aşgabat, Çandybil köçesi, 45",
    passportSerie: "I",
    passportNumber: "334455",
    passportDateOfIssue: "2015-12-12",
    passportGivenBy: "Aşgabat şäheriniň Içeri işler müdirligi",
    workCompany: "Türkmenhowaýollar",
    position: "Sürüji",
    salary: 2800,
    workStartedAt: "2017-04-01",
    cardNumber: "4111111111112222",
    cardName: "MYRAT ATAÝEW",
    cardExpMonth: "08",
    cardExpYear: "2027",
  },
];

let mockStore = [...MOCK_DATA];
let nextId = 8;

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function applyMockFilters(params: LoanOrderMobileListParams): PaginatedResponse<LoanOrderMobile> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 25;

  let result = [...mockStore];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }
  if (params.region) result = result.filter((r) => r.region === params.region);
  if (params.status) result = result.filter((r) => r.status === params.status);
  if (params.branch) result = result.filter((r) => r.branch === params.branch);

  const total = result.length;
  const start = (page - 1) * perPage;

  return { data: result.slice(start, start + perPage), total };
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function fetchLoanOrderMobiles(params: LoanOrderMobileListParams): Promise<PaginatedResponse<LoanOrderMobile>> {
  if (true) {
    await delay(500);
    return applyMockFilters(params);
  }
  const { data } = await apiClient.get<PaginatedResponse<LoanOrderMobile>>("/loan-order-mobiles", { params });
  return data;
}

export async function deleteLoanOrderMobile(id: string): Promise<void> {
  await delay(300);
  mockStore = mockStore.filter((r) => r.id !== id);
}

export async function getLoanOrderMobileById(id: string): Promise<LoanOrderMobile> {
  await delay(300);
  const order = mockStore.find((r) => r.id === id);
  if (!order) throw new Error("Not found");
  return { ...order };
}

export async function createLoanOrderMobile(payload: LoanOrderMobilePayload): Promise<LoanOrderMobile> {
  await delay(500);
  const newOrder: LoanOrderMobile = {
    ...payload,
    id: `LOM-${String(nextId++).padStart(4, "0")}`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    status: payload.status as LoanOrderMobileStatus,
  };
  mockStore = [newOrder, ...mockStore];
  return newOrder;
}

export async function updateLoanOrderMobile(id: string, payload: Partial<LoanOrderMobilePayload>): Promise<LoanOrderMobile> {
  await delay(500);
  const idx = mockStore.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Not found");
  const updated = { ...mockStore[idx], ...payload } as LoanOrderMobile;
  mockStore = mockStore.map((r) => (r.id === id ? updated : r));
  return updated;
}

// ─── Branch options by region ─────────────────────────────────────────────────

export const BRANCHES_BY_REGION_MOBILE: Record<string, { value: string; label: string }[]> = {
  Aşgabat: [
    { value: "Merkezi şahamça", label: "Merkezi şahamça" },
    { value: "Garaşsyzlyk şahamçasy", label: "Garaşsyzlyk şahamçasy" },
    { value: "Bitarap şahamça", label: "Bitarap şahamça" },
    { value: "Aşgabat-1 şahamçasy", label: "Aşgabat-1 şahamçasy" },
  ],
  Ahal: [
    { value: "Änew şahamçasy", label: "Änew şahamçasy" },
    { value: "Gökdepe şahamçasy", label: "Gökdepe şahamçasy" },
    { value: "Tejen şahamçasy", label: "Tejen şahamçasy" },
  ],
  Balkan: [
    { value: "Balkanabat şahamçasy", label: "Balkanabat şahamçasy" },
    { value: "Türkmenbaşy şahamçasy", label: "Türkmenbaşy şahamçasy" },
    { value: "Bereket şahamçasy", label: "Bereket şahamçasy" },
  ],
  Daşoguz: [
    { value: "Daşoguz şahamçasy", label: "Daşoguz şahamçasy" },
    { value: "Akdepe şahamçasy", label: "Akdepe şahamçasy" },
    { value: "Boldumsaz şahamçasy", label: "Boldumsaz şahamçasy" },
  ],
  Lebap: [
    { value: "Türkmenabat şahamçasy", label: "Türkmenabat şahamçasy" },
    { value: "Seýdi şahamçasy", label: "Seýdi şahamçasy" },
    { value: "Kerki şahamçasy", label: "Kerki şahamçasy" },
  ],
  Mary: [
    { value: "Mary-1 şahamçasy", label: "Mary-1 şahamçasy" },
    { value: "Mary-2 şahamçasy", label: "Mary-2 şahamçasy" },
    { value: "Baýramaly şahamçasy", label: "Baýramaly şahamçasy" },
  ],
  Arkadag: [{ value: "Arkadag şahamçasy", label: "Arkadag şahamçasy" }],
};
