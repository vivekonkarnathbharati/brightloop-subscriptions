import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, method = 'BANK_TRANSFER', amount, referenceNote } = body;

    const parsedAmount = Number(amount);
    if (!invoiceId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid invoiceId and positive amount are required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Record the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        method,
        amount: parsedAmount,
        referenceNote: referenceNote || 'Payment recorded via portal',
      },
    });

    const newPaidAmount = invoice.paidAmount + parsedAmount;
    const isFullyPaid = newPaidAmount >= invoice.totalAmount;

    // Update invoice paidAmount and status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? 'PAID' : invoice.status,
      },
      include: {
        customer: true,
        lines: true,
        payments: true,
      },
    });

    return NextResponse.json({ payment, invoice: updatedInvoice }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
