export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  companyName?: string;
}

export type ProductType = 'SOFTWARE' | 'ADDON' | 'SERVICE';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Brand: Odoo", "Edition: Enterprise"
  attributeName: string; // e.g. "Brand", "Edition"
  attributeValue: string; // e.g. "Odoo", "Standard", "Cloud"
  priceDelta: number; // e.g. +560 for Odoo brand
}

export interface Product {
  id: string;
  name: string;
  code: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string;
  variants: ProductVariant[];
}

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  frequency: BillingFrequency;
  minQuantity: number;
  startDate: string; // ISO date
  endDate?: string;
  // Lifecycle rules
  autoCloseOnEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  description?: string;
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED';
export type PaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_60';

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  variantDelta: number;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 18 for 18%
  discountAmount: number;
  lineTotal: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string; // e.g. SUB-2026-001
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  paymentTerms: PaymentTerms;
  lines: SubscriptionLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  notes?: string;
  lastBilledDate?: string;
  isPaused?: boolean;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  lines: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface InvoiceLine {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-101
  subscriptionId?: string;
  subscriptionNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI';

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. PAY-2026-501
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  note?: string;
  referenceId?: string;
}

export type DiscountType = 'FIXED' | 'PERCENTAGE';
export type DiscountScope = 'WHOLE_SUBSCRIPTION' | 'SPECIFIC_PRODUCT';

export interface DiscountRule {
  id: string;
  code: string; // e.g. "SUMMER2026", "ENTERPRISE10"
  description: string;
  type: DiscountType;
  value: number; // $ value or percentage (e.g. 15 for 15%)
  minPurchaseAmount?: number;
  minQuantity?: number;
  startDate: string;
  endDate: string;
  maxUsageLimit: number;
  usageCount: number;
  scope: DiscountScope;
  targetProductId?: string;
  isActive: boolean;
}

export interface TaxRule {
  id: string;
  name: string; // e.g. "GST Standard", "VAT Reduced"
  rate: number; // e.g. 18 for 18%
  description?: string;
  isDefault: boolean;
}
