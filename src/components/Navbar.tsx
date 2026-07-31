import React, { useState } from 'react';
import { User, Branch, Department } from '../types';
import { Building2, Calendar, ChevronDown, Bell, Shield, UserCheck, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  branches: Branch[];
  currentBranch: Branch;
  selectedStartDate: string;
  setSelectedStartDate: (date: string) => void;
  selectedEndDate: string;
  setSelectedEndDate: (date: string) => void;
  departments: Department[];
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  setCurrentUser,
  users,
  branches,
  currentBranch,
  selectedStartDate,
  setSelectedStartDate,
  selectedEndDate,
  setSelectedEndDate,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Kitchen Control</h1>
            <p className="text-xs text-slate-400 font-medium">Production ERP & Inventory</p>
          </div>
        </div>

        {/* Center: Date Selector & Branch Indicator */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firestore Live Sync</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
              <input
                type="date"
                value={selectedStartDate}
                onChange={(e) => setSelectedStartDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium text-xs sm:text-sm w-32"
              />
            </div>
            <span className="text-slate-500 font-medium">to</span>
            <div className="flex items-center">
              <input
                type="date"
                value={selectedEndDate}
                onChange={(e) => setSelectedEndDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium text-xs sm:text-sm w-32"
              />
            </div>
          </div>

          {/* Branch Indicator */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-slate-200">{currentBranch.name}</span>
          </div>
        </div>

        {/* Right side: Notifications & User Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">System Notifications</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">3 New</span>
                </div>
                <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-700/40 text-xs">
                    <p className="font-medium text-slate-200">Purchase received: 5kg Breast Boneless</p>
                    <span className="text-slate-400">10 mins ago • Store In-charge</span>
                  </div>
                  <div className="p-3 hover:bg-slate-700/40 text-xs">
                    <p className="font-medium text-slate-200">Recipe Updated: Rayalaseema Chicken</p>
                    <span className="text-slate-400">2 hours ago • Admin</span>
                  </div>
                  <div className="p-3 hover:bg-slate-700/40 text-xs">
                    <p className="font-medium text-slate-200">Stock alert: Liver running low (2.5 kg)</p>
                    <span className="text-slate-400">Yesterday • Auto System</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700/80 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-700 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{currentUser.name}</p>
                      <p className="text-xs font-mono text-slate-400">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Role: {currentUser.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Branch: {currentBranch.name}
                    </span>
                  </div>
                </div>

                <div className="pt-2 px-2">
                  <button
                    onClick={() => {
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
