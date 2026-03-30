export interface TableRow {
  name: string;
  budget: string;
  actual: string;
}

export interface SavedBudget {
  id: string;
  label: string;
  date: string; // ISO string
  income: string;
  needsRows: TableRow[];
  wantsRows: TableRow[];
  savingsRows: TableRow[];
}

const CURRENT_KEY = "budget-planner-current";
const HISTORY_KEY = "budget-planner-history";

export const NEEDS_DEFAULT: TableRow[] = [
  "Rent / Mortgage", "Utilities", "Groceries", "Insurance",
  "Transportation", "Healthcare", "Childcare", "Other Need",
].map((name) => ({ name, budget: "", actual: "" }));

export const WANTS_DEFAULT: TableRow[] = [
  "Dining Out", "Entertainment", "Shopping", "Subscriptions",
  "Travel", "Hobbies", "Personal Care", "Other Want",
].map((name) => ({ name, budget: "", actual: "" }));

export const SAVINGS_DEFAULT: TableRow[] = [
  "Emergency Fund", "Retirement", "Investments", "Debt Payment", "Other Savings",
].map((name) => ({ name, budget: "", actual: "" }));

export function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function sumField(rows: TableRow[], field: "budget" | "actual") {
  return rows.reduce((s, r) => s + (parseFloat(r[field]) || 0), 0);
}

export function loadCurrent(): { income: string; needsRows: TableRow[]; wantsRows: TableRow[]; savingsRows: TableRow[] } | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveCurrent(data: { income: string; needsRows: TableRow[]; wantsRows: TableRow[]; savingsRows: TableRow[] }) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(data));
}

export function loadHistory(): SavedBudget[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveToHistory(budget: SavedBudget) {
  const history = loadHistory();
  history.unshift(budget);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteFromHistory(id: string) {
  const history = loadHistory().filter((b) => b.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
