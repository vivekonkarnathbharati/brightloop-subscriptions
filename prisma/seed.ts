import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Brightloop Subscriptions...');

  // 1. Clean existing records
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Admin, Staff, Customers)
  const admin = await prisma.user.create({
    data: {
      name: 'Brightloop Administrator',
      email: 'admin@brightloop.io',
      password: 'AdminPassword@2026', // Validates >8, upper, lower, special
      role: 'ADMIN',
      companyName: 'Brightloop HQ',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins (Sales Rep)',
      email: 'sarah.sales@brightloop.io',
      password: 'SalesPassword@2026',
      role: 'STAFF',
      companyName: 'Brightloop Sales',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'rajesh@nexusretail.in',
      password: 'NexusCustomer@2026',
      role: 'CUSTOMER',
      companyName: 'Nexus Retail Enterprises',
      phone: '+91 98201 12345',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Ananya Desai',
      email: 'ananya@cloudpulsetech.com',
      password: 'CloudPulse@2026',
      role: 'CUSTOMER',
      companyName: 'CloudPulse Technologies Pvt Ltd',
      phone: '+91 98450 67890',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Vikram Mehta',
      email: 'vikram@greenlogistics.co',
      password: 'GreenLogistics@2026',
      role: 'CUSTOMER',
      companyName: 'Green Logistics Express',
      phone: '+91 97110 54321',
    },
  });

  console.log('✅ Created users: Admin, Staff, and 3 Enterprise Customers');

  // 3. Tax Rule
  await prisma.taxRule.create({
    data: {
      name: 'Standard GST (18%)',
      rate: 18.0,
      isDefault: true,
    },
  });

  // 4. Products & Variants (with the exact Odoo variant requirement from PDF!)
  const erpSoftware = await prisma.product.create({
    data: {
      name: 'Brightloop ERP Core Suite',
      type: 'SOFTWARE',
      salesPrice: 2400.0,
      costPrice: 800.0,
      notes: 'Full ERP system with inventory and subscription modules',
      variants: {
        create: [
          {
            variantName: 'Brand: Standard Edition',
            priceAdjustment: 0.0,
          },
          {
            variantName: 'Brand: Odoo Enterprise Edition',
            priceAdjustment: 560.0, // Explicitly mentioned in problem statement!
          },
        ],
      },
    },
    include: { variants: true },
  });

  const crmAddon = await prisma.product.create({
    data: {
      name: 'OmniChannel CRM & Pipeline Add-on',
      type: 'ADDON',
      salesPrice: 850.0,
      costPrice: 200.0,
      notes: 'Lead tracking and quotation conversion suite',
    },
  });

  const prioritySupport = await prisma.product.create({
    data: {
      name: '24/7 Dedicated Support SLA',
      type: 'SERVICE',
      salesPrice: 500.0,
      costPrice: 150.0,
      notes: 'Dedicated account manager with 15-minute SLA',
    },
  });

  console.log('✅ Created products & variants (including +$560 Odoo brand variant)');

  // 5. Subscription Plans
  const monthlyPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise Growth Monthly',
      description: 'Monthly recurring plan with flexible seat allocation',
      cost: 2960.0,
      billingFrequency: 'MONTHLY',
      minQuantity: 1,
      canPause: true,
      canRenew: true,
      autoCloseOnEnd: false,
    },
  });

  const yearlyPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Corporate Scale Yearly (15% Off)',
      description: 'Annual billed subscription with priority dedicated server',
      cost: 32000.0,
      billingFrequency: 'YEARLY',
      minQuantity: 5,
      canPause: false,
      canRenew: true,
      autoCloseOnEnd: false,
    },
  });

  // 6. Discounts (Admin defined rules)
  await prisma.discount.create({
    data: {
      code: 'STARTUP20',
      name: 'Startup Ecosystem 20% Discount',
      type: 'PERCENTAGE',
      value: 20.0,
      minQuantity: 1,
      minPurchaseAmount: 1000.0,
      maxUsageLimit: 50,
      currentUsageCount: 4,
      appliesToAll: true,
      isActive: true,
    },
  });

  await prisma.discount.create({
    data: {
      code: 'FLAT500',
      name: 'Loyalty Reward $500 Off',
      type: 'FIXED',
      value: 500.0,
      minQuantity: 1,
      minPurchaseAmount: 2000.0,
      maxUsageLimit: 20,
      currentUsageCount: 2,
      appliesToAll: true,
      isActive: true,
    },
  });

  // 7. Subscriptions (across different lifecycles: Active, Quotation, Draft)
  const odooVariant = erpSoftware.variants.find((v: any) => v.variantName.includes('Odoo'));

  // Active Subscription 1 for Nexus Retail
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: customer1.id,
      planId: monthlyPlan.id,
      startDate: new Date('2026-10-01'),
      expiryDate: new Date('2027-10-01'),
      paymentTerms: 'Net 15',
      status: 'ACTIVE',
      lastBilledAt: new Date('2026-10-01'),
      notes: 'Migrated from spreadsheets without loss of history.',
      lines: {
        create: [
          {
            productId: erpSoftware.id,
            variantId: odooVariant?.id,
            quantity: 2,
            unitPrice: 2960.0, // 2400 + 560
            taxRate: 18.0,
            taxAmount: 1065.6,
            subtotal: 5920.0,
            totalAmount: 6985.6,
          },
          {
            productId: crmAddon.id,
            quantity: 2,
            unitPrice: 850.0,
            taxRate: 18.0,
            taxAmount: 306.0,
            subtotal: 1700.0,
            totalAmount: 2006.0,
          },
        ],
      },
    },
  });

  // Active Subscription 2 for CloudPulse Tech
  const sub2 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0002',
      customerId: customer2.id,
      planId: yearlyPlan.id,
      startDate: new Date('2026-09-15'),
      expiryDate: new Date('2027-09-15'),
      paymentTerms: 'Immediate',
      status: 'ACTIVE',
      lastBilledAt: new Date('2026-09-15'),
      lines: {
        create: [
          {
            productId: erpSoftware.id,
            quantity: 5,
            unitPrice: 2400.0,
            taxRate: 18.0,
            taxAmount: 2160.0,
            subtotal: 12000.0,
            totalAmount: 14160.0,
          },
          {
            productId: prioritySupport.id,
            quantity: 1,
            unitPrice: 500.0,
            taxRate: 18.0,
            taxAmount: 90.0,
            subtotal: 500.0,
            totalAmount: 590.0,
          },
        ],
      },
    },
  });

  // Quotation in pipeline for Green Logistics
  await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0003',
      customerId: customer3.id,
      planId: monthlyPlan.id,
      startDate: new Date('2026-11-01'),
      expiryDate: new Date('2027-11-01'),
      paymentTerms: 'Net 30',
      status: 'QUOTATION',
      notes: 'Pending customer finance sign-off on 15-day validity.',
      lines: {
        create: [
          {
            productId: erpSoftware.id,
            variantId: odooVariant?.id,
            quantity: 3,
            unitPrice: 2960.0,
            taxRate: 18.0,
            taxAmount: 1598.4,
            subtotal: 8880.0,
            totalAmount: 10478.4,
          },
        ],
      },
    },
  });

  // 8. Invoices (Generated from Subscriptions)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      subscriptionId: sub1.id,
      customerId: customer1.id,
      issueDate: new Date('2026-10-01'),
      dueDate: new Date('2026-10-16'),
      status: 'PAID',
      subtotal: 7620.0,
      taxAmount: 1371.6,
      discountAmount: 500.0,
      totalAmount: 8491.6,
      paidAmount: 8491.6,
      notes: 'Auto-billed on subscription renewal cycle.',
      lines: {
        create: [
          {
            description: 'Brightloop ERP Core Suite (Brand: Odoo Enterprise Edition) x 2',
            quantity: 2,
            unitPrice: 2960.0,
            taxRate: 18.0,
            taxAmount: 1065.6,
            discountAmount: 500.0,
            totalAmount: 6485.6,
          },
          {
            description: 'OmniChannel CRM & Pipeline Add-on x 2',
            quantity: 2,
            unitPrice: 850.0,
            taxRate: 18.0,
            taxAmount: 306.0,
            discountAmount: 0.0,
            totalAmount: 2006.0,
          },
        ],
      },
    },
  });

  // Payment for Invoice 1
  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      method: 'BANK_TRANSFER',
      amount: 8491.6,
      paymentDate: new Date('2026-10-05'),
      referenceNote: 'HDFC IMPS Ref: 429188402194 - Verified',
    },
  });

  // Invoice 2: Confirmed & Outstanding (Due soon)
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      subscriptionId: sub2.id,
      customerId: customer2.id,
      issueDate: new Date('2026-10-15'),
      dueDate: new Date('2026-10-30'),
      status: 'CONFIRMED', // Outstanding / Overdue
      subtotal: 12500.0,
      taxAmount: 2250.0,
      discountAmount: 0.0,
      totalAmount: 14750.0,
      paidAmount: 0.0,
      notes: 'Annual billing cycle invoice. Awaiting payment.',
      lines: {
        create: [
          {
            description: 'Brightloop ERP Core Suite x 5',
            quantity: 5,
            unitPrice: 2400.0,
            taxRate: 18.0,
            taxAmount: 2160.0,
            discountAmount: 0.0,
            totalAmount: 14160.0,
          },
          {
            description: '24/7 Dedicated Support SLA x 1',
            quantity: 1,
            unitPrice: 500.0,
            taxRate: 18.0,
            taxAmount: 90.0,
            discountAmount: 0.0,
            totalAmount: 590.0,
          },
        ],
      },
    },
  });

  console.log('🎉 Seeding successfully completed! Full ERP data loaded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
