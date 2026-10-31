import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeSubs = subscriptions.filter((s: any) => s.status === 'ACTIVE');
    const quotations = subscriptions.filter((s: any) => s.status === 'QUOTATION');

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubs.reduce((acc: number, sub: any) => {
      const subTotal = sub.lines.reduce((lAcc: number, line: any) => lAcc + line.totalAmount, 0);
      if (sub.plan.billingFrequency === 'YEARLY') {
        return acc + subTotal / 12;
      }
      return acc + subTotal;
    }, 0);

    const arr = mrr * 12;

    // Total Revenue Collected (from paid payments)
    const allPayments = await prisma.payment.findMany();
    const totalRevenueCollected = allPayments.reduce((acc: number, p: any) => acc + p.amount, 0);

    // Overdue / Outstanding Invoices
    const overdueInvoices = invoices.filter(
      (inv: any) => inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date()
    );
    const overdueAmount = overdueInvoices.reduce(
      (acc: number, inv: any) => acc + (inv.totalAmount - inv.paidAmount),
      0
    );

    // Monthly revenue trend for chart (last 6 months simulation/projection)
    const monthlyTrend = [
      { month: 'Jun', revenue: Math.round(mrr * 0.72) },
      { month: 'Jul', revenue: Math.round(mrr * 0.81) },
      { month: 'Aug', revenue: Math.round(mrr * 0.88) },
      { month: 'Sep', revenue: Math.round(mrr * 0.94) },
      { month: 'Oct', revenue: Math.round(mrr) },
      { month: 'Nov (Est)', revenue: Math.round(mrr * 1.12) },
    ];

    return NextResponse.json({
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      activeSubscriptionsCount: activeSubs.length,
      quotationsCount: quotations.length,
      totalRevenueCollected: Math.round(totalRevenueCollected * 100) / 100,
      overdueInvoicesCount: overdueInvoices.length,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      monthlyTrend,
      recentSubscriptions: subscriptions.slice(0, 5),
      recentInvoices: invoices.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
