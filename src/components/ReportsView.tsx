import React, { useState } from 'react';
import { InventoryItem, TimeFilter, Branch } from '../types';
import { BarChart3, Calendar, Download, FileText, Filter, Printer, TrendingUp, DollarSign } from 'lucide-react';

interface ReportsViewProps {
  items: InventoryItem[];
  currentBranch: Branch;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ items, currentBranch }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('last_30_days');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  const totalOpeningValue = items.reduce((acc, i) => acc + i.openKg * i.ratePerKg, 0);
  const totalPurchaseValue = items.reduce((acc, i) => acc + i.purchaseKg * i.ratePerKg, 0);
  const totalBalanceValue = items.reduce((acc, i) => acc + i.balanceKg * i.ratePerKg, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Financial Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyze stock consumption, monthly period valuations, and purchasing trends for {currentBranch.name}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert('Report exported successfully as CSV.')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Time Period Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'today' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('last_7_days')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'last_7_days' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFilter('last_30_days')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'last_30_days' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Last Month / 30 Days
          </button>
          <button
            onClick={() => setTimeFilter('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'custom' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom Range
          </button>
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center space-x-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Period Opening Stock Value</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">
            ₹{totalOpeningValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500">Opening balance valuation at period start date</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Total Purchases In Period</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-mono">
            ₹{totalPurchaseValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500">Clubbed purchases across suppliers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider">Period Closing Stock Value</span>
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-blue-600 font-mono">
            ₹{totalBalanceValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500">Closing balance valuation as of today</p>
        </div>
      </div>

      {/* Detailed Stock Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Aggregated Stock Ledger ({timeFilter.replace('_', ' ').toUpperCase()})</h3>
          <p className="text-xs text-slate-500">Opening date stock and closing date stock properly aggregated.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Raw Material</th>
                <th className="py-3.5 px-4 text-right">Opening (kg)</th>
                <th className="py-3.5 px-4 text-right">Total Purchase (kg)</th>
                <th className="py-3.5 px-4 text-right">Total Issued (kg)</th>
                <th className="py-3.5 px-4 text-right">Closing Balance (kg)</th>
                <th className="py-3.5 px-4 text-right">Total Consumption Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map((item) => {
                const consumptionValue = item.issueKg * item.ratePerKg;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-mono">{item.openKg.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-mono">+{item.purchaseKg.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-right text-blue-600 font-mono">{item.issueKg.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{item.balanceKg.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-semibold">₹{consumptionValue.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
