import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(discounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, type = 'PERCENTAGE', value, minQuantity = 1, minPurchaseAmount = 0, maxUsageLimit = 100 } = body;

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        type,
        value: Number(value),
        minQuantity: Number(minQuantity),
        minPurchaseAmount: Number(minPurchaseAmount),
        maxUsageLimit: Number(maxUsageLimit),
        isActive: true,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create discount rule' }, { status: 500 });
  }
}
