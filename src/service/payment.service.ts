import { apiClient } from './api.client'

// Tài khoản ngân hàng nhận tiền phí lưu kho của Ban quản lý tòa nhà
export type TBankAccount = {
  bankBin: string
  bankName: string
  accountNumber: string
  accountName: string
}

// Biểu phí 4 chặng, đúng tên trường pricingPolicy của server
export type TPricingPolicy = {
  monthlySubscriptionFee: number
  perUseFee: number
  t1Hours: number
  t2Hours: number
  t3Hours: number
  feeX1: number
  feeX2: number
  maxOverdueFeeCap: number
}

export type TPricingTierKey = 'FREE' | 'TIER_1' | 'TIER_2' | 'RETRIEVAL'

export type TPricingTier = {
  tier: TPricingTierKey
  fromHours: number
  toHours: number | null
  subscriberFee: number
  retailFee: number
}

export type TBuildingPayment = {
  buildingId: string
  buildingName: string
  bankAccount: TBankAccount
  pricingPolicy: TPricingPolicy
  hasBankAccount: boolean
}

// Kết quả GET /payments/package/:id/fee (hàm calculateFee của server)
export type TPackageFee = {
  isOverdue: boolean
  feeDue: number
  hoursElapsed: number
  currentTier: TPricingTierKey
  isPendingRetrieval: boolean
  canExtend: boolean
  baseFee: number
  overdueFee: number
  paidUntil?: string
  totalFeePaid: number
  buildingName?: string
  // Biểu phí của tòa đang áp dụng cho bưu kiện này
  policy?: Partial<TPricingPolicy>
}

// Biểu phí mặc định của server (DEFAULT_PRICING_POLICY) khi tòa chưa cấu hình riêng
export const DEFAULT_PRICING_POLICY: TPricingPolicy = {
  monthlySubscriptionFee: 30000,
  perUseFee: 5000,
  t1Hours: 12,
  t2Hours: 24,
  t3Hours: 48,
  feeX1: 10000,
  feeX2: 15000,
  maxOverdueFeeCap: 25000,
}

const EMPTY_BANK: TBankAccount = { bankBin: '', bankName: '', accountNumber: '', accountName: '' }

// Server chỉ tạo được mã QR khi có đủ mã BIN, số tài khoản và tên chủ tài khoản
export function isBankAccountComplete(bank?: Partial<TBankAccount>): boolean {
  return Boolean(bank?.bankBin?.trim() && bank?.accountNumber?.trim() && bank?.accountName?.trim())
}

// Dựng bảng 4 chặng theo đúng công thức buildPricingTiers của server, dùng để xem trước khi lưu
export function buildPricingTiers(policy: TPricingPolicy): TPricingTier[] {
  const cappedOverdueFee = Math.min(policy.feeX1 + policy.feeX2, policy.maxOverdueFeeCap)
  return [
    { tier: 'FREE', fromHours: 0, toHours: policy.t1Hours, subscriberFee: 0, retailFee: policy.perUseFee },
    {
      tier: 'TIER_1',
      fromHours: policy.t1Hours,
      toHours: policy.t2Hours,
      subscriberFee: policy.feeX1,
      retailFee: policy.perUseFee + policy.feeX1,
    },
    {
      tier: 'TIER_2',
      fromHours: policy.t2Hours,
      toHours: policy.t3Hours,
      subscriberFee: cappedOverdueFee,
      retailFee: policy.perUseFee + cappedOverdueFee,
    },
    {
      tier: 'RETRIEVAL',
      fromHours: policy.t3Hours,
      toHours: null,
      subscriberFee: cappedOverdueFee,
      retailFee: policy.perUseFee + cappedOverdueFee,
    },
  ]
}

type TApiMyBuilding = {
  _id: string
  name: string
  bankAccount?: Partial<TBankAccount>
  pricingPolicy?: Partial<TPricingPolicy>
}

function mapMyBuilding(b: TApiMyBuilding): TBuildingPayment {
  const bankAccount = { ...EMPTY_BANK, ...(b.bankAccount ?? {}) }
  return {
    buildingId: b._id,
    buildingName: b.name,
    bankAccount,
    pricingPolicy: { ...DEFAULT_PRICING_POLICY, ...(b.pricingPolicy ?? {}) },
    hasBankAccount: isBankAccountComplete(bankAccount),
  }
}

// Chỉ Ban quản lý gọi được: server trả cả tài khoản ngân hàng và biểu phí của tòa mình
export async function getMyBuildingPayment(): Promise<TBuildingPayment> {
  const res = await apiClient.get<TApiMyBuilding>('/buildings/my-building')
  return mapMyBuilding(res.data)
}

// Server tự ghép với cấu hình cũ và kiểm tra T1 < T2 < T3
export async function updateMyBuildingPayment(input: {
  bankAccount?: TBankAccount
  pricingPolicy?: TPricingPolicy
}): Promise<TBuildingPayment> {
  const body: Record<string, unknown> = {}
  if (input.bankAccount) {
    body.bankAccount = {
      bankBin: input.bankAccount.bankBin.trim(),
      bankName: input.bankAccount.bankName.trim(),
      accountNumber: input.bankAccount.accountNumber.trim(),
      accountName: input.bankAccount.accountName.trim(),
    }
  }
  if (input.pricingPolicy) body.pricingPolicy = input.pricingPolicy
  const res = await apiClient.patch<TApiMyBuilding>('/buildings/my-building', body)
  // Báo cho banner cảnh báo ở layout tải lại trạng thái tài khoản ngân hàng
  window.dispatchEvent(new Event(BANK_ACCOUNT_UPDATED_EVENT))
  return mapMyBuilding(res.data)
}

export const BANK_ACCOUNT_UPDATED_EVENT = 'smart-locker:bank-account-updated'

export async function getPackageFee(packageId: string): Promise<TPackageFee> {
  const res = await apiClient.get<TPackageFee>(`/payments/package/${encodeURIComponent(packageId)}/fee`)
  return res.data
}
