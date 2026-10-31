import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Subscription, Invoice } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateMRR(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.status === 'ACTIVE' && !s.isPaused)
    .reduce((total, sub) => {
      const subTotal = sub.grandTotal;
      switch (sub.billingFrequency) {
        case 'DAILY':
          return total + subTotal * 30;
        case 'WEEKLY':
          return total + subTotal * 4.3333;
        case 'MONTHLY':
          return total + subTotal;
        case 'YEARLY':
          return total + subTotal / 12;
        default:
          return total + subTotal;
      }
    }, 0);
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  // Password must be MORE than 8 characters (> 8, so at least 9 chars)
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasSpecialChar,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasSpecialChar,
  };
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(invoice.dueDate);
  return due < today;
}
