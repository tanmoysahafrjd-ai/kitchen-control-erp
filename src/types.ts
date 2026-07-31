export type Role = 'admin' | 'store_incharge' | 'kitchen_supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string;
  departmentId?: string; // For chefs
  active: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  branchId: string;
  iconName: string;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  branchIds?: string[]; // Mapped branch IDs or ['all']
  departmentIds?: string[]; // Mapped department IDs / names or ['all']
  name: string;
  category: 'Chicken' | 'Fish' | 'Mutton' | 'Vegetables' | 'Dairy' | 'Spices' | 'Grocery';
  openKg: number;
  purchaseKg: number;
  issueKg: number;
  balanceKg: number;
  ratePerKg: number;
  unit: string;
  minStockAlert: number;
  active: boolean;
}

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  quantityPerPortionKg: number; // e.g. 0.100 for 100g
}

export interface Recipe {
  id: string;
  branchId: string;
  branchIds?: string[]; // Mapped branch IDs or ['all']
  departmentId: string;
  dishName: string;
  portionUnit: string;
  ingredients: RecipeIngredient[];
  effectiveFrom: string;
  active: boolean;
}

export interface DepartmentDishEntry {
  id: string;
  branchId: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  dishName: string;
  openingPortion: number;
  preparedPortion: number;
  closingPortion: number;
  salesPortion: number;
}

export interface DepartmentStockItem {
  id: string;
  branchId: string;
  departmentId: string;
  itemId: string;
  itemName: string;
  openKg: number;
  receivedKg: number;
  consumedKg: number;
  closingKg: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  branchId: string;
  action: string;
  details: string;
}

export type TimeFilter = 'today' | 'last_7_days' | 'last_30_days' | 'custom';
