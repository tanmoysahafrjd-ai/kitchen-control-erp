import React, { useState } from 'react';
import { User, Branch } from '../types';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  branches: Branch[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const search = userId.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.id.toLowerCase() === search ||
        u.email.toLowerCase() === search ||
        u.name.toLowerCase() === search
    );
    if (found) {
      if (found.password && password && found.password !== password) {
        alert('Incorrect password. Please try again.');
        return;
      }
      onLogin(found);
    } else {
      alert('Invalid User ID or user not found.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kitchen Control Production ERP</h1>
          <p className="text-sm text-slate-400">
            Multi-Branch Inventory & Kitchen Operations Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID (e.g. siva)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all pt-3"
          >
            <span>Sign In to Branch Operations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Caching/Version Control Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[10px] text-slate-500 font-mono tracking-wider">
            Operational ERP v2.1.0 (Live Sync Active)
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
          >
            Not seeing latest updates? Clear Cache & Force Reload
          </button>
        </div>

      </div>
    </div>
  );
};

