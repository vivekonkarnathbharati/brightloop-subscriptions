'use client';

import React, { useState, useEffect } from 'react';
import { BrightloopProvider, useBrightloop } from '@/lib/store';
import { SignInPage } from '@/components/auth/SignInPage';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { InvoicesView } from '@/components/invoices/InvoicesView';
import { PaymentsView } from '@/components/payments/PaymentsView';
import { ProductsView } from '@/components/products/ProductsView';
import { PlansView } from '@/components/plans/PlansView';
import { DiscountsView } from '@/components/discounts/DiscountsView';
import { TaxesView } from '@/components/taxes/TaxesView';
import { StaffView } from '@/components/staff/StaffView';
import { CustomerPortalView } from '@/components/portal/CustomerPortalView';
import { NewSubscriptionView } from '@/components/portal/NewSubscriptionView';
import { AuthValidatorView } from '@/components/auth/AuthValidatorView';

function AppContent() {
  const { isCustomer, isAuthenticated } = useBrightloop();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<string | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Customer can only access portal and new_subscription
  useEffect(() => {
    if (isCustomer && activeTab !== 'portal' && activeTab !== 'new_subscription') {
      setActiveTab('portal');
    }
  }, [isCustomer, activeTab]);

  const handleRecordPaymentForInvoice = (invoiceId: string) => {
    setSelectedInvoiceForPayment(invoiceId);
    setActiveTab('payments');
  };

  // FIRST SCREEN: Show the dedicated Sign-In page if not signed in!
  if (!isAuthenticated) {
    return (
      <>
        <SignInPage />
        <ToastContainer />
      </>
    );
  }

  // Main platform workspace:
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 bg-[#FAF7F2] text-[#2C2621] selection:bg-[#E2D2BE] selection:text-[#362A1F]">
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'subscriptions' && <SubscriptionsView />}
          {activeTab === 'invoices' && (
            <InvoicesView onRecordPayment={handleRecordPaymentForInvoice} />
          )}
          {activeTab === 'payments' && (
            <PaymentsView defaultInvoiceId={selectedInvoiceForPayment} />
          )}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'plans' && <PlansView />}
          {activeTab === 'discounts' && <DiscountsView />}
          {activeTab === 'taxes' && <TaxesView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'portal' && (
            <CustomerPortalView onPayInvoice={handleRecordPaymentForInvoice} />
          )}
          {activeTab === 'new_subscription' && (
            <NewSubscriptionView onComplete={() => setActiveTab('portal')} />
          )}
          {activeTab === 'auth_validator' && !isCustomer && <AuthValidatorView />}
        </main>
      </div>

      {/* Unified Login & Customer Registration Modal */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <BrightloopProvider>
      <AppContent />
    </BrightloopProvider>
  );
}
