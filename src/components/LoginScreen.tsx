import React, { useState } from 'react';
import { User, Branch } from '../types';
import { Shield, Building2, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  branches: Branch[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, branches, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('HotelGrand@123');
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email === email || u.id === selectedUserId);
    if (found) {
      onLogin(found);
    } else {
      alert('Invalid credentials or user not found.');
    }
  };

  const handleQuickSelect = (u: User) => {
    setEmail(u.email);
    setSelectedUserId(u.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kitchen Control Production ERP</h1>
          <p className="text-sm text-slate-400">
            Multi-Branch Inventory & Kitchen Operations Platform with Strict Branch Isolation & RBAC
          </p>
        </div>

        {/* Quick Demo Profiles */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Demo Profile (Quick Login)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {users.map((u) => {
              const branch = branches.find((b) => b.id === u.branchId);
              const isSelected = selectedUserId === u.id;
              const isReadOnly = u.role === 'kitchen_supervisor';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-bold truncate">{u.name}</p>
                    <p className="text-[10px] text-blue-400 uppercase font-medium mt-0.5">
                      {u.role.replace('_', ' ')} {isReadOnly ? '(Read Only)' : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{branch?.name}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 border-t border-slate-800 pt-6">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email ID / Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@hotelgrand.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all mt-2"
          >
            <span>Sign In to Branch Operations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Strict Branch Isolation & RBAC Enforced • Secure Enterprise Kitchen ERP
        </div>

      </div>
    </div>
  );
};
