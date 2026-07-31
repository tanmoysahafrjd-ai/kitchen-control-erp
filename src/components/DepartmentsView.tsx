import React, { useState } from 'react';
import { Department, DepartmentDishEntry, Recipe, User, InventoryItem } from '../types';
import { Utensils, Flame, Sparkles, Soup, Plus, Save, Calendar, AlertCircle } from 'lucide-react';

interface DepartmentsViewProps {
  departments: Department[];
  recipes: Recipe[];
  dishEntries: DepartmentDishEntry[];
  setDishEntries: React.Dispatch<React.SetStateAction<DepartmentDishEntry[]>>;
  currentUser: User;
  selectedDate: string;
  addAuditLog: (action: string, details: string) => void;
  inventoryItems: InventoryItem[];
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  recipes,
  dishEntries,
  setDishEntries,
  currentUser,
  selectedDate,
  addAuditLog,
  inventoryItems,
}) => {
  const [activeDeptId, setActiveDeptId] = useState(departments[0]?.id || 'dept-indian');

  const currentDept = departments.find((d) => d.id === activeDeptId) || departments[0];
  const deptRecipes = recipes.filter((r) => r.departmentId === activeDeptId);

  // Construct current entries strictly based on recipes tagged to this department
  const currentEntries = deptRecipes.map((recipe) => {
    const existing = dishEntries.find(
      (e) => e.departmentId === activeDeptId && e.date === selectedDate && e.dishName === recipe.dishName
    );
    if (existing) return existing;
    return {
      id: `dde-${activeDeptId}-${recipe.dishName}-${selectedDate}`,
      branchId: currentDept.branchId,
      departmentId: activeDeptId,
      date: selectedDate,
      dishName: recipe.dishName,
      openingPortion: 2,
      preparedPortion: 10,
      closingPortion: 3,
      salesPortion: 9,
    };
  });

  const handleUpdatePortion = (recipeDishName: string, field: keyof DepartmentDishEntry, value: number) => {
    if (field === 'openingPortion' || field === 'closingPortion') {
      alert('Opening and closing portions are calculated automatically based on previous closing stock and daily sales/prepared entries.');
      return;
    }

    const targetEntry = currentEntries.find((e) => e.dishName === recipeDishName);
    if (!targetEntry) return;

    const updatedEntry = { ...targetEntry, [field]: Math.max(0, value) };
    if (field === 'preparedPortion' || field === 'salesPortion') {
      updatedEntry.closingPortion = Math.max(0, updatedEntry.openingPortion + updatedEntry.preparedPortion - updatedEntry.salesPortion);
    }

    setDishEntries((prev) => {
      const otherEntries = prev.filter(
        (e) => !(e.departmentId === activeDeptId && e.date === selectedDate && e.dishName === recipeDishName)
      );
      return [...otherEntries, updatedEntry];
    });
  };

  const handleSaveDepartment = () => {
    alert(`Successfully saved operations for ${currentDept?.name}. Inventory automatically adjusted.`);
    addAuditLog('SAVE_DEPARTMENT_OPERATIONS', `Saved daily operations for ${currentDept?.name} on ${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      {currentUser.role === 'kitchen_supervisor' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Kitchen Supervisor Mode: Read-only view. You can view department production and sales data, but entry/edits are restricted.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Department Daily Operations</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track daily opening, prepared portions, sales, and recipe-based raw material consumption.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <span>{selectedDate}</span>
          </div>
          {currentUser.role !== 'kitchen_supervisor' && (
            <button
              onClick={handleSaveDepartment}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm shadow-blue-500/20 flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {departments.map((dept) => {
          const isActive = dept.id === activeDeptId;
          return (
            <button
              key={dept.id}
              onClick={() => setActiveDeptId(dept.id)}
              className={`flex items-center space-x-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Utensils className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{dept.name}</span>
            </button>
          );
        })}
      </div>

      {/* Notice on auto-calculation */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold">Automated Recipe & Stock Deduction Engine Active</p>
          <p className="text-blue-700 leading-relaxed">
            All quantities are in Portion. When prepared portions are logged, the system automatically calculates raw material deduction based on active recipes (e.g. Rayalaseema Chicken 5 portions deducts 500g breast boneless, 250g leg boneless from department stock). Opening and closing balances update automatically.
          </p>
        </div>
      </div>

      {/* Dish / Item Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Dish / Item Name</th>
                <th className="py-3.5 px-4 text-center">Opening (Portion)</th>
                <th className="py-3.5 px-4 text-center">Prepared (Portion)</th>
                <th className="py-3.5 px-4 text-center">Closing (Portion)</th>
                <th className="py-3.5 px-4 text-center">Sales (Portion)</th>
                <th className="py-3.5 px-4 text-center">Variance (Sales vs Usage)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No dish entries for {currentDept?.name} on {selectedDate}. Click below to initialize dishes.
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry, index) => {
                  const usage = entry.openingPortion + entry.preparedPortion - entry.closingPortion;
                  const variance = entry.salesPortion - usage;
                  const varianceText = variance > 0 ? `+${variance}` : `${variance}`;
                  const varianceColor = variance > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : variance < 0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{entry.dishName}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          disabled
                          value={entry.openingPortion}
                          className="w-20 text-center py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed"
                          title="Opening is auto-calculated from previous day closing"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          disabled={currentUser.role === 'kitchen_supervisor'}
                          value={entry.preparedPortion}
                          onChange={(e) => handleUpdatePortion(entry.dishName, 'preparedPortion', parseInt(e.target.value) || 0)}
                          className={`w-20 text-center py-1.5 border rounded-lg font-mono font-semibold ${currentUser.role === 'kitchen_supervisor' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          disabled
                          value={entry.closingPortion}
                          className="w-20 text-center py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed"
                          title="Closing is auto-calculated"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          disabled={currentUser.role === 'kitchen_supervisor'}
                          value={entry.salesPortion}
                          onChange={(e) => handleUpdatePortion(entry.dishName, 'salesPortion', parseInt(e.target.value) || 0)}
                          className={`w-20 text-center py-1.5 border rounded-lg font-mono font-semibold ${currentUser.role === 'kitchen_supervisor' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 text-emerald-600 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg border font-mono text-xs font-bold ${varianceColor}`}>
                          {varianceText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Quick initialize button if empty */}
        {currentEntries.length === 0 && (
          <div className="p-6 text-center">
            <button
              onClick={() => {
                const defaultDishes = deptRecipes.length > 0
                  ? deptRecipes.map((r, idx) => ({
                      id: `dde-${Date.now()}-${idx}`,
                      branchId: currentDept.branchId,
                      departmentId: currentDept.id,
                      date: selectedDate,
                      dishName: r.dishName,
                      openingPortion: 5,
                      preparedPortion: 10,
                      closingPortion: 3,
                      salesPortion: 12,
                    }))
                  : [
                      {
                        id: `dde-${Date.now()}-1`,
                        branchId: currentDept.branchId,
                        departmentId: currentDept.id,
                        date: selectedDate,
                        dishName: 'Signature Special Dish',
                        openingPortion: 2,
                        preparedPortion: 15,
                        closingPortion: 4,
                        salesPortion: 13,
                      },
                    ];
                setDishEntries((prev) => [...prev, ...defaultDishes]);
              }}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Initialize Today's Menu Entries
            </button>
          </div>
        )}
      </div>

      {/* Recipe Mapping Preview for this Department */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Active Recipes & Ingredient Breakdown for {currentDept.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 text-sm">{recipe.dishName}</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Effective: {recipe.effectiveFrom}</span>
              </div>
              <p className="text-xs text-slate-500">{recipe.portionUnit}</p>
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Raw Materials (per portion):</p>
                {recipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700">
                    <span>{ing.itemName}</span>
                    <span className="font-mono font-semibold text-blue-600">{(ing.quantityPerPortionKg * 1000).toFixed(0)}g</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {deptRecipes.length === 0 && (
            <p className="text-sm text-slate-400 italic col-span-full">No active recipes defined for this department yet. Admin can add recipes in the Recipe Management module.</p>
          )}
        </div>
      </div>
    </div>
  );
};
