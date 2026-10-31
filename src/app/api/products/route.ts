import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type = 'SOFTWARE', salesPrice, costPrice = 0, notes, variants = [] } = body;

    const product = await prisma.product.create({
      data: {
        name,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        notes,
        variants: {
          create: variants.map((v: any) => ({
            variantName: v.variantName,
            priceAdjustment: Number(v.priceAdjustment) || 0,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
