import React, { useState } from 'react';
import { User, Branch, Department, InventoryItem, Recipe, DepartmentDishEntry, AuditLog } from './types';
import {
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_INVENTORY,
  INITIAL_RECIPES,
  INITIAL_DEPARTMENT_DISH_ENTRIES,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { DeepFreezerView } from './components/DeepFreezerView';
import { DepartmentsView } from './components/DepartmentsView';
import { RecipesView } from './components/RecipesView';
import { ReportsView } from './components/ReportsView';
import { AdminPanel } from './components/AdminPanel';
import { AuditLogsView } from './components/AuditLogsView';

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Opening page is Login Screen
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);

  const [selectedDate, setSelectedDate] = useState('2026-07-31');
  const [activeTab, setActiveTab] = useState('deep_freezer');

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [dishEntries, setDishEntries] = useState<DepartmentDishEntry[]>(INITIAL_DEPARTMENT_DISH_ENTRIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Automatically map user to their branch unless admin
    const userBranch = branches.find((b) => b.id === user.branchId) || branches[0];
    setCurrentBranch(userBranch);
    setActiveTab('deep_freezer');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      branchId: currentBranch.id,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // If not logged in, show Login Screen (Opening Page)
  if (!currentUser) {
    return <LoginScreen users={users} branches={branches} onLogin={handleLogin} />;
  }

  // Active branch context for current user (Strict isolation for non-admin)
  const activeBranchId = currentUser.role === 'admin' ? currentBranch.id : currentUser.branchId;
  const filteredBranch = branches.find((b) => b.id === activeBranchId) || currentBranch;

  const branchInventory = inventoryItems.filter((i) => {
    if (i.branchIds && i.branchIds.length > 0) {
      if (i.branchIds.includes('all') || i.branchIds.length >= branches.length) return true;
      return i.branchIds.includes(activeBranchId);
    }
    return i.branchId === activeBranchId || i.branchId === 'all';
  });
  const branchDepartments = departments.filter((d) => d.branchId === activeBranchId);
  const branchRecipes = recipes.filter((r) => {
    if (r.branchIds && r.branchIds.length > 0) {
      if (r.branchIds.includes('all') || r.branchIds.length >= branches.length) return true;
      return r.branchIds.includes(activeBranchId);
    }
    return r.branchId === activeBranchId || r.branchId === 'all';
  });
  const branchDishEntries = dishEntries.filter((de) => de.branchId === activeBranchId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={(u) => {
          setCurrentUser(u);
          const b = branches.find((br) => br.id === u.branchId);
          if (b) setCurrentBranch(b);
        }}
        users={users}
        branches={branches}
        currentBranch={filteredBranch}
        setCurrentBranch={setCurrentBranch}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        departments={departments}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'deep_freezer' && (
              <DeepFreezerView
                items={branchInventory}
                setItems={setInventoryItems}
                currentUser={currentUser}
                selectedDate={selectedDate}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                departments={branchDepartments}
                recipes={branchRecipes}
                dishEntries={branchDishEntries}
                setDishEntries={setDishEntries}
                currentUser={currentUser}
                selectedDate={selectedDate}
                addAuditLog={addAuditLog}
                inventoryItems={branchInventory}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesView
                recipes={branchRecipes}
                setRecipes={setRecipes}
                branches={branches}
                departments={branchDepartments}
                inventoryItems={branchInventory}
                currentUser={currentUser}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView items={branchInventory} currentBranch={filteredBranch} />
            )}

            {activeTab === 'admin_panel' && currentUser.role === 'admin' && (
              <AdminPanel
                users={users}
                setUsers={setUsers}
                branches={branches}
                setBranches={setBranches}
                departments={departments}
                setDepartments={setDepartments}
                auditLogs={auditLogs}
                inventoryItems={inventoryItems}
                setInventoryItems={setInventoryItems}
                recipes={recipes}
                setRecipes={setRecipes}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'audit_logs' && currentUser.role === 'admin' && (
              <AuditLogsView auditLogs={auditLogs} branches={branches} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
