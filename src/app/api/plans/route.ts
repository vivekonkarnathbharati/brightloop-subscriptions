import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, cost, billingFrequency = 'MONTHLY', minQuantity = 1, canPause = true, canRenew = true } = body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        cost: Number(cost),
        billingFrequency,
        minQuantity: Number(minQuantity),
        canPause: Boolean(canPause),
        canRenew: Boolean(canRenew),
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
