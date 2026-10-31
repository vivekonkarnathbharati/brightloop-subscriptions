import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (customerId) where.customerId = customerId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, discountCode } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
        invoices: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Business Rule Check: Do not double-bill within active cycle
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const alreadyBilledThisCycle = subscription.invoices.some((inv: any) => {
      const invDate = new Date(inv.issueDate);
      return (
        invDate.getMonth() === currentMonth &&
        invDate.getFullYear() === currentYear &&
        inv.status !== 'CANCELLED'
      );
    });

    if (alreadyBilledThisCycle) {
      return NextResponse.json(
        { error: `Subscription ${subscription.subscriptionNumber} has already been billed for this billing cycle! Preventing duplicate billing.` },
        { status: 400 }
      );
    }

    // Auto Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Compute Lines
    let subtotal = 0;
    let taxAmount = 0;
    const invoiceLines = subscription.lines.map((l: any) => {
      subtotal += l.subtotal;
      taxAmount += l.taxAmount;
      const desc = l.variant
        ? `${l.product.name} (${l.variant.variantName})`
        : l.product.name;
      return {
        description: `${desc} x ${l.quantity}`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        taxAmount: l.taxAmount,
        discountAmount: 0,
        totalAmount: l.totalAmount,
      };
    });

    // Check & Apply Discount if provided
    let discountAmount = 0;
    if (discountCode) {
      const discount = await prisma.discount.findUnique({ where: { code: discountCode } });
      if (
        discount &&
        discount.isActive &&
        discount.currentUsageCount < discount.maxUsageLimit &&
        subtotal >= discount.minPurchaseAmount
      ) {
        if (discount.type === 'PERCENTAGE') {
          discountAmount = (subtotal * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
        // Increment discount usage
        await prisma.discount.update({
          where: { id: discount.id },
          data: { currentUsageCount: { increment: 1 } },
        });
      }
    }

    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    // Due date calculated from payment terms
    const dueDate = new Date();
    if (subscription.paymentTerms === 'Net 30') {
      dueDate.setDate(dueDate.getDate() + 30);
    } else if (subscription.paymentTerms === 'Net 15') {
      dueDate.setDate(dueDate.getDate() + 15);
    } else {
      dueDate.setDate(dueDate.getDate() + 1); // Immediate
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        dueDate,
        status: 'CONFIRMED', // Confirmed and ready to be paid
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        notes: `Generated on Billing Day for plan: ${subscription.plan.name}`,
        lines: {
          create: invoiceLines,
        },
      },
      include: {
        customer: true,
        lines: true,
        payments: true,
      },
    });

    // Update subscription lastBilledAt
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { lastBilledAt: now },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, lines: true, payments: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
