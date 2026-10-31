'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Zap,
  TrendingUp,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionPayload?: {
    type: 'email' | 'discount' | 'analytics';
    title: string;
    content: string;
  };
}

export default function AICopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am Brightloop Copilot — your autonomous B2B subscription and revenue intelligence assistant. How can I help you optimize your billing operations today?',
      time: 'Just now',
    },
  ]);

  const promptChips = [
    {
      label: '⚡ Analyze Cashflow & Overdue Risk',
      query: 'Analyze our current cashflow risk and overdue invoices.',
      answer: `📊 **Cashflow & Collections Audit:**
• **Total Receivables Outstanding:** $14,750 (Invoice INV-2026-0002)
• **Primary At-Risk Account:** CloudPulse Technologies Pvt Ltd (16 days overdue)
• **Collection Efficiency:** 92.4% (Industry benchmark: >85% is strong)
• **Recommendation:** Immediate automated dunning trigger with dynamic UPI payment link to avoid involuntary churn.`,
    },
    {
      label: '🎯 Customer Churn & Health Radar',
      query: 'Which customers have high churn risk and need immediate retention?',
      answer: `🎯 **Customer Risk Assessment:**
• 🔴 **CloudPulse Tech (Health: 58/100 - Critical):** Unpaid annual renewal ($14,750). Auto-renew mandate pending confirmation.
• 🟡 **Green Logistics (Health: 76/100 - Moderate):** Quotation SUB-2026-0003 pending sign-off for 15 days.
• 🟢 **Nexus Retail (Health: 94/100 - Exemplary):** $8,491 paid on-time with Enterprise White-label Edition.

⚡ **Suggested Action:** Send a 10% early-settlement incentive to CloudPulse Tech to recover cashflow immediately.`,
    },
    {
      label: '📝 Auto-Draft Payment Reminder Email',
      query: 'Draft a professional payment follow-up email for CloudPulse Technologies.',
      answer: `Here is a personalized enterprise follow-up email ready to dispatch:`,
      actionPayload: {
        type: 'email',
        title: 'Subject: Gentle Reminder: Invoice INV-2026-0002 for CloudPulse Technologies (Due Date Passed)',
        content: `Dear Ananya Desai & Finance Team,

Greetings from Brightloop Software.

We hope you are having a productive quarter with your Brightloop ERP Core Suite. This is a gentle reminder regarding Invoice INV-2026-0002 for $14,750 (including 18% GST), which was due on October 30, 2026.

Invoice Details:
• Invoice Number: INV-2026-0002
• Amount Due: $14,750.00 (Net 15 Terms)
• Direct Payment Portal: https://brightloop-subscriptions-7xqd.vercel.app/portal

To ensure uninterrupted access to your dedicated 24/7 SLA servers, please settle this balance via Bank Transfer (IMPS/NEFT) or Instant UPI Autopay.

Thank you for being a valued Brightloop partner.

Warm regards,
Accounts Receivable & Treasury Team
Brightloop Software HQ`,
      },
    },
    {
      label: '💡 Suggest Retention Discount Rule',
      query: 'Suggest an optimal discount rule for customer renewals to protect gross margins.',
      answer: `💡 **AI Margin-Protection Recommendation:**
• **Discount Rule Name:** Enterprise Seat Expansion Incentive
• **Type:** 15% Percentage Off (Capped)
• **Eligibility Threshold:** Minimum 5 Seats or $5,000 Purchase
• **Hard Usage Cap:** Max 25 redemptions across all subscriptions
• **Margin Impact:** Preserves 68% software gross margin while reducing voluntary churn by an estimated 28%.`,
    },
  ];

  const handleSend = (textToSend?: string) => {
    const userQuery = textToSend || input;
    if (!userQuery.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Find matched pre-built prompt or generate dynamic heuristic answer
    setTimeout(() => {
      const matched = promptChips.find(
        (chip) => chip.query.toLowerCase() === userQuery.toLowerCase()
      );

      let aiResponseText = '';
      let payload = matched?.actionPayload;

      if (matched) {
        aiResponseText = matched.answer;
      } else if (userQuery.toLowerCase().includes('odoo') || userQuery.toLowerCase().includes('enterprise')) {
        aiResponseText = `🏢 **Enterprise Integration Overview:**\nChoosing the "Brand: Enterprise White-label Edition" dynamically adds a **+$850.00 price delta** per seat to baseline software pricing. This has contributed **+$1,700.00 in Expansion MRR** this quarter!`;
      } else if (userQuery.toLowerCase().includes('billing') || userQuery.toLowerCase().includes('run')) {
        aiResponseText = `⚡ **Billing Engine Status:**\nThe automated billing engine operates with **strict idempotency safeguards**. No subscription can be billed twice within the same cycle period. Click "⚡ Run Billing Day" in the top bar to trigger the automated batch.`;
      } else {
        aiResponseText = `🤖 **Brightloop AI Insight:**\nRegarding "${userQuery}": Our real-time database indicates **$12,420 MRR**, with 2 active subscriptions and 1 pipeline quotation. All GST lines (18%) and discount governance limits are currently healthy with zero margin leakage detected.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPayload: payload,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-xl shadow-purple-600/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/30"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide">Brightloop AI</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase font-bold text-purple-100">
            Copilot
          </span>
        </button>
      </div>

      {/* Slide-over Copilot Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Brightloop Copilot</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Autonomous
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Enterprise Revenue & Risk Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Instant Intelligence Actions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="text-[11px] bg-slate-800/70 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/40 px-2.5 py-1.5 rounded-lg text-left transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Interactive Action Payload (e.g. Email Draft) */}
                  {msg.actionPayload && (
                    <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-700 text-slate-300 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {msg.actionPayload.title}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(msg.id, `${msg.actionPayload?.title}\n\n${msg.actionPayload?.content}`)
                          }
                          className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Email
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-[11px] font-sans whitespace-pre-wrap text-slate-300">
                        {msg.actionPayload.content}
                      </pre>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 mt-1.5 text-right">{msg.time}</div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot about MRR, churn risk, or billing..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
