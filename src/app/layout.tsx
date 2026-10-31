import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management & Automated Billing Engine',
  description:
    'Full-stack subscription management, automated recurring billing, discount engine, and executive finance dashboard for Brightloop Software (Odoo Hackathon 2026).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
