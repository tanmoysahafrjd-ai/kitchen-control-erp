import React, { useState } from 'react';
import { User, Branch, Department, AuditLog, InventoryItem, Recipe, RecipeIngredient } from '../types';
import { Users, Shield, Plus, Building2, CheckCircle2, Key, UserPlus, FileText, Trash2, X, Utensils, Pencil, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  auditLogs: AuditLog[];
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  addAuditLog: (action: string, details: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  setUsers,
  branches,
  setBranches,
  departments,
  setDepartments,
  auditLogs,
  inventoryItems,
  setInventoryItems,
  recipes,
  setRecipes,
  addAuditLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'items' | 'branches' | 'recipes'>('users');

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'user' | 'item' | 'recipe' | 'branch';
    id: string;
    name: string;
  } | null>(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);

  // Branch Form State (Create / Edit)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchLocation, setBranchLocation] = useState('');

  // Recipe Form State (Create / Edit)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipeDishName, setNewRecipeDishName] = useState('');
  const [newRecipeBranchId, setNewRecipeBranchId] = useState(branches[0]?.id || '');
  const [selectedRecipeBranchIds, setSelectedRecipeBranchIds] = useState<string[]>(['all']);
  const [newRecipeDepartmentId, setNewRecipeDepartmentId] = useState(departments.filter(d => d.branchId === branches[0]?.id)[0]?.id || departments[0]?.id || '');
  const [newRecipePortionUnit, setNewRecipePortionUnit] = useState('Portion (350g)');
  const [recipeIngredientsInput, setRecipeIngredientsInput] = useState<{ itemId: string; quantityPerPortionKg: string }[]>([
    { itemId: inventoryItems[0]?.id || '', quantityPerPortionKg: '0.15' }
  ]);

  // User Form State (Create / Edit)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'store_incharge' | 'kitchen_supervisor' | 'department_chef'>('store_incharge');
  const [newUserBranchId, setNewUserBranchId] = useState(branches[0]?.id || '');

  // Item Form State (Create / Edit)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Chicken' | 'Fish' | 'Mutton' | 'Vegetables' | 'Dairy' | 'Spices' | 'Grocery'>('Chicken');
  const [newItemRate, setNewItemRate] = useState('300');
  const [newItemBranchId, setNewItemBranchId] = useState(branches[0]?.id || '');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(['all']);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(['all']);

  // Deletion Confirmation Handler
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, id, name } = deleteConfirm;

    if (type === 'user') {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addAuditLog('DELETE_USER', `Deleted user account: ${name}`);
    } else if (type === 'item') {
      setInventoryItems((prev) => prev.filter((i) => i.id !== id));
      addAuditLog('DELETE_ITEM', `Deleted raw material item: ${name}`);
    } else if (type === 'recipe') {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      addAuditLog('DELETE_RECIPE', `Deleted recipe: ${name}`);
    } else if (type === 'branch') {
      setBranches((prev) => prev.filter((b) => b.id !== id));
      setDepartments((prev) => prev.filter((d) => d.branchId !== id));
      setRecipes((prev) => prev.filter((r) => r.branchId !== id));
      setInventoryItems((prev) => prev.filter((i) => i.branchId !== id));
      addAuditLog('DELETE_BRANCH', `Deleted branch: ${name}`);
    }

    setDeleteConfirm(null);
  };

  // Branch Handlers
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchCode('');
    setBranchLocation('');
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code);
    setBranchLocation(b.location);
    setShowBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchCode.trim()) return;

    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? { ...b, name: branchName, code: branchCode.toUpperCase(), location: branchLocation }
            : b
        )
      );
      addAuditLog('UPDATE_BRANCH', `Updated branch ${branchName} (${branchCode})`);
    } else {
      const newId = `branch-${Date.now()}`;
      const newBranch: Branch = {
        id: newId,
        name: branchName,
        code: branchCode.toUpperCase(),
        location: branchLocation,
        active: true,
      };
      setBranches((prev) => [...prev, newBranch]);
      // Create default departments for new branch
      const defaultDepts: Department[] = [
        { id: `dept-${newId}-indian`, name: 'Indian Kitchen', branchId: newId, iconName: 'Flame' },
        { id: `dept-${newId}-chinese`, name: 'Chinese Kitchen', branchId: newId, iconName: 'Utensils' },
        { id: `dept-${newId}-tandoori`, name: 'Tandoori Kitchen', branchId: newId, iconName: 'Sparkles' },
      ];
      setDepartments((prev) => [...prev, ...defaultDepts]);
      addAuditLog('CREATE_BRANCH', `Created new branch ${branchName} (${branchCode})`);
    }
    setShowBranchModal(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (branches.length <= 1) {
      alert('Cannot delete the last remaining branch.');
      return;
    }
    setDeleteConfirm({ type: 'branch', id, name });
  };

  const getBranchInventoryItems = (bId: string) => {
    return inventoryItems.filter((i) => {
      if (i.branchIds && i.branchIds.length > 0) {
        if (i.branchIds.includes('all') || i.branchIds.length >= branches.length) return true;
        return i.branchIds.includes(bId);
      }
      return i.branchId === bId || i.branchId === 'all';
    });
  };

  const getInventoryItemsForRecipeBranches = (bIds: string[]) => {
    if (bIds.includes('all') || bIds.length === 0 || bIds.length >= branches.length) return inventoryItems;
    return inventoryItems.filter((i) => {
      if (i.branchIds?.includes('all') || i.branchId === 'all') return true;
      return bIds.some((bId) => i.branchIds?.includes(bId) || i.branchId === bId);
    });
  };

  // Recipe Handlers
  const handleOpenCreateRecipe = () => {
    setEditingRecipe(null);
    setNewRecipeDishName('');
    setSelectedRecipeBranchIds(['all']);
    const defaultBranchId = branches[0]?.id || '';
    setNewRecipeBranchId(defaultBranchId);
    setNewRecipeDepartmentId(departments[0]?.id || '');
    setNewRecipePortionUnit('Portion (350g)');
    const branchItems = getInventoryItemsForRecipeBranches(['all']);
    setRecipeIngredientsInput([
      { itemId: branchItems[0]?.id || '', quantityPerPortionKg: '0.15' }
    ]);
    setShowRecipeModal(true);
  };

  const handleOpenEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipeDishName(recipe.dishName);
    setNewRecipeBranchId(recipe.branchId);

    const isAllBranch = !recipe.branchIds || recipe.branchIds.includes('all') || recipe.branchIds.length === 0 || recipe.branchIds.length >= branches.length || recipe.branchId === 'all';
    setSelectedRecipeBranchIds(isAllBranch ? ['all'] : recipe.branchIds);

    setNewRecipeDepartmentId(recipe.departmentId);
    setNewRecipePortionUnit(recipe.portionUnit);
    setRecipeIngredientsInput(
      recipe.ingredients.map(ing => ({
        itemId: ing.itemId,
        quantityPerPortionKg: ing.quantityPerPortionKg.toString(),
      }))
    );
    setShowRecipeModal(true);
  };

  const handleAddIngredientRow = () => {
    const branchItems = getInventoryItemsForRecipeBranches(selectedRecipeBranchIds);
    setRecipeIngredientsInput([...recipeIngredientsInput, { itemId: branchItems[0]?.id || '', quantityPerPortionKg: '0.10' }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeIngredientsInput(recipeIngredientsInput.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeDishName.trim()) return;

    const isAllBranchSelected = selectedRecipeBranchIds.includes('all') || selectedRecipeBranchIds.length >= branches.length || selectedRecipeBranchIds.length === 0;
    const primaryBranch = isAllBranchSelected ? (branches[0]?.id || 'annanagar') : (selectedRecipeBranchIds[0] || branches[0]?.id || 'annanagar');
    const finalBranchIds = isAllBranchSelected ? ['all'] : selectedRecipeBranchIds;

    const availableItems = getInventoryItemsForRecipeBranches(finalBranchIds);
    const formattedIngredients: RecipeIngredient[] = recipeIngredientsInput.map(ing => {
      const foundItem = inventoryItems.find(i => i.id === ing.itemId) || availableItems.find(i => i.id === ing.itemId);
      return {
        itemId: ing.itemId,
        itemName: foundItem?.name || 'Raw Material',
        quantityPerPortionKg: parseFloat(ing.quantityPerPortionKg) || 0.1,
      };
    });

    if (editingRecipe) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === editingRecipe.id
            ? {
                ...r,
                branchId: primaryBranch,
                branchIds: finalBranchIds,
                departmentId: newRecipeDepartmentId,
                dishName: newRecipeDishName,
                portionUnit: newRecipePortionUnit,
                ingredients: formattedIngredients,
              }
            : r
        )
      );
      addAuditLog('UPDATE_RECIPE', `Updated recipe & BOM for ${newRecipeDishName}`);
    } else {
      const newRecipe: Recipe = {
        id: `rec-${Date.now()}`,
        branchId: primaryBranch,
        branchIds: finalBranchIds,
        departmentId: newRecipeDepartmentId,
        dishName: newRecipeDishName,
        portionUnit: newRecipePortionUnit,
        ingredients: formattedIngredients,
        effectiveFrom: new Date().toISOString().split('T')[0],
        active: true,
      };
      setRecipes((prev) => [...prev, newRecipe]);
      addAuditLog('CREATE_RECIPE', `Created recipe ${newRecipeDishName} with ${formattedIngredients.length} raw materials`);
    }
    setShowRecipeModal(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    setDeleteConfirm({ type: 'recipe', id, name });
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('store_incharge');
    setNewUserBranchId(branches[0]?.id || '');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setNewUserName(u.name);
    setNewUserEmail(u.email);
    setNewUserRole(u.role);
    setNewUserBranchId(u.branchId);
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: newUserName,
                email: newUserEmail,
                role: newUserRole,
                branchId: newUserBranchId || branches[0]?.id,
              }
            : u
        )
      );
      addAuditLog('UPDATE_USER', `Updated user ${newUserName}`);
    } else {
      const createdUser: User = {
        id: `u-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        branchId: newUserBranchId || branches[0]?.id,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, createdUser]);
      addAuditLog('CREATE_USER', `Created new user ${newUserName} with role ${newUserRole}`);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setDeleteConfirm({ type: 'user', id, name });
  };

  const handleToggleUserActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: u.active === false ? true : false } : u))
    );
    addAuditLog('TOGGLE_USER', `Toggled active status for user ID ${id}`);
  };

  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemCategory('Chicken');
    setNewItemRate('300');
    setNewItemBranchId(branches[0]?.id || '');
    setSelectedBranchIds(['all']);
    setSelectedDepartmentIds(['all']);
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemRate(item.ratePerKg.toString());
    setNewItemBranchId(item.branchId);
    
    const isAllBranch = !item.branchIds || item.branchIds.includes('all') || item.branchIds.length === 0 || item.branchIds.length >= branches.length || item.branchId === 'all';
    setSelectedBranchIds(isAllBranch ? ['all'] : item.branchIds);
    
    // Normalize department IDs/names to department names or 'all'
    const uniqueDeptNames = Array.from(new Set(departments.map((d) => d.name)));
    const isAllDept = !item.departmentIds || item.departmentIds.includes('all') || item.departmentIds.length === 0 || item.departmentIds.length >= uniqueDeptNames.length;

    if (isAllDept) {
      setSelectedDepartmentIds(['all']);
    } else {
      const normalizedNames = item.departmentIds.map((dId) => {
        const found = departments.find((d) => d.id === dId || d.name === dId);
        return found ? found.name : dId;
      });
      const uniqueNamesSet = Array.from(new Set(normalizedNames));
      if (uniqueNamesSet.length >= uniqueDeptNames.length) {
        setSelectedDepartmentIds(['all']);
      } else {
        setSelectedDepartmentIds(uniqueNamesSet);
      }
    }
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const uniqueDeptNames = Array.from(new Set(departments.map((d) => d.name)));

    const isAllBranchSelected = selectedBranchIds.includes('all') || selectedBranchIds.length >= branches.length || selectedBranchIds.length === 0;
    const primaryBranch = isAllBranchSelected ? (branches[0]?.id || 'annanagar') : (selectedBranchIds[0] || branches[0]?.id || 'annanagar');
    const finalBranchIds = isAllBranchSelected ? ['all'] : selectedBranchIds;

    const isAllDeptSelected = selectedDepartmentIds.includes('all') || selectedDepartmentIds.length >= uniqueDeptNames.length || selectedDepartmentIds.length === 0;
    const finalDeptIds = isAllDeptSelected ? ['all'] : selectedDepartmentIds;

    if (editingItem) {
      setInventoryItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                branchId: primaryBranch,
                branchIds: finalBranchIds,
                departmentIds: finalDeptIds,
                name: newItemName,
                category: newItemCategory,
                ratePerKg: parseFloat(newItemRate) || 200,
              }
            : i
        )
      );
      addAuditLog('UPDATE_ITEM', `Updated raw material item ${newItemName} with branch & department mapping`);
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        branchId: primaryBranch,
        branchIds: finalBranchIds,
        departmentIds: finalDeptIds,
        name: newItemName,
        category: newItemCategory,
        openKg: 10.0,
        purchaseKg: 0.0,
        issueKg: 0.0,
        balanceKg: 10.0,
        ratePerKg: parseFloat(newItemRate) || 200,
        unit: 'kg',
        minStockAlert: 5,
        active: true,
      };
      setInventoryItems((prev) => [...prev, newItem]);
      addAuditLog('CREATE_ITEM', `Added new raw material item: ${newItemName} mapped to ${finalBranchIds.join(', ')}`);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, name: string) => {
    setDeleteConfirm({ type: 'item', id, name });
  };

  const handleToggleItemActive = (id: string) => {
    setInventoryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, active: i.active === false ? true : false } : i))
    );
    addAuditLog('TOGGLE_ITEM', `Toggled active status for raw material ID ${id}`);
  };

  const handleToggleBranchActive = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: b.active === false ? true : false } : b))
    );
    addAuditLog('TOGGLE_BRANCH', `Toggled active status for branch ID ${id}`);
  };

  const handleToggleRecipeActive = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: r.active === false ? true : false } : r))
    );
    addAuditLog('TOGGLE_RECIPE', `Toggled active status for recipe ID ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Control Panel</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage branches, user credentials, RBAC permissions, master raw materials, and department recipes & BOM.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            User & RBAC
          </button>
          <button
            onClick={() => setActiveSubTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'items' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Raw Material Master
          </button>
          <button
            onClick={() => setActiveSubTab('recipes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'recipes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recipes & BOM
          </button>
          <button
            onClick={() => setActiveSubTab('branches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'branches' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Branches
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Accounts & Role Permissions</h3>
              <p className="text-xs text-slate-500">Create login IDs, passwords, and assign branch access.</p>
            </div>
            <button
              onClick={handleOpenCreateUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Email / Login ID</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => {
                  const branch = branches.find((b) => b.id === u.branchId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          u.role === 'store_incharge' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          u.role === 'kitchen_supervisor' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{branch?.name || 'All Branches'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            u.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{u.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Material Master Tab */}
      {activeSubTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Raw Material Master Catalogue</h3>
              <p className="text-xs text-slate-500">Define raw materials and items for deep freezer inventory across branches.</p>
            </div>
            <button
              onClick={handleOpenCreateItem}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Raw Material</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Mapped Branches</th>
                  <th className="py-3.5 px-4">Mapped Departments</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Standard Rate (₹/kg)</th>
                  <th className="py-3.5 px-4 text-right">Current Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {inventoryItems.map((item) => {
                  const isAllBranches = item.branchIds?.includes('all') || (!item.branchIds && item.branchId === 'all') || (item.branchIds && item.branchIds.length >= branches.length);
                  const uniqueDeptNames = Array.from(new Set(departments.map((d) => d.name)));
                  const isAllDepts = item.departmentIds?.includes('all') || !item.departmentIds || item.departmentIds.length === 0 || (item.departmentIds && item.departmentIds.length >= uniqueDeptNames.length);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {isAllBranches ? (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-md text-[11px] font-bold">
                              All Branches
                            </span>
                          ) : (
                            (item.branchIds && item.branchIds.length > 0 ? item.branchIds : [item.branchId]).map((bId) => {
                              const b = branches.find((br) => br.id === bId);
                              return (
                                <span key={bId} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium">
                                  {b?.name || bId}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {isAllDepts ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-md text-[11px] font-bold">
                              All Kitchens
                            </span>
                          ) : (
                            item.departmentIds!.map((dId) => {
                              const dObj = departments.find((d) => d.id === dId);
                              const displayName = dObj?.name || dId;
                              return (
                                <span key={dId} className="px-2 py-0.5 bg-blue-50/80 text-blue-700 border border-blue-200/60 rounded-md text-[11px] font-medium">
                                  {displayName}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">₹{item.ratePerKg}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">{item.balanceKg} {item.unit}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleItemActive(item.id)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            item.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recipes & BOM Tab */}
      {activeSubTab === 'recipes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Department Recipes & Bill of Materials (BOM)</h3>
              <p className="text-xs text-slate-500">Create dishes, map multiple raw materials, modify existing BOMs, and assign them to departments.</p>
            </div>
            <button
              onClick={handleOpenCreateRecipe}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <Utensils className="w-4 h-4" />
              <span>Create New Recipe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => {
              const branch = branches.find((b) => b.id === recipe.branchId);
              const dept = departments.find((d) => d.id === recipe.departmentId);

              return (
                <div key={recipe.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {dept?.name || 'Department'}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">{recipe.dishName}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {recipe.branchIds?.includes('all') || recipe.branchId === 'all' ? (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold text-[11px] rounded-lg border border-purple-200/60">
                            All Branches
                          </span>
                        ) : (
                          (recipe.branchIds && recipe.branchIds.length > 0 ? recipe.branchIds : [recipe.branchId]).map((bId) => {
                            const b = branches.find((br) => br.id === bId);
                            return (
                              <span key={bId} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[11px] rounded-lg border border-slate-200/60">
                                {b?.name || bId}
                              </span>
                            );
                          })
                        )}
                        <span className="text-xs text-slate-400 font-normal">| Unit: {recipe.portionUnit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleRecipeActive(recipe.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          recipe.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle Active / Inactive"
                      >
                        {recipe.active !== false ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleOpenEditRecipe(recipe)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Recipe & BOM"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id, recipe.dishName)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw Materials Required (BOM per portion)</p>
                    <div className="space-y-1.5">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 px-3 py-2 rounded-xl">
                          <span className="font-medium text-slate-700">{ing.itemName}</span>
                          <span className="font-mono font-bold text-blue-600">{(ing.quantityPerPortionKg * 1000).toFixed(0)}g ({ing.quantityPerPortionKg} kg)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Branches Tab */}
      {activeSubTab === 'branches' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Hotel Branches</h3>
              <p className="text-xs text-slate-500">Create, modify, or manage hotel branches and locations.</p>
            </div>
            <button
              onClick={handleOpenCreateBranch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Building2 className="w-5 h-5" />
                    <span className="font-bold text-slate-900">{b.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleBranchActive(b.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        b.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="Click to toggle Active / Inactive"
                    >
                      {b.active !== false ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleOpenEditBranch(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit Branch"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-mono">Code: {b.code}</p>
                <p className="text-xs text-slate-600">{b.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branch Modal (Create / Edit) */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBranch} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
              </h3>
              <button type="button" onClick={() => setShowBranchModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Besant Nagar"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Branch Code (3 Letters)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. BES"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Main Road, Besant Nagar"
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBranchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Modal (Create / Edit) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingUser ? 'Edit User Account' : 'Create New User'}</h3>
              <button type="button" onClick={() => setShowUserModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email / Login ID</label>
                <input
                  type="email"
                  required
                  placeholder="user@hotelgrand.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role Permission</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="store_incharge">Store Incharge</option>
                    <option value="kitchen_supervisor">Kitchen Supervisor</option>
                    <option value="department_chef">Department Chef</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Branch</label>
                  <select
                    value={newUserBranchId}
                    onChange={(e) => setNewUserBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Item Modal (Create / Edit) */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveItem} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{editingItem ? 'Edit Raw Material Master' : 'Add Raw Material Item'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure raw material details and map to target branches & departments.</p>
              </div>
              <button type="button" onClick={() => setShowItemModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Drumsticks"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Chicken">Chicken</option>
                    <option value="Fish">Fish</option>
                    <option value="Mutton">Mutton</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Spices">Spices</option>
                    <option value="Grocery">Grocery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Standard Rate (₹/kg)</label>
                  <input
                    type="number"
                    required
                    value={newItemRate}
                    onChange={(e) => setNewItemRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Branch Mapping */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Mapped Branches</span>
                  </label>
                  {!selectedBranchIds.includes('all') && (
                    <button
                      type="button"
                      onClick={() => setSelectedBranchIds(['all'])}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Map to All Branches
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBranchIds(['all'])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                      selectedBranchIds.includes('all')
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Branches</span>
                  </button>

                  {branches.map((b) => {
                    const isChecked = !selectedBranchIds.includes('all') && selectedBranchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          if (selectedBranchIds.includes('all')) {
                            setSelectedBranchIds([b.id]);
                          } else {
                            if (isChecked) {
                              const updated = selectedBranchIds.filter((id) => id !== b.id);
                              setSelectedBranchIds(updated.length === 0 ? ['all'] : updated);
                            } else {
                              const updated = [...selectedBranchIds.filter((id) => id !== 'all'), b.id];
                              if (updated.length >= branches.length) {
                                setSelectedBranchIds(['all']);
                              } else {
                                setSelectedBranchIds(updated);
                              }
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Department Mapping */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Utensils className="w-4 h-4 text-blue-600" />
                    <span>Mapped Kitchen Departments</span>
                  </label>
                  {!selectedDepartmentIds.includes('all') && (
                    <button
                      type="button"
                      onClick={() => setSelectedDepartmentIds(['all'])}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      Map to All Kitchens
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDepartmentIds(['all'])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                      selectedDepartmentIds.includes('all')
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Kitchen Departments</span>
                  </button>

                  {Array.from(new Set(departments.map((d) => d.name))).map((dName) => {
                    const isChecked = !selectedDepartmentIds.includes('all') && selectedDepartmentIds.includes(dName);
                    return (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => {
                          if (selectedDepartmentIds.includes('all')) {
                            setSelectedDepartmentIds([dName]);
                          } else {
                            if (isChecked) {
                              const updated = selectedDepartmentIds.filter((id) => id !== dName);
                              setSelectedDepartmentIds(updated.length === 0 ? ['all'] : updated);
                            } else {
                              const updated = [...selectedDepartmentIds.filter((id) => id !== 'all'), dName];
                              const uniqueDepts = Array.from(new Set(departments.map((d) => d.name)));
                              if (updated.length >= uniqueDepts.length) {
                                setSelectedDepartmentIds(['all']);
                              } else {
                                setSelectedDepartmentIds(updated);
                              }
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{dName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                {editingItem ? 'Update Raw Material' : 'Save Raw Material'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipe Modal (Create / Edit) */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveRecipe} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecipe ? 'Edit Recipe & BOM' : 'Create New Recipe & BOM'}
              </h3>
              <button type="button" onClick={() => setShowRecipeModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Mapped Branches */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 uppercase flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Mapped Branches</span>
                  </label>
                  {!selectedRecipeBranchIds.includes('all') && (
                    <button
                      type="button"
                      onClick={() => setSelectedRecipeBranchIds(['all'])}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Map to All Branches
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRecipeBranchIds(['all'])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                      selectedRecipeBranchIds.includes('all')
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Branches</span>
                  </button>

                  {branches.map((b) => {
                    const isChecked = !selectedRecipeBranchIds.includes('all') && selectedRecipeBranchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          if (selectedRecipeBranchIds.includes('all')) {
                            setSelectedRecipeBranchIds([b.id]);
                          } else {
                            if (isChecked) {
                              const updated = selectedRecipeBranchIds.filter((id) => id !== b.id);
                              setSelectedRecipeBranchIds(updated.length === 0 ? ['all'] : updated);
                            } else {
                              const updated = [...selectedRecipeBranchIds.filter((id) => id !== 'all'), b.id];
                              if (updated.length >= branches.length) {
                                setSelectedRecipeBranchIds(['all']);
                              } else {
                                setSelectedRecipeBranchIds(updated);
                              }
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Department</label>
                <select
                  value={newRecipeDepartmentId}
                  onChange={(e) => setNewRecipeDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Andhra Chicken Biryani"
                  value={newRecipeDishName}
                  onChange={(e) => setNewRecipeDishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Portion Unit</label>
                <input
                  type="text"
                  required
                  value={newRecipePortionUnit}
                  onChange={(e) => setNewRecipePortionUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Multiple Raw Materials / Ingredients */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Raw Materials (BOM per portion)</label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Raw Material</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {recipeIngredientsInput.map((ing, idx) => {
                    const availableItems = getInventoryItemsForRecipeBranches(selectedRecipeBranchIds);
                    return (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <select
                          value={ing.itemId}
                          onChange={(e) => {
                            const updated = [...recipeIngredientsInput];
                            updated[idx].itemId = e.target.value;
                            setRecipeIngredientsInput(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                        >
                          {availableItems.map((bi) => (
                            <option key={bi.id} value={bi.id}>{bi.name} ({bi.category})</option>
                          ))}
                        </select>

                        <div className="flex items-center space-x-1 shrink-0">
                          <input
                            type="number"
                            step="0.001"
                            required
                            placeholder="Qty (kg)"
                            value={ing.quantityPerPortionKg}
                            onChange={(e) => {
                              const updated = [...recipeIngredientsInput];
                              updated[idx].quantityPerPortionKg = e.target.value;
                              setRecipeIngredientsInput(updated);
                            }}
                            className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                          />
                          <span className="text-xs text-slate-500">kg</span>
                        </div>

                        {recipeIngredientsInput.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowRecipeModal(false);
                  setEditingRecipe(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {deleteConfirm.type} record
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-sm text-slate-700">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirm.name}</span>?
              {deleteConfirm.type === 'branch' && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  Warning: All associated departments, recipes, and raw materials unlinked from this branch will also be removed.
                </p>
              )}
              {deleteConfirm.type === 'recipe' && (
                <p className="mt-2 text-xs text-amber-600 font-medium">
                  This will also remove the ingredient Bill of Materials (BOM) mapping.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
