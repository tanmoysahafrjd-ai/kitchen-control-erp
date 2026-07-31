import { Branch, Department, InventoryItem, Recipe, DepartmentDishEntry, DepartmentStockItem, User, AuditLog } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'annanagar', name: 'Annanagar', code: 'ANN', location: 'Annanagar 2nd Avenue', active: true },
  { id: 'valechery', name: 'Valechery', code: 'VAL', location: 'Valechery Main Road', active: true },
  { id: 'rapuram', name: 'Ra Puram', code: 'RAP', location: 'Ra Puram 1st Main Road', active: true },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  // Annanagar
  { id: 'dept-annanagar-indian', name: 'Indian Kitchen', branchId: 'annanagar', iconName: 'Flame' },
  { id: 'dept-annanagar-chinese', name: 'Chinese Kitchen', branchId: 'annanagar', iconName: 'Utensils' },
  { id: 'dept-annanagar-tandoori', name: 'Tandoori Kitchen', branchId: 'annanagar', iconName: 'Sparkles' },
  // Valechery
  { id: 'dept-valechery-indian', name: 'Indian Kitchen', branchId: 'valechery', iconName: 'Flame' },
  { id: 'dept-valechery-chinese', name: 'Chinese Kitchen', branchId: 'valechery', iconName: 'Utensils' },
  // Ra Puram
  { id: 'dept-rapuram-indian', name: 'Indian Kitchen', branchId: 'rapuram', iconName: 'Flame' },
  { id: 'dept-rapuram-tandoori', name: 'Tandoori Kitchen', branchId: 'rapuram', iconName: 'Sparkles' },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'System Admin', email: 'admin@hotelgrand.com', role: 'admin', branchId: 'annanagar', active: true, createdAt: '2026-01-01' },
  // Annanagar Users
  { id: 'u2', name: 'Store Incharge (Annanagar)', email: 'store.annanagar@hotelgrand.com', role: 'store_incharge', branchId: 'annanagar', active: true, createdAt: '2026-01-10' },
  { id: 'u3', name: 'Kitchen Supervisor (Annanagar)', email: 'supervisor.annanagar@hotelgrand.com', role: 'kitchen_supervisor', branchId: 'annanagar', active: true, createdAt: '2026-01-12' },
  // Valechery Users
  { id: 'u4', name: 'Store Incharge (Valechery)', email: 'store.valechery@hotelgrand.com', role: 'store_incharge', branchId: 'valechery', active: true, createdAt: '2026-01-15' },
  { id: 'u5', name: 'Kitchen Supervisor (Valechery)', email: 'supervisor.valechery@hotelgrand.com', role: 'kitchen_supervisor', branchId: 'valechery', active: true, createdAt: '2026-01-16' },
  // Ra Puram Users
  { id: 'u6', name: 'Store Incharge (Ra Puram)', email: 'store.rapuram@hotelgrand.com', role: 'store_incharge', branchId: 'rapuram', active: true, createdAt: '2026-01-20' },
  { id: 'u7', name: 'Kitchen Supervisor (Ra Puram)', email: 'supervisor.rapuram@hotelgrand.com', role: 'kitchen_supervisor', branchId: 'rapuram', active: true, createdAt: '2026-01-22' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Annanagar Items
  { id: 'item-ann-1', branchId: 'annanagar', branchIds: ['annanagar', 'valechery'], departmentIds: ['all'], name: 'Breast Boneless', category: 'Chicken', openKg: 25.0, purchaseKg: 5.0, issueKg: 8.0, balanceKg: 22.0, ratePerKg: 320, unit: 'kg', minStockAlert: 10, active: true },
  { id: 'item-ann-2', branchId: 'annanagar', branchIds: ['annanagar'], departmentIds: ['Indian Kitchen', 'Tandoori Kitchen'], name: 'Leg Boneless', category: 'Chicken', openKg: 18.0, purchaseKg: 10.0, issueKg: 8.0, balanceKg: 20.0, ratePerKg: 280, unit: 'kg', minStockAlert: 8, active: true },
  { id: 'item-ann-3', branchId: 'annanagar', branchIds: ['annanagar', 'rapuram'], departmentIds: ['Indian Kitchen'], name: 'Prawns 16/20', category: 'Fish', openKg: 12.0, purchaseKg: 0.0, issueKg: 3.0, balanceKg: 9.0, ratePerKg: 650, unit: 'kg', minStockAlert: 5, active: true },
  { id: 'item-ann-4', branchId: 'annanagar', branchIds: ['all'], departmentIds: ['all'], name: 'Mutton Boneless', category: 'Mutton', openKg: 15.0, purchaseKg: 4.0, issueKg: 5.0, balanceKg: 14.0, ratePerKg: 550, unit: 'kg', minStockAlert: 6, active: true },

  // Valechery Items
  { id: 'item-val-1', branchId: 'valechery', branchIds: ['valechery'], departmentIds: ['Indian Kitchen', 'Chinese Kitchen'], name: 'Breast Boneless', category: 'Chicken', openKg: 15.0, purchaseKg: 8.0, issueKg: 6.0, balanceKg: 17.0, ratePerKg: 320, unit: 'kg', minStockAlert: 5, active: true },
  { id: 'item-val-2', branchId: 'valechery', branchIds: ['valechery'], departmentIds: ['all'], name: 'Basha Fish', category: 'Fish', openKg: 10.0, purchaseKg: 5.0, issueKg: 4.0, balanceKg: 11.0, ratePerKg: 260, unit: 'kg', minStockAlert: 4, active: true },

  // Ra Puram Items
  { id: 'item-rap-1', branchId: 'rapuram', branchIds: ['rapuram'], departmentIds: ['all'], name: 'Seaside Lobster', category: 'Fish', openKg: 8.0, purchaseKg: 3.0, issueKg: 4.0, balanceKg: 7.0, ratePerKg: 1200, unit: 'kg', minStockAlert: 3, active: true },
  { id: 'item-rap-2', branchId: 'rapuram', branchIds: ['rapuram', 'annanagar'], departmentIds: ['all'], name: 'Pomfret Whole', category: 'Fish', openKg: 20.0, purchaseKg: 10.0, issueKg: 12.0, balanceKg: 18.0, ratePerKg: 750, unit: 'kg', minStockAlert: 8, active: true },
];

export const INITIAL_RECIPES: Recipe[] = [
  // Annanagar - Indian Kitchen Recipes
  {
    id: 'rec-ann-1',
    branchId: 'annanagar',
    branchIds: ['all'],
    departmentId: 'dept-annanagar-indian',
    dishName: 'Chicken 65 (Andhra Style)',
    portionUnit: 'Portion (approx 350g)',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-ann-1', itemName: 'Breast Boneless', quantityPerPortionKg: 0.150 },
      { itemId: 'item-ann-2', itemName: 'Leg Boneless', quantityPerPortionKg: 0.050 },
    ],
  },
  {
    id: 'rec-ann-2',
    branchId: 'annanagar',
    branchIds: ['all'],
    departmentId: 'dept-annanagar-indian',
    dishName: 'Mutton Sukka',
    portionUnit: 'Portion (approx 300g)',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-ann-4', itemName: 'Mutton Boneless', quantityPerPortionKg: 0.200 },
    ],
  },
  {
    id: 'rec-ann-3',
    branchId: 'annanagar',
    branchIds: ['annanagar', 'valechery'],
    departmentId: 'dept-annanagar-indian',
    dishName: 'Kozhi Varuval',
    portionUnit: 'Portion (approx 350g)',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-ann-1', itemName: 'Breast Boneless', quantityPerPortionKg: 0.120 },
    ],
  },
  // Annanagar - Chinese Kitchen Recipes
  {
    id: 'rec-ann-4',
    branchId: 'annanagar',
    branchIds: ['all'],
    departmentId: 'dept-annanagar-chinese',
    dishName: 'Butter Garlic Chicken (Chinese)',
    portionUnit: 'Portion (approx 400g)',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-ann-1', itemName: 'Breast Boneless', quantityPerPortionKg: 0.200 },
    ],
  },
  {
    id: 'rec-ann-5',
    branchId: 'annanagar',
    branchIds: ['all'],
    departmentId: 'dept-annanagar-tandoori',
    dishName: 'Tandoori Chicken Full',
    portionUnit: 'Full Portion',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-ann-1', itemName: 'Breast Boneless', quantityPerPortionKg: 0.400 },
      { itemId: 'item-ann-2', itemName: 'Leg Boneless', quantityPerPortionKg: 0.400 },
    ],
  },
  // Valechery Recipes
  {
    id: 'rec-val-1',
    branchId: 'valechery',
    branchIds: ['valechery'],
    departmentId: 'dept-valechery-indian',
    dishName: 'Andhra Chilli Chicken',
    portionUnit: 'Portion',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-val-1', itemName: 'Breast Boneless', quantityPerPortionKg: 0.180 },
    ],
  },
  // Ra Puram Recipes
  {
    id: 'rec-rap-1',
    branchId: 'rapuram',
    branchIds: ['rapuram'],
    departmentId: 'dept-rapuram-indian',
    dishName: 'Seafood Special Curry',
    portionUnit: 'Portion',
    effectiveFrom: '2026-07-01',
    active: true,
    ingredients: [
      { itemId: 'item-rap-2', itemName: 'Pomfret Whole', quantityPerPortionKg: 0.300 },
    ],
  },
];

export const INITIAL_DEPARTMENT_DISH_ENTRIES: DepartmentDishEntry[] = [
  // Annanagar
  { id: 'dde-1', branchId: 'annanagar', departmentId: 'dept-annanagar-indian', date: '2026-07-31', dishName: 'Chicken 65 (Andhra Style)', openingPortion: 2, preparedPortion: 10, closingPortion: 3, salesPortion: 9 },
  // Valechery
  { id: 'dde-2', branchId: 'valechery', departmentId: 'dept-valechery-indian', date: '2026-07-31', dishName: 'Andhra Chilli Chicken', openingPortion: 1, preparedPortion: 8, closingPortion: 2, salesPortion: 7 },
  // Ra Puram
  { id: 'dde-3', branchId: 'rapuram', departmentId: 'dept-rapuram-indian', date: '2026-07-31', dishName: 'Seafood Special Curry', openingPortion: 0, preparedPortion: 5, closingPortion: 1, salesPortion: 4 },
];

export const INITIAL_DEPARTMENT_STOCK: DepartmentStockItem[] = [
  { id: 'ds-1', branchId: 'annanagar', departmentId: 'dept-annanagar-indian', itemId: 'item-ann-1', itemName: 'Breast Boneless', openKg: 8.0, receivedKg: 5.0, consumedKg: 4.5, closingKg: 8.5 },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-07-31 10:45:00', userId: 'u2', userName: 'Store Incharge (Annanagar)', role: 'store_incharge', branchId: 'annanagar', action: 'ISSUE_TO_DEPT', details: 'Issued 5.0 kg Breast Boneless to Indian Kitchen' },
  { id: 'log-2', timestamp: '2026-07-31 09:30:00', userId: 'u4', userName: 'Store Incharge (Valechery)', role: 'store_incharge', branchId: 'valechery', action: 'RECEIVE_PURCHASE', details: 'Added 8.0 kg Breast Boneless for Valechery Branch' },
];
