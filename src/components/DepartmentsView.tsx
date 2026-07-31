import React, { useState, useEffect, useMemo } from 'react';
import { Department, DepartmentDishEntry, Recipe, User, InventoryItem, StockIssue } from '../types';
import { Utensils, Calendar, Save, AlertCircle, Filter, Clock, ChevronDown, ChevronUp, RefreshCw, Package } from 'lucide-react';

interface DepartmentsViewProps {
  departments: Department[];
  recipes: Recipe[];
  dishEntries: DepartmentDishEntry[];
  setDishEntries: React.Dispatch<React.SetStateAction<DepartmentDishEntry[]>>;
  stockIssues: StockIssue[];
  currentUser: User;
  selectedStartDate: string;
  selectedEndDate: string;
  setSelectedStartDate: (date: string) => void;
  setSelectedEndDate: (date: string) => void;
  addAuditLog: (action: string, details: string) => void;
  inventoryItems: InventoryItem[];
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  recipes,
  dishEntries,
  setDishEntries,
  stockIssues,
  currentUser,
  selectedStartDate,
  selectedEndDate,
  setSelectedStartDate,
  setSelectedEndDate,
  addAuditLog,
  inventoryItems,
}) => {
  const [activeDeptId, setActiveDeptId] = useState(departments[0]?.id || 'dept-indian');

  // Time Period Filter State
  const fromDate = selectedStartDate;
  const toDate = selectedEndDate;
  const [editingTargetDate, setEditingTargetDate] = useState<string>(selectedStartDate);
  const [showDailyBreakdown, setShowDailyBreakdown] = useState<boolean>(false);
  const [varianceTimeFilter, setVarianceTimeFilter] = useState<'today' | 'last7' | 'last30' | 'custom'>('today');
  const [varianceCustomStart, setVarianceCustomStart] = useState<string>(selectedStartDate);
  const [varianceCustomEnd, setVarianceCustomEnd] = useState<string>(selectedEndDate);

  // Keep date aligned if single date selected from top bar
  useEffect(() => {
    setEditingTargetDate(selectedStartDate);
  }, [selectedStartDate]);

  const currentDept = departments.find((d) => d.id === activeDeptId) || departments[0];
  const deptRecipes = recipes.filter((r) => r.departmentId === activeDeptId);

  const isRangeMode = fromDate !== toDate;

  // Compute entries for the filtered date range [fromDate, toDate]
  const entriesInRange = dishEntries.filter(
    (e) => e.departmentId === activeDeptId && e.date >= fromDate && e.date <= toDate
  );

  const varianceStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let filterStartDate = todayStr;
    let filterEndDate = todayStr;

    if (varianceTimeFilter === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      filterStartDate = d.toISOString().split('T')[0];
    } else if (varianceTimeFilter === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      filterStartDate = d.toISOString().split('T')[0];
    } else if (varianceTimeFilter === 'custom') {
      filterStartDate = varianceCustomStart;
      filterEndDate = varianceCustomEnd;
    }

    // Filter stock issues
    const deptIssues = stockIssues.filter(si => 
      si.departmentId === activeDeptId && 
      si.date >= filterStartDate && 
      si.date <= filterEndDate
    );

    // Filter dish entries (prep)
    const deptPreps = dishEntries.filter(de => 
      de.departmentId === activeDeptId &&
      de.date >= filterStartDate &&
      de.date <= filterEndDate
    );

    // Calculate Received per item
    const receivedMap: Record<string, number> = {};
    deptIssues.forEach(issue => {
      receivedMap[issue.itemName] = (receivedMap[issue.itemName] || 0) + issue.qtyKg;
    });

    // Calculate Used per item
    const usedMap: Record<string, number> = {};
    deptPreps.forEach(prep => {
      const recipe = deptRecipes.find(r => r.dishName === prep.dishName);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          usedMap[ing.itemName] = (usedMap[ing.itemName] || 0) + (prep.preparedPortion * ing.quantityPerPortionKg);
        });
      }
    });

    // Combine
    const allItemNames = Array.from(new Set([...Object.keys(receivedMap), ...Object.keys(usedMap)])).sort();
    
    return allItemNames.map(name => {
      const received = receivedMap[name] || 0;
      const used = usedMap[name] || 0;
      const variance = received - used;
      return { itemName: name, received, used, variance };
    });
  }, [activeDeptId, varianceTimeFilter, varianceCustomStart, varianceCustomEnd, stockIssues, dishEntries, deptRecipes]);

  // Compute aggregated or single-day entries for current department recipes
  const processedEntries = deptRecipes.map((recipe) => {
    if (!isRangeMode) {
      // Single Date View
      const existing = dishEntries.find(
        (e) => e.departmentId === activeDeptId && e.date === fromDate && e.dishName === recipe.dishName
      );
      if (existing) return existing;

      // Find the most recent entry before this date to get the closing portion
      const previousEntries = dishEntries
        .filter((e) => e.departmentId === activeDeptId && e.dishName === recipe.dishName && e.date < fromDate)
        .sort((a, b) => b.date.localeCompare(a.date));
      
      const lastClosing = previousEntries.length > 0 ? previousEntries[0].closingPortion : 0;

      return {
        id: `dde-${activeDeptId}-${recipe.dishName}-${fromDate}`,
        branchId: currentDept?.branchId || 'annanagar',
        departmentId: activeDeptId,
        date: fromDate,
        dishName: recipe.dishName,
        openingPortion: lastClosing,
        preparedPortion: 0,
        closingPortion: 0,
        salesPortion: 0,
      };
    } else {
      // Aggregated Date Range View
      const dishMatches = entriesInRange.filter((e) => e.dishName === recipe.dishName);
      if (dishMatches.length === 0) {
        return {
          id: `dde-agg-${activeDeptId}-${recipe.dishName}`,
          branchId: currentDept?.branchId || 'annanagar',
          departmentId: activeDeptId,
          date: `${fromDate} to ${toDate}`,
          dishName: recipe.dishName,
          openingPortion: 2,
          preparedPortion: 0,
          closingPortion: 2,
          salesPortion: 0,
          isAggregated: true,
        };
      }

      // Sort matches by date ascending
      const sorted = [...dishMatches].sort((a, b) => a.date.localeCompare(b.date));
      const totalPrepared = sorted.reduce((sum, item) => sum + item.preparedPortion, 0);
      const totalSales = sorted.reduce((sum, item) => sum + item.salesPortion, 0);
      const opening = sorted[0]?.openingPortion ?? 0;
      const closing = sorted[sorted.length - 1]?.closingPortion ?? (opening + totalPrepared - totalSales);

      return {
        id: `dde-agg-${activeDeptId}-${recipe.dishName}`,
        branchId: currentDept?.branchId || 'annanagar',
        departmentId: activeDeptId,
        date: `${fromDate} to ${toDate}`,
        dishName: recipe.dishName,
        openingPortion: opening,
        preparedPortion: totalPrepared,
        closingPortion: Math.max(0, closing),
        salesPortion: totalSales,
        isAggregated: true,
      };
    }
  });

  const handleUpdatePortion = (recipeDishName: string, field: keyof DepartmentDishEntry, value: number) => {
    if (field === 'openingPortion') {
      alert('Opening portion is calculated automatically based on previous closing stock.');
      return;
    }

    const targetDateToUpdate = isRangeMode ? editingTargetDate : fromDate;

    // Find existing or construct new
    const existing = dishEntries.find(
      (e) => e.departmentId === activeDeptId && e.date === targetDateToUpdate && e.dishName === recipeDishName
    );

    let baseEntry: DepartmentDishEntry;
    
    if (existing) {
      baseEntry = existing;
    } else {
      const previousEntries = dishEntries
        .filter((e) => e.departmentId === activeDeptId && e.dishName === recipeDishName && e.date < targetDateToUpdate)
        .sort((a, b) => b.date.localeCompare(a.date));
      const lastClosing = previousEntries.length > 0 ? previousEntries[0].closingPortion : 0;
      
      baseEntry = {
        id: `dde-${activeDeptId}-${recipeDishName}-${targetDateToUpdate}`,
        branchId: currentDept?.branchId || 'annanagar',
        departmentId: activeDeptId,
        date: targetDateToUpdate,
        dishName: recipeDishName,
        openingPortion: lastClosing,
        preparedPortion: 0,
        closingPortion: 0,
        salesPortion: 0,
      };
    }

    const updatedEntry = { ...baseEntry, [field]: Math.max(0, value) };

    setDishEntries((prev) => {
      const otherEntries = prev.filter(
        (e) => !(e.departmentId === activeDeptId && e.date === targetDateToUpdate && e.dishName === recipeDishName)
      );
      return [...otherEntries, updatedEntry];
    });
  };

  const handlePresetFilter = (preset: 'today' | 'last7' | 'thisMonth') => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setSelectedStartDate(todayStr);
      setSelectedEndDate(todayStr);
      setEditingTargetDate(todayStr);
    } else if (preset === 'last7') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 6);
      const pastStr = pastDate.toISOString().split('T')[0];
      setSelectedStartDate(pastStr);
      setSelectedEndDate(todayStr);
      setEditingTargetDate(todayStr);
    } else if (preset === 'thisMonth') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setSelectedStartDate(firstDay);
      setSelectedEndDate(todayStr);
      setEditingTargetDate(todayStr);
    }
  };

  const handleSaveDepartment = () => {
    const periodLabel = isRangeMode ? `${fromDate} to ${toDate}` : fromDate;
    alert(`Successfully saved kitchen operations for ${currentDept?.name} (${periodLabel}). Raw materials adjusted.`);
    addAuditLog('SAVE_DEPARTMENT_OPERATIONS', `Saved daily operations for ${currentDept?.name} for period ${periodLabel}`);
  };

  // Calculate day difference
  const daysDiff = Math.max(1, Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 3600 * 24)) + 1);

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
          {currentUser.role !== 'kitchen_supervisor' && (
            <button
              onClick={handleSaveDepartment}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm shadow-blue-500/20 flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Operations</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Time Period Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Presets:</span>
          <button
            onClick={() => handlePresetFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              fromDate === toDate && fromDate === new Date().toISOString().split('T')[0]
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handlePresetFilter('last7')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePresetFilter('thisMonth')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            This Month
          </button>
        </div>

        {isRangeMode && (
          <div className="flex items-center space-x-2">
            <label className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Target Date:
            </label>
            <div className="flex items-center bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              <input
                type="date"
                min={fromDate}
                max={toDate}
                value={editingTargetDate}
                onChange={(e) => setEditingTargetDate(e.target.value)}
                className="bg-transparent text-amber-700 focus:outline-none text-xs font-semibold w-full cursor-pointer"
              />
            </div>
          </div>
        )}
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

      {/* Dish / Item Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-800 text-base">{currentDept?.name} Dishes & Production Summary</h3>
            {isRangeMode && (
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-xs rounded-lg border border-purple-200">
                Range Summary ({daysDiff} Days)
              </span>
            )}
          </div>

          {isRangeMode && (
            <button
              onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
              className="px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-all"
            >
              <span>{showDailyBreakdown ? 'Hide Daily Logs' : 'View Daily Logs'}</span>
              {showDailyBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Dish / Item Name</th>
                <th className="py-3.5 px-4 text-center">
                  Opening {isRangeMode ? `(${fromDate})` : '(Portion)'}
                </th>
                <th className="py-3.5 px-4 text-center">
                  Prepared {isRangeMode ? `(Total ${daysDiff}d)` : '(Portion)'}
                </th>
                <th className="py-3.5 px-4 text-center">
                  Closing {isRangeMode ? `(${toDate})` : '(Portion)'}
                </th>
                <th className="py-3.5 px-4 text-center">
                  Sales {isRangeMode ? `(Total ${daysDiff}d)` : '(Portion)'}
                </th>
                <th className="py-3.5 px-4 text-center">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No dish entries for {currentDept?.name} in period {fromDate} to {toDate}.
                  </td>
                </tr>
              ) : (
                processedEntries.map((entry, index) => {
                  const usage = entry.openingPortion + entry.preparedPortion - entry.closingPortion;
                  const variance = entry.salesPortion - usage;
                  const varianceText = variance < 0 ? `Short ${Math.abs(variance)}` : variance > 0 ? `+${variance}` : '0';
                  const varianceColor = variance > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : variance < 0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div>{entry.dishName}</div>
                        {isRangeMode && (
                          <div className="text-[11px] font-normal text-slate-400">
                            Editing Target: <span className="font-semibold text-amber-600">{editingTargetDate}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          disabled
                          value={entry.openingPortion}
                          className="w-20 text-center py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed"
                          title="Opening is auto-calculated"
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
                          disabled={currentUser.role === 'kitchen_supervisor'}
                          value={entry.closingPortion}
                          onChange={(e) => handleUpdatePortion(entry.dishName, 'closingPortion', parseInt(e.target.value) || 0)}
                          className={`w-20 text-center py-1.5 border rounded-lg font-mono font-semibold ${currentUser.role === 'kitchen_supervisor' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'}`}
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

        {/* Daily Breakdown for Date Range View */}
        {isRangeMode && showDailyBreakdown && (
          <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Daily Breakdown Entries ({fromDate} to {toDate})</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Dish</th>
                    <th className="p-2.5 text-center">Opening</th>
                    <th className="p-2.5 text-center">Prepared</th>
                    <th className="p-2.5 text-center">Closing</th>
                    <th className="p-2.5 text-center">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entriesInRange.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        No recorded daily entries found in this date range. Edits in main table will record under target date {editingTargetDate}.
                      </td>
                    </tr>
                  ) : (
                    entriesInRange.map((de) => (
                      <tr key={de.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-700 font-semibold">{de.date}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{de.dishName}</td>
                        <td className="p-2.5 text-center font-mono">{de.openingPortion}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-600">{de.preparedPortion}</td>
                        <td className="p-2.5 text-center font-mono">{de.closingPortion}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{de.salesPortion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick initialize button if empty */}
        {processedEntries.length === 0 && (
          <div className="p-6 text-center">
            <button
              onClick={() => {
                const defaultDishes = deptRecipes.length > 0
                  ? deptRecipes.map((r, idx) => {
                      const previousEntries = dishEntries
                        .filter((e) => e.departmentId === currentDept.id && e.dishName === r.dishName && e.date < fromDate)
                        .sort((a, b) => b.date.localeCompare(a.date));
                      const lastClosing = previousEntries.length > 0 ? previousEntries[0].closingPortion : 0;
                      return {
                        id: `dde-${Date.now()}-${idx}`,
                        branchId: currentDept?.branchId || 'annanagar',
                        departmentId: currentDept.id,
                        date: fromDate,
                        dishName: r.dishName,
                        openingPortion: lastClosing,
                        preparedPortion: 0,
                        closingPortion: 0,
                        salesPortion: 0,
                      };
                    })
                  : [];
                if (defaultDishes.length > 0) {
                  setDishEntries((prev) => [...prev, ...defaultDishes]);
                }
              }}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Initialize Menu Entries for Period
            </button>
          </div>
        )}
      </div>

      {/* Raw Material Consumption & Variance */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Raw Material Consumption & Variance</h3>
              <p className="text-sm text-slate-500">Based on issued stock and prepared portions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setVarianceTimeFilter('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                varianceTimeFilter === 'today'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setVarianceTimeFilter('last7')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                varianceTimeFilter === 'last7'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setVarianceTimeFilter('last30')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                varianceTimeFilter === 'last30'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setVarianceTimeFilter('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                varianceTimeFilter === 'custom'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {varianceTimeFilter === 'custom' && (
          <div className="flex items-center space-x-3 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">From</span>
              <input
                type="date"
                value={varianceCustomStart}
                max={varianceCustomEnd}
                onChange={(e) => setVarianceCustomStart(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">To</span>
              <input
                type="date"
                value={varianceCustomEnd}
                min={varianceCustomStart}
                onChange={(e) => setVarianceCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-3 font-semibold">Raw Material</th>
                <th className="p-3 font-semibold text-center">Received (kg)</th>
                <th className="p-3 font-semibold text-center">Used (kg)</th>
                <th className="p-3 font-semibold text-center">Variance (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {varianceStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    No consumption data available for the selected period.
                  </td>
                </tr>
              ) : (
                varianceStats.map((stat, idx) => {
                  const isPositive = stat.variance > 0;
                  const isNegative = stat.variance < 0;
                  const varianceColor = isPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : isNegative ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200';
                  const varianceText = stat.variance > 0 ? `+${stat.variance.toFixed(3)}` : stat.variance.toFixed(3);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-800">{stat.itemName}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{stat.received.toFixed(3)}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{stat.used.toFixed(3)}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${varianceColor}`}>
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
      </div>
    </div>
  );
};

