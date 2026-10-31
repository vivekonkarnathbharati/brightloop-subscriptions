'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Product,
  Plan,
  Subscription,
  SubscriptionStatus,
  Invoice,
  InvoiceStatus,
  Payment,
  DiscountRule,
  TaxRule,
  QuotationTemplate,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_DISCOUNTS,
  INITIAL_TAX_RULES,
  INITIAL_QUOTATION_TEMPLATES,
} from './sample-data';
import { validatePassword } from './utils';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface BillingRunResult {
  generatedCount: number;
  skippedCount: number;
  invoices: Invoice[];
  messages: string[];
}

interface BrightloopContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  users: User[];
  products: Product[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discounts: DiscountRule[];
  taxRules: TaxRule[];
  quotationTemplates: QuotationTemplate[];
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetDemoData: () => void;

  // Authentication State & Actions
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loginWithRole: (role: Role) => void;
  loginWithEmail: (
    identifier: string,
    password?: string,
    portalRole?: Role
  ) => { success: boolean; error?: string };
  logout: () => void;

  // Role booleans
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;

  // Subscription Operations
  createSubscription: (sub: Omit<Subscription, 'id' | 'subscriptionNumber'>) => Subscription;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  renewSubscription: (id: string) => void;
  closeSubscription: (id: string) => void;

  // Billing & Invoicing Operations
  generateInvoiceForSubscription: (subscriptionId: string, options?: { force?: boolean }) => { success: boolean; invoice?: Invoice; error?: string };
  runBillingDay: () => BillingRunResult;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;

  // Payment Operations
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentNumber'>) => { success: boolean; error?: string };

  // Admin Discount Operations
  createDiscountRule: (rule: Omit<DiscountRule, 'id' | 'usageCount'>) => { success: boolean; error?: string };
  toggleDiscountActive: (id: string) => void;

  // Admin Tax Operations
  createTaxRule: (rule: Omit<TaxRule, 'id'>) => { success: boolean; error?: string };
  updateTaxRule: (taxId: string, data: Partial<TaxRule>) => { success: boolean; error?: string };
  deleteTaxRule: (taxId: string) => { success: boolean; error?: string };

  // Product & Variant Operations
  createProduct: (product: Omit<Product, 'id' | 'variants'>) => Product;
  updateProduct: (productId: string, data: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (productId: string) => { success: boolean; error?: string };
  addProductVariant: (productId: string, variant: { name: string; attributeName: string; attributeValue: string; priceDelta: number }) => void;

  // Plan Operations
  createPlan: (plan: Omit<Plan, 'id'>) => Plan;
  updatePlan: (planId: string, planData: Partial<Plan>) => { success: boolean; error?: string };
  deletePlan: (planId: string) => { success: boolean; error?: string };

  // Staff & User Operations
  addStaffMember: (name: string, email: string) => { success: boolean; error?: string };
  updateStaffMember: (userId: string, data: { name: string; email: string; role?: Role }) => { success: boolean; error?: string };
  deleteStaffMember: (userId: string) => { success: boolean; error?: string };
  registerCustomer: (name: string, email: string, password: string, companyName?: string) => { success: boolean; error?: string };
}

const BrightloopContext = createContext<BrightloopContextType | null>(null);

const STORAGE_PREFIX = 'brightloop_v1_';

export function BrightloopProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Alice Vance (Admin)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Start signed OUT so sign-in page shows first!
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [discounts, setDiscounts] = useState<DiscountRule[]>(INITIAL_DISCOUNTS);
  const [taxRules, setTaxRules] = useState<TaxRule[]>(INITIAL_TAX_RULES);
  const [quotationTemplates] = useState<QuotationTemplate[]>(INITIAL_QUOTATION_TEMPLATES);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Load from localStorage on client-side mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(`${STORAGE_PREFIX}users`);
      if (storedUsers) setUsers(JSON.parse(storedUsers));

      const storedSubs = localStorage.getItem(`${STORAGE_PREFIX}subscriptions`);
      if (storedSubs) setSubscriptions(JSON.parse(storedSubs));

      const storedInvoices = localStorage.getItem(`${STORAGE_PREFIX}invoices`);
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));

      const storedPayments = localStorage.getItem(`${STORAGE_PREFIX}payments`);
      if (storedPayments) setPayments(JSON.parse(storedPayments));

      const storedDiscounts = localStorage.getItem(`${STORAGE_PREFIX}discounts`);
      if (storedDiscounts) setDiscounts(JSON.parse(storedDiscounts));

      const storedProducts = localStorage.getItem(`${STORAGE_PREFIX}products`);
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      const storedPlans = localStorage.getItem(`${STORAGE_PREFIX}plans`);
      if (storedPlans) setPlans(JSON.parse(storedPlans));
    } catch {
      // Fallback to initial
    }
  }, []);

  // Save changes to localStorage
  const saveToLocal = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // Ignore
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setPlans(INITIAL_PLANS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setDiscounts(INITIAL_DISCOUNTS);
    setTaxRules(INITIAL_TAX_RULES);
    addNotification('Reset to pristine demo dataset.', 'info');
  };

  const switchRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      addNotification(`Switched active view to ${role}: ${targetUser.name}`, 'info');
    }
  };

  const loginWithRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      addNotification(`Signed in as ${targetUser.name} (${role})`, 'success');
    }
  };

  const loginWithEmail = (
    identifier: string,
    password?: string,
    portalRole?: Role
  ): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = cleanId.replace(/[^0-9]/g, '');

    const targetUser = users.find((u) => {
      const matchEmail = u.email.toLowerCase() === cleanId;
      const matchName = u.name.toLowerCase() === cleanId;
      const matchEmpId = u.employeeId && u.employeeId.toLowerCase() === cleanId;
      const matchPhone = u.phone && (
        u.phone.toLowerCase() === cleanId ||
        (cleanPhone.length >= 7 && u.phone.replace(/[^0-9]/g, '').includes(cleanPhone))
      );
      return matchEmail || matchName || matchEmpId || matchPhone;
    });

    if (!targetUser) {
      if (portalRole === 'ADMIN') {
        return { success: false, error: 'Invalid Corporate Admin ID or official email.' };
      }
      if (portalRole === 'STAFF') {
        return { success: false, error: 'Invalid Employee ID or staff email.' };
      }
      return { success: false, error: 'No account found with this email or mobile number.' };
    }

    // Role Enforcement for Portal Isolation
    if (portalRole && targetUser.role !== portalRole) {
      if (portalRole === 'ADMIN' && targetUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Security Notice: This account does not have Admin clearance. Access denied.',
        };
      }
      if (portalRole === 'STAFF' && targetUser.role === 'CUSTOMER') {
        return {
          success: false,
          error: 'Notice: Customer accounts cannot log into the internal Employee Sales portal.',
        };
      }
      if (portalRole === 'CUSTOMER' && targetUser.role !== 'CUSTOMER') {
        return {
          success: false,
          error: 'Notice: Internal staff should log in via Admin Console or Employee portal.',
        };
      }
    }

    // Password verification
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    addNotification(`Signed in successfully as ${targetUser.name} (${targetUser.role})`, 'success');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    addNotification('You have been signed out.', 'info');
  };

  const isAdmin = currentUser.role === 'ADMIN';
  const isStaff = currentUser.role === 'STAFF';
  const isCustomer = currentUser.role === 'CUSTOMER';

  // 1. Subscription Management
  const createSubscription = (subData: Omit<Subscription, 'id' | 'subscriptionNumber'>): Subscription => {
    const nextNum = subscriptions.length + 1;
    const padNum = String(nextNum).padStart(3, '0');
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      subscriptionNumber: `SUB-2026-${padNum}`,
    };
    const updated = [newSub, ...subscriptions];
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Created Subscription ${newSub.subscriptionNumber} (${newSub.status})`);
    return newSub;
  };

  const updateSubscriptionStatus = (id: string, newStatus: SubscriptionStatus) => {
    const updated = subscriptions.map((s) => {
      if (s.id !== id) return s;
      return { ...s, status: newStatus };
    });
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Subscription status updated to ${newStatus}`);
  };

  const pauseSubscription = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.allowPause) {
      addNotification('This subscription plan policy disallows pausing.', 'error');
      return;
    }
    const updated = subscriptions.map((s) => (s.id === id ? { ...s, isPaused: true } : s));
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Subscription ${sub.subscriptionNumber} paused.`);
  };

  const resumeSubscription = (id: string) => {
    const updated = subscriptions.map((s) => (s.id === id ? { ...s, isPaused: false } : s));
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Subscription resumed.`);
  };

  const renewSubscription = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.allowRenew) {
      addNotification('This plan policy disallows renewal.', 'error');
      return;
    }
    // Extend expiry by 1 year or 1 month based on frequency
    const currentExpiry = new Date(sub.expiryDate);
    if (sub.billingFrequency === 'YEARLY') {
      currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    } else {
      currentExpiry.setMonth(currentExpiry.getMonth() + 1);
    }
    const newExpiryStr = currentExpiry.toISOString().split('T')[0];

    const updated = subscriptions.map((s) =>
      s.id === id ? { ...s, status: 'ACTIVE' as SubscriptionStatus, isPaused: false, expiryDate: newExpiryStr } : s
    );
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Renewed subscription ${sub.subscriptionNumber} through ${newExpiryStr}`);
  };

  const closeSubscription = (id: string) => {
    const updated = subscriptions.map((s) =>
      s.id === id ? { ...s, status: 'CLOSED' as SubscriptionStatus } : s
    );
    setSubscriptions(updated);
    saveToLocal('subscriptions', updated);
    addNotification(`Subscription closed.`);
  };

  // 2. Billing Engine with Zero Double-Billing Guarantee
  const generateInvoiceForSubscription = (
    subscriptionId: string,
    options?: { force?: boolean }
  ): { success: boolean; invoice?: Invoice; error?: string } => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) {
      addNotification('Subscription not found.', 'error');
      return { success: false, error: 'Subscription not found' };
    }
    if (sub.status !== 'ACTIVE') {
      addNotification(`Cannot bill: ${sub.subscriptionNumber} is in status ${sub.status}.`, 'error');
      return { success: false, error: 'Only ACTIVE subscriptions can be billed.' };
    }
    if (sub.isPaused) {
      addNotification(`Cannot bill: ${sub.subscriptionNumber} is currently paused.`, 'error');
      return { success: false, error: 'Subscription is currently paused.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Find previous non-cancelled invoices for this subscription
    const existingInvoices = invoices.filter(
      (inv) => inv.subscriptionId === sub.id && inv.status !== 'CANCELLED'
    );

    const existingThisMonth = existingInvoices.find(
      (inv) => inv.invoiceDate.slice(0, 7) === todayStr.slice(0, 7)
    );

    if (existingThisMonth && !options?.force) {
      return {
        success: false,
        error: `Zero Double-Billing Guard: Invoice ${existingThisMonth.invoiceNumber} already exists for this billing period (${todayStr.slice(0, 7)}).`,
      };
    }

    // Determine billing period: if force generated, advance cycle to next period
    let periodStart = todayStr;
    const periodEndObj = new Date();
    if (sub.billingFrequency === 'YEARLY') periodEndObj.setFullYear(periodEndObj.getFullYear() + 1);
    else if (sub.billingFrequency === 'WEEKLY') periodEndObj.setDate(periodEndObj.getDate() + 7);
    else if (sub.billingFrequency === 'DAILY') periodEndObj.setDate(periodEndObj.getDate() + 1);
    else periodEndObj.setMonth(periodEndObj.getMonth() + 1);

    if (existingInvoices.length > 0) {
      const sorted = [...existingInvoices].sort((a, b) => b.billingPeriodEnd.localeCompare(a.billingPeriodEnd));
      const latestEnd = sorted[0]?.billingPeriodEnd;
      if (latestEnd) {
        const nextStart = new Date(latestEnd);
        nextStart.setDate(nextStart.getDate() + 1);
        periodStart = nextStart.toISOString().split('T')[0];

        const nextEnd = new Date(nextStart);
        if (sub.billingFrequency === 'YEARLY') nextEnd.setFullYear(nextEnd.getFullYear() + 1);
        else if (sub.billingFrequency === 'WEEKLY') nextEnd.setDate(nextEnd.getDate() + 7);
        else if (sub.billingFrequency === 'DAILY') nextEnd.setDate(nextEnd.getDate() + 1);
        else nextEnd.setMonth(nextEnd.getMonth() + 1);
        periodEndObj.setTime(nextEnd.getTime());
      }
    }

    // Auto-calculate discounts if applicable
    let totalDiscount = sub.discountTotal;
    const eligibleDiscount = discounts.find((d) => {
      if (!d.isActive) return false;
      if (d.usageCount >= d.maxUsageLimit) return false;
      const today = new Date();
      if (new Date(d.startDate) > today || new Date(d.endDate) < today) return false;
      if (d.minPurchaseAmount && sub.subtotal < d.minPurchaseAmount) return false;
      return true;
    });

    if (eligibleDiscount && totalDiscount === 0) {
      if (eligibleDiscount.type === 'PERCENTAGE') {
        totalDiscount = (sub.subtotal * eligibleDiscount.value) / 100;
      } else {
        totalDiscount = Math.min(eligibleDiscount.value, sub.subtotal);
      }
      // Increment discount usage
      setDiscounts((prev) =>
        prev.map((d) => (d.id === eligibleDiscount.id ? { ...d, usageCount: d.usageCount + 1 } : d))
      );
    }

    const calculatedTax = Math.round(((sub.subtotal - totalDiscount) * 18) / 100 * 100) / 100;
    const grandTotal = Math.max(0, sub.subtotal - totalDiscount + calculatedTax);

    // Calculate due date (Net 15 default)
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const nextInvNum = invoices.length + 1;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: `INV-2026-${String(nextInvNum).padStart(3, '0')}`,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEndObj.toISOString().split('T')[0],
      invoiceDate: todayStr,
      dueDate: dueDateStr,
      status: 'CONFIRMED',
      lines: sub.lines && sub.lines.length > 0
        ? sub.lines.map((l) => ({
            id: `iline-${Date.now()}-${l.id}`,
            productName: `${l.productName} ${l.variantName ? `(${l.variantName})` : ''}`,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            taxAmount: (l.lineTotal * l.taxRate) / 100,
            discountAmount: 0,
            total: l.lineTotal,
          }))
        : [
            {
              id: `iline-${Date.now()}-core`,
              productName: `${sub.planName} Recurring Package`,
              quantity: 1,
              unitPrice: sub.subtotal,
              taxRate: 18,
              taxAmount: calculatedTax,
              discountAmount: totalDiscount,
              total: sub.subtotal,
            },
          ],
      subtotal: sub.subtotal,
      taxTotal: calculatedTax,
      discountTotal: totalDiscount,
      grandTotal: grandTotal,
      amountPaid: 0,
      amountDue: grandTotal,
      notes: `Automated recurring billing generated for ${sub.subscriptionNumber}.`,
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    saveToLocal('invoices', updatedInvoices);

    // Update subscription lastBilledDate
    const updatedSubs = subscriptions.map((s) =>
      s.id === sub.id ? { ...s, lastBilledDate: todayStr } : s
    );
    setSubscriptions(updatedSubs);
    saveToLocal('subscriptions', updatedSubs);

    addNotification(
      `✓ Invoice ${newInvoice.invoiceNumber} ($${grandTotal.toFixed(2)}) generated for ${sub.customerName}.`,
      'success'
    );

    return { success: true, invoice: newInvoice };
  };

  // 3. Billing Day Batch Simulator
  const runBillingDay = (): BillingRunResult => {
    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE' && !s.isPaused);
    const result: BillingRunResult = {
      generatedCount: 0,
      skippedCount: 0,
      invoices: [],
      messages: [],
    };

    if (activeSubs.length === 0) {
      addNotification('Billing Run: No active subscriptions eligible for billing.', 'info');
      return result;
    }

    let totalBilled = 0;
    activeSubs.forEach((sub) => {
      // Force next cycle generation in simulated batch billing run
      const genResult = generateInvoiceForSubscription(sub.id, { force: true });
      if (genResult.success && genResult.invoice) {
        result.generatedCount++;
        result.invoices.push(genResult.invoice);
        totalBilled += genResult.invoice.grandTotal;
        result.messages.push(`Generated ${genResult.invoice.invoiceNumber} for ${sub.customerName} ($${genResult.invoice.grandTotal.toFixed(2)})`);
      } else {
        result.skippedCount++;
        result.messages.push(`Skipped ${sub.subscriptionNumber}: ${genResult.error}`);
      }
    });

    addNotification(
      `⚡ Batch Billing Run Completed: ${result.generatedCount} invoice(s) generated ($${totalBilled.toFixed(2)} total billed).`,
      'success'
    );
    return result;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    setInvoices(updated);
    saveToLocal('invoices', updated);
    addNotification(`Invoice status set to ${status}`);
  };

  // 4. Payment Recording
  const recordPayment = (
    paymentData: Omit<Payment, 'id' | 'paymentNumber'>
  ): { success: boolean; error?: string } => {
    const targetInvoice = invoices.find((inv) => inv.id === paymentData.invoiceId);
    if (!targetInvoice) return { success: false, error: 'Target invoice not found.' };

    const newAmountPaid = Number((targetInvoice.amountPaid + paymentData.amount).toFixed(2));
    const newAmountDue = Math.max(0, Number((targetInvoice.grandTotal - newAmountPaid).toFixed(2)));
    const isFullyPaid = newAmountDue <= 0.01;

    const nextPayNum = payments.length + 1;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${String(nextPayNum).padStart(3, '0')}`,
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    saveToLocal('payments', updatedPayments);

    const updatedInvoices = invoices.map((inv) => {
      if (inv.id !== targetInvoice.id) return inv;
      return {
        ...inv,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: isFullyPaid ? ('PAID' as InvoiceStatus) : inv.status,
      };
    });
    setInvoices(updatedInvoices);
    saveToLocal('invoices', updatedInvoices);

    addNotification(
      `Recorded payment of $${paymentData.amount.toFixed(2)} via ${paymentData.method}. ${isFullyPaid ? 'Invoice marked PAID!' : `Balance: $${newAmountDue.toFixed(2)}`}`
    );
    return { success: true };
  };

  // 5. Admin Discount Operations
  const createDiscountRule = (
    ruleData: Omit<DiscountRule, 'id' | 'usageCount'>
  ): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can create discount rules.', 'error');
      return { success: false, error: 'Unauthorized role.' };
    }
    const newRule: DiscountRule = {
      ...ruleData,
      id: `disc-${Date.now()}`,
      usageCount: 0,
    };
    const updated = [newRule, ...discounts];
    setDiscounts(updated);
    saveToLocal('discounts', updated);
    addNotification(`Discount Rule "${newRule.code}" created.`);
    return { success: true };
  };

  const toggleDiscountActive = (id: string) => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can modify discount rules.', 'error');
      return;
    }
    const updated = discounts.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    setDiscounts(updated);
    saveToLocal('discounts', updated);
  };

  // 6. Admin Tax Operations
  const createTaxRule = (ruleData: Omit<TaxRule, 'id'>): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can configure tax rules.', 'error');
      return { success: false, error: 'Unauthorized role.' };
    }
    const newTax: TaxRule = {
      ...ruleData,
      id: `tax-${Date.now()}`,
    };
    const updated = [...taxRules, newTax];
    setTaxRules(updated);
    saveToLocal('taxRules', updated);
    addNotification(`Tax Rule "${newTax.name}" (${newTax.rate}%) configured.`);
    return { success: true };
  };

  const updateTaxRule = (taxId: string, data: Partial<TaxRule>): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can modify tax rules.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = taxRules.find((t) => t.id === taxId);
    if (!target) return { success: false, error: 'Tax rule not found.' };

    let updated = taxRules.map((t) => (t.id === taxId ? { ...t, ...data } : t));
    if (data.isDefault) {
      updated = updated.map((t) => (t.id === taxId ? t : { ...t, isDefault: false }));
    }
    setTaxRules(updated);
    saveToLocal('taxRules', updated);
    addNotification(`Tax rule "${data.name || target.name}" updated successfully.`);
    return { success: true };
  };

  const deleteTaxRule = (taxId: string): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can delete tax rules.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = taxRules.find((t) => t.id === taxId);
    if (!target) return { success: false, error: 'Tax rule not found.' };

    const updated = taxRules.filter((t) => t.id !== taxId);
    setTaxRules(updated);
    saveToLocal('taxRules', updated);
    addNotification(`Tax rule "${target.name}" removed.`, 'info');
    return { success: true };
  };

  // 7. Product & Variant Management
  const createProduct = (productData: Omit<Product, 'id' | 'variants'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      variants: [],
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    saveToLocal('products', updated);
    addNotification(`Product "${newProd.name}" added to catalog.`);
    return newProd;
  };

  const updateProduct = (productId: string, data: Partial<Product>): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can edit products.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, error: 'Product not found.' };

    const updated = products.map((p) => (p.id === productId ? { ...p, ...data } : p));
    setProducts(updated);
    saveToLocal('products', updated);
    addNotification(`Product "${data.name || target.name}" updated successfully.`);
    return { success: true };
  };

  const deleteProduct = (productId: string): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can delete products.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, error: 'Product not found.' };

    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveToLocal('products', updated);
    addNotification(`Product "${target.name}" removed from catalog.`, 'info');
    return { success: true };
  };

  const addProductVariant = (
    productId: string,
    variant: { name: string; attributeName: string; attributeValue: string; priceDelta: number }
  ) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      const newVar = {
        id: `var-${Date.now()}`,
        productId,
        ...variant,
      };
      return { ...p, variants: [...p.variants, newVar] };
    });
    setProducts(updated);
    saveToLocal('products', updated);
    addNotification(`Variant "${variant.name}" added.`);
  };

  // 8. Plan Operations
  const createPlan = (planData: Omit<Plan, 'id'>): Plan => {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    const updated = [newPlan, ...plans];
    setPlans(updated);
    saveToLocal('plans', updated);
    addNotification(`Subscription Plan "${newPlan.name}" configured.`);
    return newPlan;
  };

  const updatePlan = (planId: string, planData: Partial<Plan>): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can modify subscription plans.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = plans.find((p) => p.id === planId);
    if (!target) return { success: false, error: 'Plan not found.' };

    const updated = plans.map((p) => (p.id === planId ? { ...p, ...planData } : p));
    setPlans(updated);
    saveToLocal('plans', updated);
    addNotification(`Subscription Plan "${planData.name || target.name}" updated successfully.`);
    return { success: true };
  };

  const deletePlan = (planId: string): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can delete subscription plans.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const planToDelete = plans.find((p) => p.id === planId);
    if (!planToDelete) return { success: false, error: 'Plan not found.' };

    const updated = plans.filter((p) => p.id !== planId);
    setPlans(updated);
    saveToLocal('plans', updated);
    addNotification(`Subscription Plan "${planToDelete.name}" removed.`, 'info');
    return { success: true };
  };

  // 9. Staff Management (Admin only)
  const addStaffMember = (name: string, email: string): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can add new staff members.', 'error');
      return { success: false, error: 'Unauthorized role.' };
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      addNotification('A user with this email already exists.', 'error');
      return { success: false, error: 'Email already exists.' };
    }
    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      name,
      email,
      role: 'STAFF',
      companyName: 'Brightloop Internal Staff',
    };
    const updated = [...users, newStaff];
    setUsers(updated);
    saveToLocal('users', updated);
    addNotification(`New staff member "${name}" invited successfully.`);
    return { success: true };
  };

  const updateStaffMember = (
    userId: string,
    data: { name: string; email: string; role?: Role }
  ): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can modify staff members.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'Staff member not found.' };

    const updated = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            name: data.name,
            email: data.email,
            role: data.role || u.role,
          }
        : u
    );
    setUsers(updated);
    saveToLocal('users', updated);
    addNotification(`Staff member "${data.name}" updated successfully.`);
    return { success: true };
  };

  const deleteStaffMember = (userId: string): { success: boolean; error?: string } => {
    if (!isAdmin) {
      addNotification('Access Denied: Only Admin can remove staff members.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    if (userId === currentUser.id) {
      addNotification('Security Guard: You cannot delete your currently logged-in account.', 'error');
      return { success: false, error: 'Cannot delete current account.' };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'Staff member not found.' };

    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveToLocal('users', updated);
    addNotification(`Staff member "${target.name}" removed from roster.`, 'info');
    return { success: true };
  };

  // 10. Customer Signup / Registration
  const registerCustomer = (
    name: string,
    email: string,
    password: string,
    companyName?: string
  ): { success: boolean; error?: string } => {
    // Unique email check
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      addNotification('This email is already registered. Please sign in.', 'error');
      return { success: false, error: 'Email already exists.' };
    }
    // Strict password policy
    const valResult = validatePassword(password);
    if (!valResult.isValid) {
      addNotification('Password does not meet the security requirements.', 'error');
      return {
        success: false,
        error: 'Password must be > 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.',
      };
    }

    const newCustomer: User = {
      id: `user-cust-${Date.now()}`,
      name,
      email,
      role: 'CUSTOMER',
      companyName: companyName || `${name}'s Company`,
    };
    const updated = [...users, newCustomer];
    setUsers(updated);
    saveToLocal('users', updated);
    setCurrentUser(newCustomer);
    setIsAuthenticated(true);
    addNotification(`Welcome ${name}! Your customer portal account is ready.`);
    return { success: true };
  };

  return (
    <BrightloopContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        products,
        plans,
        subscriptions,
        invoices,
        payments,
        discounts,
        taxRules,
        quotationTemplates,
        notifications,
        dismissNotification,
        addNotification,
        resetDemoData,

        isAuthenticated,
        setIsAuthenticated,
        loginWithRole,
        loginWithEmail,
        logout,

        isAdmin,
        isStaff,
        isCustomer,

        createSubscription,
        updateSubscriptionStatus,
        pauseSubscription,
        resumeSubscription,
        renewSubscription,
        closeSubscription,

        generateInvoiceForSubscription,
        runBillingDay,
        updateInvoiceStatus,

        recordPayment,

        createDiscountRule,
        toggleDiscountActive,

        createTaxRule,
        updateTaxRule,
        deleteTaxRule,

        createProduct,
        updateProduct,
        deleteProduct,
        addProductVariant,

        createPlan,
        updatePlan,
        deletePlan,

        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        registerCustomer,
      }}
    >
      {children}
    </BrightloopContext.Provider>
  );
}

export function useBrightloop() {
  const context = useContext(BrightloopContext);
  if (!context) {
    throw new Error('useBrightloop must be used within a BrightloopProvider');
  }
  return context;
}
