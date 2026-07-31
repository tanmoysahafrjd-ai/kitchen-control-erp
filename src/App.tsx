import React, { useState, useEffect } from 'react';
import { User, Branch, Department, InventoryItem, Recipe, DepartmentDishEntry, AuditLog, StockIssue } from './types';
import {
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_INVENTORY,
  INITIAL_RECIPES,
  INITIAL_DEPARTMENT_DISH_ENTRIES,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import {
  seedInitialFirestoreData,
  subscribeToCollection,
  saveDocument,
  saveDocumentBatch,
  deleteDocument
} from './firebase';
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
  const [users, setUsersState] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Opening page is Login Screen
  const [branches, setBranchesState] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [departments, setDepartmentsState] = useState<Department[]>(INITIAL_DEPARTMENTS);

  const [selectedStartDate, setSelectedStartDate] = useState('2026-07-31');
  const [selectedEndDate, setSelectedEndDate] = useState('2026-07-31');
  const [activeTab, setActiveTab] = useState('deep_freezer');

  const [inventoryItems, setInventoryItemsState] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [recipes, setRecipesState] = useState<Recipe[]>(INITIAL_RECIPES);
  const [dishEntries, setDishEntriesState] = useState<DepartmentDishEntry[]>(INITIAL_DEPARTMENT_DISH_ENTRIES);
  const [auditLogs, setAuditLogsState] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [stockIssues, setStockIssuesState] = useState<StockIssue[]>([]);

  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Initialize Firestore collections & realtime subscriptions
  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubBranches: (() => void) | undefined;
    let unsubDepartments: (() => void) | undefined;
    let unsubInventory: (() => void) | undefined;
    let unsubRecipes: (() => void) | undefined;
    let unsubDishEntries: (() => void) | undefined;
    let unsubAuditLogs: (() => void) | undefined;
    let unsubStockIssues: (() => void) | undefined;

    async function initFirestore() {
      try {
        await seedInitialFirestoreData();
        setFirestoreConnected(true);

        unsubUsers = subscribeToCollection<User>('users', (data) => {
          setUsersState(data);
        });
        unsubBranches = subscribeToCollection<Branch>('branches', (data) => {
          setBranchesState(data);
        });
        unsubDepartments = subscribeToCollection<Department>('departments', (data) => {
          setDepartmentsState(data);
        });
        unsubInventory = subscribeToCollection<InventoryItem>('inventory', (data) => {
          setInventoryItemsState(data);
        });
        unsubRecipes = subscribeToCollection<Recipe>('recipes', (data) => {
          setRecipesState(data);
        });
        unsubDishEntries = subscribeToCollection<DepartmentDishEntry>('dishEntries', (data) => {
          setDishEntriesState(data);
        });
        unsubAuditLogs = subscribeToCollection<AuditLog>('auditLogs', (data) => {
          setAuditLogsState(data);
        });
        unsubStockIssues = subscribeToCollection<StockIssue>('stockIssues', (data) => {
          setStockIssuesState(data);
        });
      } catch (err) {
        console.error('Firestore init error:', err);
      }
    }

    initFirestore();

    return () => {
      unsubUsers?.();
      unsubBranches?.();
      unsubDepartments?.();
      unsubInventory?.();
      unsubRecipes?.();
      unsubDishEntries?.();
      unsubAuditLogs?.();
      unsubStockIssues?.();
    };
  }, []);

  // Sync state updaters with Firestore
  const setUsers = (action: React.SetStateAction<User[]>) => {
    setUsersState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((u) => u.id));
      prev.forEach((u) => {
        if (!nextIds.has(u.id)) {
          deleteDocument('users', u.id).catch(console.error);
        }
      });
      saveDocumentBatch('users', next).catch(console.error);
      return next;
    });
  };

  const setBranches = (action: React.SetStateAction<Branch[]>) => {
    setBranchesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((b) => b.id));
      prev.forEach((b) => {
        if (!nextIds.has(b.id)) {
          deleteDocument('branches', b.id).catch(console.error);
        }
      });
      saveDocumentBatch('branches', next).catch(console.error);
      return next;
    });
  };

  const setDepartments = (action: React.SetStateAction<Department[]>) => {
    setDepartmentsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((d) => d.id));
      prev.forEach((d) => {
        if (!nextIds.has(d.id)) {
          deleteDocument('departments', d.id).catch(console.error);
        }
      });
      saveDocumentBatch('departments', next).catch(console.error);
      return next;
    });
  };

  const setInventoryItems = (action: React.SetStateAction<InventoryItem[]>) => {
    setInventoryItemsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((i) => i.id));
      prev.forEach((i) => {
        if (!nextIds.has(i.id)) {
          deleteDocument('inventory', i.id).catch(console.error);
        }
      });
      saveDocumentBatch('inventory', next).catch(console.error);
      return next;
    });
  };

  const setRecipes = (action: React.SetStateAction<Recipe[]>) => {
    setRecipesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((r) => r.id));
      prev.forEach((r) => {
        if (!nextIds.has(r.id)) {
          deleteDocument('recipes', r.id).catch(console.error);
        }
      });
      saveDocumentBatch('recipes', next).catch(console.error);
      return next;
    });
  };

  const setDishEntries = (action: React.SetStateAction<DepartmentDishEntry[]>) => {
    setDishEntriesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((de) => de.id));
      prev.forEach((de) => {
        if (!nextIds.has(de.id)) {
          deleteDocument('dishEntries', de.id).catch(console.error);
        }
      });
      saveDocumentBatch('dishEntries', next).catch(console.error);
      return next;
    });
  };

  const setStockIssues = (action: React.SetStateAction<StockIssue[]>) => {
    setStockIssuesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const nextIds = new Set(next.map((si) => si.id));
      prev.forEach((si) => {
        if (!nextIds.has(si.id)) {
          deleteDocument('stockIssues', si.id).catch(console.error);
        }
      });
      saveDocumentBatch('stockIssues', next).catch(console.error);
      return next;
    });
  };

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
    setAuditLogsState((prev) => [newLog, ...prev]);
    saveDocument('auditLogs', newLog).catch(console.error);
  };

  // If not logged in, show Login Screen (Opening Page)
  if (!currentUser) {
    return <LoginScreen users={users} branches={branches} onLogin={handleLogin} />;
  }

  // Active branch context from the top header selector (unified branch filter)
  const activeBranchId = currentBranch.id;
  const filteredBranch = branches.find((b) => b.id === activeBranchId) || currentBranch;

  const branchInventory = inventoryItems.filter((i) => {
    if (activeBranchId === 'all') return true;
    if (i.branchIds && i.branchIds.length > 0) {
      if (i.branchIds.includes('all') || i.branchIds.length >= branches.length) return true;
      return i.branchIds.includes(activeBranchId);
    }
    return i.branchId === activeBranchId || i.branchId === 'all';
  });
  const branchDepartments = departments.filter((d) => activeBranchId === 'all' || d.branchId === activeBranchId);
  const branchRecipes = recipes.filter((r) => {
    if (activeBranchId === 'all') return true;
    if (r.branchIds && r.branchIds.length > 0) {
      if (r.branchIds.includes('all') || r.branchIds.length >= branches.length) return true;
      return r.branchIds.includes(activeBranchId);
    }
    return r.branchId === activeBranchId || r.branchId === 'all';
  });
  const branchDishEntries = dishEntries.filter((de) => activeBranchId === 'all' || de.branchId === activeBranchId);
  const branchStockIssues = stockIssues.filter((si) => activeBranchId === 'all' || si.branchId === activeBranchId);

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
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedEndDate={selectedEndDate}
        setSelectedEndDate={setSelectedEndDate}
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
                departments={branchDepartments}
                stockIssues={branchStockIssues}
                setStockIssues={setStockIssues}
                currentUser={currentUser}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                departments={branchDepartments}
                recipes={branchRecipes}
                dishEntries={branchDishEntries}
                setDishEntries={setDishEntries}
                stockIssues={branchStockIssues}
                currentUser={currentUser}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                setSelectedStartDate={setSelectedStartDate}
                setSelectedEndDate={setSelectedEndDate}
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
                currentBranch={filteredBranch}
                setCurrentBranch={setCurrentBranch}
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
