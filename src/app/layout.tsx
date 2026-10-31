import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management & Recurring Billing',
  description: 'Enterprise ERP for plans, subscriptions, and automated billing. Built for Odoo Hackathon 2026.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  );
}
