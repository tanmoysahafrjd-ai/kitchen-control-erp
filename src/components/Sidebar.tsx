import React from 'react';
import { Snowflake, UtensilsCrossed, BookOpen, BarChart3, Settings, ShieldAlert, Hotel } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const navItems = [
    { id: 'deep_freezer', label: 'Deep Freezer', icon: Snowflake, description: 'Main Store Inventory' },
    { id: 'departments', label: 'Kitchen Departments', icon: UtensilsCrossed, description: 'Preparation & Sales' },
    { id: 'recipes', label: 'Recipes & Ingredients', icon: BookOpen, description: 'BOM & Effective Dates' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, description: 'Period Stock & Valuation' },
    ...(currentUser.role === 'admin'
      ? [
          { id: 'admin_panel', label: 'Admin Control', icon: Settings, description: 'Users, Roles & Branch' },
          { id: 'audit_logs', label: 'Audit Logs', icon: ShieldAlert, description: 'System Activity Tracker' },
        ]
      : []),
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        {/* Navigation links */}
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            ERP Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                  <p className={`text-[10px] mt-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Role & permissions reminder card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Active Role: {currentUser.role.replace('_', ' ').toUpperCase()}</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {currentUser.role === 'admin' && 'Full access: Can create users, edit recipes, manage branches & view all logs.'}
            {currentUser.role === 'store_incharge' && 'Store access: Can record purchases and issue stock to departments.'}
            {currentUser.role === 'department_chef' && 'Kitchen access: Can record daily prepared portions and sales.'}
          </p>
        </div>
      </div>

      {/* Branch info footer */}
      <div className="pt-4 border-t border-slate-800/80 mt-6">
        <div className="flex items-center space-x-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Hotel className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Hotel Grand</p>
            <p className="text-[10px] text-slate-400 truncate">Main Branch • Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
