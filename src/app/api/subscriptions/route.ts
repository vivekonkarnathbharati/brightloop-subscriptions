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

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, planId, paymentTerms, status = 'DRAFT', notes, lines = [] } = body;

    // Generate auto subscription number
    const count = await prisma.subscription.count();
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let computedLines = [];
    for (const line of lines) {
      const product = await prisma.product.findUnique({ where: { id: line.productId } });
      let unitPrice = product ? product.salesPrice : 0;

      if (line.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: line.variantId } });
        if (variant) unitPrice += variant.priceAdjustment;
      }

      const qty = Number(line.quantity) || 1;
      const subtotal = unitPrice * qty;
      const taxRate = 18.0; // 18% standard GST
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      computedLines.push({
        productId: line.productId,
        variantId: line.variantId || null,
        quantity: qty,
        unitPrice,
        taxRate,
        taxAmount,
        subtotal,
        totalAmount,
      });
    }

    const newSub = await prisma.subscription.create({
      data: {
        subscriptionNumber,
        customerId,
        planId,
        paymentTerms: paymentTerms || 'Net 15',
        status, // DRAFT, QUOTATION, or ACTIVE
        notes,
        lines: {
          create: computedLines,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json(newSub, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Subscription ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
  }
}
