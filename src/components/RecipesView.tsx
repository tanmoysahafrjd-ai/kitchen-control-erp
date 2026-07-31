import React, { useState } from 'react';
import { Recipe, Department, InventoryItem, User, RecipeIngredient, Branch } from '../types';
import { BookOpen, Plus, Calendar, Trash2, Edit3, X, Check, CheckCircle2, Pencil, Building2 } from 'lucide-react';

interface RecipesViewProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  branches?: Branch[];
  departments: Department[];
  inventoryItems: InventoryItem[];
  currentUser: User;
  addAuditLog: (action: string, details: string) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  setRecipes,
  branches = [],
  departments,
  inventoryItems,
  currentUser,
  addAuditLog,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [dishName, setDishName] = useState('');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(['all']);
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-08-01');
  const [portionUnit, setPortionUnit] = useState('Portion (350g)');
  const [ingredientsList, setIngredientsList] = useState<{ itemId: string; qtyGrams: string }[]>([
    { itemId: inventoryItems[0]?.id || '', qtyGrams: '150' },
  ]);

  const handleOpenCreateRecipe = () => {
    setEditingRecipe(null);
    setDishName('');
    setSelectedBranchIds(['all']);
    setDepartmentId(departments[0]?.id || '');
    setEffectiveFrom('2026-08-01');
    setPortionUnit('Portion (350g)');
    setIngredientsList([{ itemId: inventoryItems[0]?.id || '', qtyGrams: '150' }]);
    setShowModal(true);
  };

  const handleOpenEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setDishName(recipe.dishName);

    const isAllBranch = !recipe.branchIds || recipe.branchIds.includes('all') || recipe.branchIds.length === 0 || (branches.length > 0 && recipe.branchIds.length >= branches.length) || recipe.branchId === 'all';
    setSelectedBranchIds(isAllBranch ? ['all'] : recipe.branchIds);

    setDepartmentId(recipe.departmentId);
    setEffectiveFrom(recipe.effectiveFrom);
    setPortionUnit(recipe.portionUnit);
    setIngredientsList(
      recipe.ingredients.map((ing) => ({
        itemId: ing.itemId,
        qtyGrams: (ing.quantityPerPortionKg * 1000).toString(),
      }))
    );
    setShowModal(true);
  };

  const handleAddIngredientRow = () => {
    setIngredientsList([...ingredientsList, { itemId: inventoryItems[0]?.id || '', qtyGrams: '100' }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const isAllBranchSelected = selectedBranchIds.includes('all') || (branches.length > 0 && selectedBranchIds.length >= branches.length) || selectedBranchIds.length === 0;
    const primaryBranch = isAllBranchSelected ? (branches[0]?.id || 'annanagar') : (selectedBranchIds[0] || branches[0]?.id || 'annanagar');
    const finalBranchIds = isAllBranchSelected ? ['all'] : selectedBranchIds;

    const formattedIngredients: RecipeIngredient[] = ingredientsList.map((ing) => {
      const item = inventoryItems.find((i) => i.id === ing.itemId);
      return {
        itemId: ing.itemId,
        itemName: item?.name || 'Raw Material',
        quantityPerPortionKg: parseFloat(ing.qtyGrams) / 1000 || 0.1,
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
                departmentId,
                dishName,
                effectiveFrom,
                portionUnit,
                ingredients: formattedIngredients,
              }
            : r
        )
      );
      addAuditLog('UPDATE_RECIPE', `Updated recipe & BOM for ${dishName}`);
    } else {
      const newRecipe: Recipe = {
        id: `rec-${Date.now()}`,
        branchId: primaryBranch,
        branchIds: finalBranchIds,
        departmentId,
        dishName,
        portionUnit,
        effectiveFrom,
        active: true,
        ingredients: formattedIngredients,
      };
      setRecipes((prev) => [...prev, newRecipe]);
      addAuditLog('CREATE_RECIPE', `Created recipe for ${dishName} with effective date ${effectiveFrom}`);
    }

    setShowModal(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe and its Bill of Materials (BOM)?')) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      addAuditLog('DELETE_RECIPE', `Deleted recipe ID ${id}`);
    }
  };

  const handleToggleRecipeActive = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: r.active === false ? true : false } : r))
    );
    addAuditLog('TOGGLE_RECIPE', `Toggled active/inactive status for recipe ID ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recipe & Bill of Materials (BOM)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Define multi-ingredient recipes with effective dates, active/inactive controls, and automated inventory deductions.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleOpenCreateRecipe}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm shadow-blue-500/20 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Recipe</span>
          </button>
        )}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const dept = departments.find((d) => d.id === recipe.departmentId);
          const isActive = recipe.active !== false;

          return (
            <div
              key={recipe.id}
              className={`bg-white rounded-2xl shadow-sm border p-6 space-y-4 hover:shadow-md transition-shadow ${
                isActive ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50 opacity-80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg">
                    {dept?.name || 'Kitchen'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{recipe.dishName}</h3>
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
                    <span className="text-xs text-slate-400 font-normal">| {recipe.portionUnit}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleToggleRecipeActive(recipe.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center space-x-1 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title="Click to toggle Active / Inactive status"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  {(currentUser.role === 'admin' || currentUser.role === 'store_incharge') && (
                    <>
                      <button
                        onClick={() => handleOpenEditRecipe(recipe)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Recipe & BOM"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Ingredient BOM (1 Portion)</span>
                  <span className="text-[11px] font-normal text-slate-500 lowercase">eff: {recipe.effectiveFrom}</span>
                </div>
                <div className="space-y-1.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl text-xs">
                      <span className="font-medium text-slate-700">{ing.itemName}</span>
                      <span className="font-mono font-bold text-blue-600">{(ing.quantityPerPortionKg * 1000).toFixed(0)}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Modal (Create / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveRecipe} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecipe ? 'Edit Recipe & BOM' : 'Create New Recipe / BOM'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Chicken Biryani"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Portion Unit</label>
                <input
                  type="text"
                  required
                  value={portionUnit}
                  onChange={(e) => setPortionUnit(e.target.value)}
                  placeholder="e.g. Portion (350g) or Full Portion"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Ingredients builder */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Ingredients (per 1 portion)</label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ingredientsList.map((row, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <select
                        value={row.itemId}
                        onChange={(e) => {
                          const updated = [...ingredientsList];
                          updated[idx].itemId = e.target.value;
                          setIngredientsList(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                      >
                        {inventoryItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.category})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="1"
                        placeholder="Grams e.g. 150"
                        value={row.qtyGrams}
                        onChange={(e) => {
                          const updated = [...ingredientsList];
                          updated[idx].qtyGrams = e.target.value;
                          setIngredientsList(updated);
                        }}
                        className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                      <span className="text-xs text-slate-500 font-medium">g</span>
                      {ingredientsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
    </div>
  );
};

