// features/onlinePaymentHistory/api/onlinePaymentHistoryApi.ts

export type PaymentStatus = 'GARAŞYLÝAR' | 'TÖLENEN' | 'YATYRYLAN'

export interface OnlinePayment {
  id:                    number
  orderId:               string
  amount:                number
  orderNumber:           string
  apiClient:             string
  description:           string
  formUrl:               string
  successUrl:            string
  status:                PaymentStatus
  callbackStatus:        string | null
  username:              string
  onlinePaymantableId:   number
  onlinePaymantableType: string
  createdAt:             string
  updatedAt:             string
}

export interface OnlinePaymentListParams {
  page?:    number
  perPage?: number
  search?:  string
}

export interface OnlinePaymentListResponse {
  data:       OnlinePayment[]
  total:      number
  page:       number
  perPage:    number
  totalPages: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const buildPayment = (
  id: number,
  orderId: string,
  amount: number,
  orderNumber: string,
  apiClient: string,
  description: string,
  status: PaymentStatus,
  username: string,
  paymantableId: number,
  paymantableType: string,
  createdAt: string,
  callbackStatus: string | null = null
): OnlinePayment => ({
  id,
  orderId,
  amount,
  orderNumber,
  apiClient,
  description,
  formUrl:    `https://mpi.gov.tm/payment/merchants/online/payment_ru.html?mdOrder=${orderId}`,
  successUrl: 'https://online.tbbank.gov.tm/online-payment-store-visa-master',
  status,
  callbackStatus,
  username,
  onlinePaymantableId:   paymantableId,
  onlinePaymantableType: paymantableType,
  createdAt,
  updatedAt: createdAt,
})

const VM_TYPE   = 'App\\Modules\\VisaMasterPaymentOrder\\Models\\VisaMasterPaymentOrder'
const SBER_TYPE = 'App\\Modules\\SberPaymentOrder\\Models\\SberPaymentOrder'
const KART_TYPE = 'App\\Modules\\KartPaymentOrder\\Models\\KartPaymentOrder'

const MOCK_PAYMENTS: OnlinePayment[] = [
  buildPayment(1667, 'ed99d307-65fd-40ed-98ec-898019000af4', 99438, '110526160855', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040830', 5280, VM_TYPE,   '2026-05-11T16:08:00Z'),
  buildPayment(1666, 'ab12c456-11aa-22bb-33cc-111111000001', 99438, '110526160800', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5279, VM_TYPE,   '2026-05-11T16:06:00Z', 'SUCCESS'),
  buildPayment(1665, 'bc23d567-22bb-33cc-44dd-222222000002', 99438, '110526160745', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5278, VM_TYPE,   '2026-05-11T16:04:00Z', 'SUCCESS'),
  buildPayment(1664, 'cd34e678-33cc-44dd-55ee-333333000003', 99438, '110526160730', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5277, VM_TYPE,   '2026-05-11T16:03:00Z', 'SUCCESS'),
  buildPayment(1663, 'de45f789-44dd-55ee-66ff-444444000004', 99438, '110526160715', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5276, VM_TYPE,   '2026-05-11T16:01:00Z', 'SUCCESS'),
  buildPayment(1662, 'ef56a890-55ee-66ff-77aa-555555000005', 99438, '110526155900', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5275, VM_TYPE,   '2026-05-11T15:40:00Z', 'SUCCESS'),
  buildPayment(1661, 'fa67b901-66ff-77aa-88bb-666666000006', 99438, '110526155830', 'billing_visa_master_username', 'Visa/Master tölegi', 'YATYRYLAN',  '10130100040844', 5274, VM_TYPE,   '2026-05-11T15:39:00Z'),
  buildPayment(1660, 'ab78c012-77aa-88bb-99cc-777777000007', 99438, '110526155800', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5273, VM_TYPE,   '2026-05-11T15:38:00Z', 'SUCCESS'),
  buildPayment(1659, 'bc89d123-88bb-99cc-00dd-888888000008', 99438, '110526155730', 'billing_visa_master_username', 'Visa/Master tölegi', 'YATYRYLAN',  '10130100040844', 5272, VM_TYPE,   '2026-05-11T15:35:00Z'),
  buildPayment(1658, 'cd90e234-99cc-00dd-11ee-999999000009', 99438, '110526152900', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040830', 5271, VM_TYPE,   '2026-05-11T15:29:00Z', 'SUCCESS'),
  buildPayment(1657, 'de01f345-00dd-11ee-22ff-000000000010', 99438, '110526103900', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040862', 5270, VM_TYPE,   '2026-05-11T10:39:00Z'),
  buildPayment(1656, 'ef12a456-11ee-22ff-33aa-111111000011', 99438, '110526103800', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040862', 5269, VM_TYPE,   '2026-05-11T10:39:00Z'),
  buildPayment(1655, 'fa23b567-22ff-33aa-44bb-222222000012', 99438, '110526103700', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040862', 5268, VM_TYPE,   '2026-05-11T10:38:00Z'),
  buildPayment(1654, 'ab34c678-33aa-44bb-55cc-333333000013', 99438, '110526103600', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040862', 5267, VM_TYPE,   '2026-05-11T10:38:00Z'),
  buildPayment(1653, 'bc45d789-44bb-55cc-66dd-444444000014', 99438, '110526085200', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040828', 5266, VM_TYPE,   '2026-05-11T08:52:00Z'),
  buildPayment(1652, 'cd56e890-55cc-66dd-77ee-555555000015', 99438, '060526142300', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040826', 5265, VM_TYPE,   '2026-05-06T14:23:00Z'),
  buildPayment(1651, 'de67f901-66dd-77ee-88ff-666666000016', 106345,'280426161300', 'billing_sber_username',        'Sber tölegi',        'GARAŞYLÝAR', '10130100040827', 5264, SBER_TYPE, '2026-04-28T16:13:00Z'),
  buildPayment(1650, 'ef78a012-77ee-88ff-99aa-777777000017', 32,    '250426130100', 'billing_username',             'Kart tölegi',        'GARAŞYLÝAR', '10130100004083', 5263, KART_TYPE, '2026-04-25T13:01:00Z'),
  buildPayment(1649, 'fa89b123-88ff-99aa-00bb-888888000018', 32,    '240426101900', 'billing_username',             'Kart tölegi',        'GARAŞYLÝAR', '10130100004083', 5262, KART_TYPE, '2026-04-24T10:19:00Z'),
  buildPayment(1648, 'ab90c234-99aa-00bb-11cc-999999000019', 106344,'210426105900', 'billing_sber_username',        'Sber tölegi',        'TÖLENEN',    '10130100040827', 5261, SBER_TYPE, '2026-04-21T10:59:00Z', 'SUCCESS'),
  buildPayment(1647, 'bc01d345-00bb-11cc-22dd-000000000020', 106243,'200426153100', 'billing_sber_username',        'Sber tölegi',        'GARAŞYLÝAR', '10130100040833', 5260, SBER_TYPE, '2026-04-20T15:31:00Z'),
  buildPayment(1646, 'cd12e456-11cc-22dd-33ee-111111000021', 99438, '170426111400', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040832', 5259, VM_TYPE,   '2026-04-17T11:14:00Z', 'SUCCESS'),
  buildPayment(1645, 'de23f567-22dd-33ee-44ff-222222000022', 99438, '170426103400', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040832', 5258, VM_TYPE,   '2026-04-17T10:34:00Z'),
  buildPayment(1644, 'ef34a678-33ee-44ff-55aa-333333000023', 99438, '160426175600', 'billing_visa_master_username', 'Visa/Master tölegi', 'GARAŞYLÝAR', '10130100040830', 5257, VM_TYPE,   '2026-04-16T17:56:00Z'),
  buildPayment(1643, 'fa45b789-44ff-55aa-66bb-444444000024', 99438, '150426155000', 'billing_visa_master_username', 'Visa/Master tölegi', 'TÖLENEN',    '10130100040826', 5256, VM_TYPE,   '2026-04-15T15:50:00Z', 'SUCCESS'),
]

// Total mock count is 1664 per screenshot — we serve paginated slices of the 25 above
const TOTAL_MOCK = 1664

const delay = (ms = 400) => new Promise<void>((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchOnlinePayments(
  params: OnlinePaymentListParams = {}
): Promise<OnlinePaymentListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '' } = params

  let filtered = [...MOCK_PAYMENTS]

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        String(r.amount).includes(q)          ||
        r.apiClient.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)||
        r.username.toLowerCase().includes(q)  ||
        r.status.toLowerCase().includes(q)    ||
        r.orderId.toLowerCase().includes(q)
    )
  }

  const total      = search.trim() ? filtered.length : TOTAL_MOCK
  const totalPages = Math.ceil(total / perPage)
  const start      = (page - 1) * perPage
  const data       = filtered.slice(start, start + perPage)

  return { data, total, page, perPage, totalPages }
}

export async function fetchOnlinePaymentById(id: number): Promise<OnlinePayment> {
  await delay()
  const item = MOCK_PAYMENTS.find((r) => r.id === id)
  if (!item) throw new Error(`OnlinePayment with id ${id} not found`)
  return { ...item }
}

// Callback trigger — mock only logs; in real impl would POST to backend
export async function triggerPaymentCallback(id: number): Promise<void> {
  await delay(600)
  const item = MOCK_PAYMENTS.find((r) => r.id === id)
  if (!item) throw new Error(`OnlinePayment with id ${id} not found`)
  // no-op in mock
}