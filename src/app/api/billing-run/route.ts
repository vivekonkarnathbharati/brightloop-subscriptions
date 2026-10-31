import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
        invoices: true,
      },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let createdCount = 0;
    let skippedCount = 0;
    const generatedInvoices = [];

    for (const sub of activeSubscriptions) {
      // Check if already billed this calendar month
      const alreadyBilled = sub.invoices.some((inv) => {
        const invDate = new Date(inv.issueDate);
        return (
          invDate.getMonth() === currentMonth &&
          invDate.getFullYear() === currentYear &&
          inv.status !== 'CANCELLED'
        );
      });

      if (alreadyBilled) {
        skippedCount++;
        continue;
      }

      // Generate Invoice
      const count = await prisma.invoice.count();
      const invoiceNumber = `INV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      let subtotal = 0;
      let taxAmount = 0;
      const invoiceLines = sub.lines.map((l) => {
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

      const totalAmount = subtotal + taxAmount;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Net 15 default

      const newInv = await prisma.invoice.create({
        data: {
          invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          dueDate,
          status: 'CONFIRMED',
          subtotal,
          taxAmount,
          discountAmount: 0,
          totalAmount,
          paidAmount: 0,
          notes: `Batch-generated on Automated Billing Day for ${sub.plan.name}`,
          lines: {
            create: invoiceLines,
          },
        },
      });

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastBilledAt: now },
      });

      createdCount++;
      generatedInvoices.push(newInv);
    }

    return NextResponse.json({
      success: true,
      createdCount,
      skippedCount,
      message: `Billing Day completed! Created ${createdCount} new invoice(s), skipped ${skippedCount} already-billed subscription(s).`,
      generatedInvoices,
    });
  } catch (error) {
    console.error('Error executing billing run:', error);
    return NextResponse.json({ error: 'Failed to execute billing run' }, { status: 500 });
  }
}
