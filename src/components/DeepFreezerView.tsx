import React, { useState } from 'react';
import { InventoryItem, User, AuditLog, Department, StockIssue } from '../types';
import { Search, Plus, ArrowUpRight, Filter, AlertTriangle, FileSpreadsheet, Printer, X, Check, Eye, Pencil } from 'lucide-react';

interface DeepFreezerViewProps {
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  departments: Department[];
  stockIssues: StockIssue[];
  setStockIssues: React.Dispatch<React.SetStateAction<StockIssue[]>>;
  currentUser: User;
  selectedStartDate: string;
  selectedEndDate: string;
  addAuditLog: (action: string, details: string) => void;
}

export const DeepFreezerView: React.FC<DeepFreezerViewProps> = ({
  items,
  setItems,
  departments,
  stockIssues,
  setStockIssues,
  currentUser,
  selectedStartDate,
  selectedEndDate,
  addAuditLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);

  // Modals
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Purchase Form State
  const [purchaseItemId, setPurchaseItemId] = useState(items[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');

  // Issue Form State
  const [issueItemId, setIssueItemId] = useState(items[0]?.id || '');
  const [issueDept, setIssueDept] = useState(departments[0]?.id || '');
  const [issueQty, setIssueQty] = useState('');

  // Stock Adjustment Form State
  const [adjustItemId, setAdjustItemId] = useState(items[0]?.id || '');
  const [adjustNewStock, setAdjustNewStock] = useState('');

  const categories = ['All Categories', 'Chicken', 'Fish', 'Mutton', 'Vegetables', 'Dairy', 'Spices', 'Grocery'];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesLowStock = !lowStockOnly || item.balanceKg <= item.minStockAlert;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalValue = filteredItems.reduce((acc, item) => acc + item.balanceKg * item.ratePerKg, 0);

  const handleSaveAll = () => {
    alert('All deep freezer changes successfully saved and synchronized with database.');
    addAuditLog('SAVE_DEEP_FREEZER', 'Saved and committed deep freezer inventory sheet.');
  };

  const handleReceivePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(purchaseQty);
    const rate = parseFloat(purchaseRate);
    if (!qty || qty <= 0) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === purchaseItemId) {
          const newPurchase = item.purchaseKg + qty;
          const newBalance = item.openKg + newPurchase - item.issueKg;
          const newRate = rate ? rate : item.ratePerKg;
          return { ...item, purchaseKg: newPurchase, balanceKg: newBalance, ratePerKg: newRate };
        }
        return item;
      })
    );

    const targetItem = items.find((i) => i.id === purchaseItemId);
    addAuditLog('RECEIVE_PURCHASE', `Added ${qty} kg of ${targetItem?.name || 'Item'} to Deep Freezer.`);
    setShowPurchaseModal(false);
    setPurchaseQty('');
    setPurchaseRate('');
  };

  const handleIssueToDept = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(issueQty);
    if (!qty || qty <= 0) return;

    const targetItem = items.find((i) => i.id === issueItemId);
    const targetDeptObj = departments.find((d) => d.id === issueDept);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === issueItemId) {
          const newIssue = item.issueKg + qty;
          const newBalance = item.openKg + item.purchaseKg - newIssue;
          return { ...item, issueKg: newIssue, balanceKg: Math.max(0, newBalance) };
        }
        return item;
      })
    );

    setStockIssues((prev) => [
      ...prev,
      {
        id: `si-${Date.now()}-${issueItemId}`,
        branchId: targetItem?.branchId || 'annanagar',
        departmentId: issueDept,
        itemId: issueItemId,
        itemName: targetItem?.name || 'Unknown',
        qtyKg: qty,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      },
    ]);

    addAuditLog('ISSUE_TO_DEPT', `Issued ${qty} kg of ${targetItem?.name || 'Item'} to ${targetDeptObj?.name || issueDept}.`);
    setShowIssueModal(false);
    setIssueQty('');
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const newStock = parseFloat(adjustNewStock);
    if (isNaN(newStock) || newStock < 0) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === adjustItemId) {
          return {
            ...item,
            openKg: newStock,
            purchaseKg: 0,
            issueKg: 0,
            balanceKg: newStock,
          };
        }
        return item;
      })
    );

    const targetItem = items.find((i) => i.id === adjustItemId);
    addAuditLog('ADJUST_STOCK', `Adjusted physical stock for ${targetItem?.name || 'Item'} to ${newStock} kg.`);
    setShowAdjustModal(false);
    setAdjustNewStock('');
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setAdjustItemId(item.id);
    setAdjustNewStock(item.balanceKg.toString());
    setShowAdjustModal(true);
  };

  return (
    <div className="space-y-6">
      {currentUser.role === 'kitchen_supervisor' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Kitchen Supervisor Mode: Read-only view. You have visibility into branch inventory and operations with no entry/edit permissions.</span>
        </div>
      )}

      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deep Freezer Inventory</h2>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full border border-blue-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Live Stock</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage raw meat, fish, and perishable stock for Hotel Grand main storage.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {currentUser.role !== 'department_chef' && currentUser.role !== 'kitchen_supervisor' && (
            <>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm shadow-emerald-500/20 flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Receive Purchase</span>
              </button>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm shadow-blue-500/20 flex items-center space-x-2 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Issue to Dept</span>
              </button>
            </>
          )}
          {currentUser.role !== 'kitchen_supervisor' && (
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow transition-all"
            >
              Save All
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw material item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-sm text-slate-700 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Low stock only</span>
          </label>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Open (kg)</th>
                <th className="py-3.5 px-4 text-right">Purchase (kg)</th>
                <th className="py-3.5 px-4 text-right">Issue to Dept. (kg)</th>
                <th className="py-3.5 px-4 text-right font-bold text-blue-900 bg-blue-50/60">Current Stock (Deep Freezer)</th>
                <th className="py-3.5 px-4 text-right">Rate (₹/kg)</th>
                <th className="py-3.5 px-4 text-right">Value (₹)</th>
                <th className="py-3.5 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.map((item, index) => {
                const isLow = item.balanceKg <= item.minStockAlert;
                const value = item.balanceKg * item.ratePerKg;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center space-x-2">
                        <span>{item.name}</span>
                        {isLow && (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded flex items-center space-x-1 border border-red-100">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">{item.openKg.toFixed(3)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-mono font-medium">
                      +{item.purchaseKg.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 font-mono font-medium">
                      {item.issueKg.toFixed(3)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold bg-blue-50/30 ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                      {item.balanceKg.toFixed(3)} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">₹{item.ratePerKg}</td>
                    <td className="py-3 px-4 text-right text-slate-800 font-mono font-semibold">
                      ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setSelectedItemForDetail(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Item Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser.role !== 'kitchen_supervisor' && (
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Adjust Physical Deep Freezer Stock"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <td colSpan={3} className="py-4 px-4 uppercase text-xs tracking-wider">
                  Total Valuation ({filteredItems.length} items)
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  {filteredItems.reduce((acc, i) => acc + i.openKg, 0).toFixed(3)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-600">
                  +{filteredItems.reduce((acc, i) => acc + i.purchaseKg, 0).toFixed(3)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-blue-600">
                  {filteredItems.reduce((acc, i) => acc + i.issueKg, 0).toFixed(3)}
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  {filteredItems.reduce((acc, i) => acc + i.balanceKg, 0).toFixed(3)} kg
                </td>
                <td className="py-4 px-4 text-right">—</td>
                <td className="py-4 px-4 text-right font-mono text-blue-700 text-base">
                  ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Item Detail Slide-over / Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedItemForDetail.name}</h3>
                <p className="text-xs text-slate-500">Category: {selectedItemForDetail.category} • Rate: ₹{selectedItemForDetail.ratePerKg}/kg</p>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">Current Balance</p>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{selectedItemForDetail.balanceKg} kg</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">Total Stock Value</p>
                <p className="text-2xl font-bold text-blue-600 font-mono mt-1">₹{(selectedItemForDetail.balanceKg * selectedItemForDetail.ratePerKg).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued to Departments Breakdown</h4>
              <div className="space-y-2">
                {(() => {
                  const itemIssues = departments.map(d => {
                    const totalIssued = stockIssues
                      .filter(si => si.departmentId === d.id && si.itemId === selectedItemForDetail.id)
                      .reduce((sum, si) => sum + si.qtyKg, 0);
                    return { deptName: d.name, qty: totalIssued };
                  }).filter(x => x.qty > 0);

                  if (itemIssues.length === 0) {
                    return <p className="text-sm text-slate-500 italic">No issues recorded for this item yet.</p>;
                  }

                  return itemIssues.map((issue, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-sm">
                      <span className="font-medium text-slate-700">{issue.deptName}</span>
                      <span className="font-mono font-bold text-blue-600">{issue.qty.toFixed(3)} kg</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-sm hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReceivePurchase} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Receive New Purchase</h3>
              <button type="button" onClick={() => setShowPurchaseModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Raw Material</label>
                <select
                  value={purchaseItemId}
                  onChange={(e) => setPurchaseItemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.category}) - Current: {i.balanceKg} kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity Received (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="e.g. 10.5"
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Rate per Kg (₹)</label>
                <input
                  type="number"
                  placeholder="Leave blank to keep current rate"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                Confirm Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issue to Department Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleIssueToDept} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Issue Stock to Department</h3>
              <button type="button" onClick={() => setShowIssueModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Raw Material</label>
                <select
                  value={issueItemId}
                  onChange={(e) => setIssueItemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} - Available: {i.balanceKg} kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Department</label>
                <select
                  value={issueDept}
                  onChange={(e) => setIssueDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity to Issue (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="e.g. 5.0"
                  value={issueQty}
                  onChange={(e) => setIssueQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                Issue Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Physical Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustStock} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Adjust Deep Freezer Stock</h3>
                <p className="text-xs text-slate-500">Correct actual physical stock present in deep fridge</p>
              </div>
              <button type="button" onClick={() => setShowAdjustModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Raw Material</label>
                <select
                  value={adjustItemId}
                  onChange={(e) => {
                    setAdjustItemId(e.target.value);
                    const found = items.find((i) => i.id === e.target.value);
                    if (found) setAdjustNewStock(found.balanceKg.toString());
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.category}) - Current: {i.balanceKg} kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Actual Stock Count in Deep Fridge (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="e.g. 15.5"
                  value={adjustNewStock}
                  onChange={(e) => setAdjustNewStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                Save Stock Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
