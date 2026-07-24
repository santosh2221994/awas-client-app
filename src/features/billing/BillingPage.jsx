import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Download, Calendar, TrendingUp, Zap, Shield } from 'lucide-react';
import Button from '../../components/Button';

const INVOICES = [
  { id: 'INV-2024-012', period: 'December 2024', amount: '$42.80', status: 'Paid', date: 'Dec 01, 2024' },
  { id: 'INV-2024-011', period: 'November 2024', amount: '$38.20', status: 'Paid', date: 'Nov 01, 2024' },
  { id: 'INV-2024-010', period: 'October 2024', amount: '$51.60', status: 'Paid', date: 'Oct 01, 2024' },
  { id: 'INV-2024-009', period: 'September 2024', amount: '$29.40', status: 'Paid', date: 'Sep 01, 2024' },
  { id: 'INV-2024-008', period: 'August 2024', amount: '$33.90', status: 'Paid', date: 'Aug 01, 2024' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    period: '/mo',
    description: 'Perfect for experimentation',
    features: ['5 automations', '10K tokens/mo', '1 LLM connection', 'Community support'],
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'For growing teams',
    features: ['Unlimited automations', '1M tokens/mo', 'Unlimited LLM connections', 'Priority support', 'Custom env vars', 'Advanced traces'],
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Large-scale deployments',
    features: ['Everything in Pro', 'SSO & SAML', 'Dedicated infra', 'SLA guarantee', 'Custom contracts', 'Dedicated CSM'],
    current: false,
  },
];

const USAGE_BARS = [
  { label: 'Automations', used: 18, limit: 'Unlimited', pct: 36, unit: '' },
  { label: 'Tokens (this month)', used: '842K', limit: '1M', pct: 84, unit: '' },
  { label: 'LLM Connections', used: 3, limit: 'Unlimited', pct: 60, unit: '' },
  { label: 'Team Members', used: 4, limit: 10, pct: 40, unit: '' },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Billing</h1>
          <p className="text-xs text-gray-500">Manage your subscription, payment method, and view invoices</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200/80 px-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {['Overview', 'Plans', 'Invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-0 py-3.5 text-xs font-semibold border-b-2 transition ${activeTab === tab
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {activeTab === 'Overview' && (
          <>
            {/* Current Plan Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">Pro Plan</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">CURRENT</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">$49/mo · Renews January 1, 2025</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="font-semibold border-gray-250 text-gray-700">
                    Manage Subscription
                  </Button>
                  <Button variant="brand" size="sm" className="font-semibold">
                    Upgrade to Enterprise
                  </Button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Payment Method</h3>
                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition">Update</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Visa ending in 4242</div>
                  <div className="text-xs text-gray-400 mt-0.5">Expires 08/27</div>
                </div>
                <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>
            </div>

            {/* Usage Meters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-800">Current Period Usage</h3>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Resets Jan 1, 2025
                </span>
              </div>
              <div className="space-y-5">
                {USAGE_BARS.map((u) => (
                  <div key={u.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">{u.label}</span>
                      <span className="text-[11px] text-gray-500">
                        {u.used} / {u.limit}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${u.pct >= 90 ? 'bg-red-500' : u.pct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${u.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spend Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Current Month', value: '$18.40', sub: 'Dec 1–17, 2024', icon: <Zap className="w-4 h-4" />, iconBg: 'bg-indigo-50 text-indigo-500' },
                { label: 'Last Month', value: '$42.80', sub: 'November 2024', icon: <Calendar className="w-4 h-4" />, iconBg: 'bg-gray-50 text-gray-500' },
                { label: 'YTD Spend', value: '$341.20', sub: 'Jan – Nov 2024', icon: <TrendingUp className="w-4 h-4" />, iconBg: 'bg-emerald-50 text-emerald-500' },
              ].map((card) => (
                <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  <div className="text-xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-0.5">{card.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{card.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'Plans' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border shadow-xs flex flex-col ${plan.current
                    ? 'border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-300'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                {plan.current && (
                  <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mb-3">
                    CURRENT PLAN
                  </span>
                )}
                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-5">{plan.description}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? 'secondary' : plan.id === 'enterprise' ? 'primary' : 'brand'}
                  size="sm"
                  className="w-full font-semibold"
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-slate-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Period</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-700">{inv.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{inv.period}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition">
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
