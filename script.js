"use strict";

const STORAGE_KEY = "expense-tracker-data";
const THEME_KEY = "expense-tracker-theme";

const CATEGORIES = {
  Food:          { icon: "🍔", color: "#f59e0b" },
  Travel:        { icon: "✈️", color: "#0ea5e9" },
  Shopping:      { icon: "🛍️", color: "#ec4899" },
  Bills:         { icon: "🧾", color: "#8b5cf6" },
  Entertainment: { icon: "🎬", color: "#ef4444" },
  Health:        { icon: "💊", color: "#10b981" },
  Other:         { icon: "📦", color: "#64748b" },
};
const catInfo = (name) => CATEGORIES[name] || CATEGORIES.Other;

// ---------- State ----------
let expenses = loadExpenses();

// ---------- DOM ----------
const form = document.getElementById("expenseForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const idInput = document.getElementById("expenseId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const filterCategory = document.getElementById("filterCategory");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");
const sortBy = document.getElementById("sortBy");
const clearFiltersBtn = document.getElementById("clearFilters");

const listEl = document.getElementById("expenseList");
const emptyEl = document.getElementById("emptyState");
const totalEl = document.getElementById("totalAmount");
const countEl = document.getElementById("expenseCount");
const topCategoryEl = document.getElementById("topCategory");
const summaryEl = document.getElementById("categorySummary");
const toastEl = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");

// ---------- Storage ----------
function loadExpenses() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ---------- Helpers ----------
const formatMoney = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

// ---------- Theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
applyTheme(
  localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
);
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ---------- Validation ----------
function setError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
}

function validateForm() {
  let valid = true;

  const title = titleInput.value.trim();
  if (title.length < 2) {
    setError(titleInput, "titleError", "Title must be at least 2 characters.");
    valid = false;
  } else setError(titleInput, "titleError", "");

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    setError(amountInput, "amountError", "Enter an amount greater than 0.");
    valid = false;
  } else setError(amountInput, "amountError", "");

  if (!categoryInput.value) {
    setError(categoryInput, "categoryError", "Please choose a category.");
    valid = false;
  } else setError(categoryInput, "categoryError", "");

  if (!dateInput.value) {
    setError(dateInput, "dateError", "Please select a date.");
    valid = false;
  } else setError(dateInput, "dateError", "");

  return valid;
}

// ---------- CRUD ----------
function addExpense(data) {
  expenses.push({ id: Date.now().toString(), ...data });
}

function updateExpense(id, data) {
  expenses = expenses.map((e) => (e.id === id ? { ...e, ...data } : e));
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  expenses = expenses.filter((e) => e.id !== id);
  if (idInput.value === id) resetForm();
  saveExpenses();
  render();
  showToast("Expense deleted");
}

function startEdit(id) {
  const exp = expenses.find((e) => e.id === id);
  if (!exp) return;
  idInput.value = exp.id;
  titleInput.value = exp.title;
  amountInput.value = exp.amount;
  categoryInput.value = exp.category;
  dateInput.value = exp.date;
  formTitle.textContent = "Edit Expense";
  submitBtn.textContent = "Update Expense";
  cancelBtn.classList.remove("hidden");
  titleInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetForm() {
  form.reset();
  idInput.value = "";
  dateInput.value = todayISO();
  formTitle.textContent = "Add Expense";
  submitBtn.textContent = "Add Expense";
  cancelBtn.classList.add("hidden");
  [
    [titleInput, "titleError"],
    [amountInput, "amountError"],
    [categoryInput, "categoryError"],
    [dateInput, "dateError"],
  ].forEach(([input, err]) => setError(input, err, ""));
}

// ---------- Filtering & sorting ----------
function getVisibleExpenses() {
  const result = expenses.filter((e) => {
    if (filterCategory.value !== "All" && e.category !== filterCategory.value) return false;
    if (filterFrom.value && e.date < filterFrom.value) return false;
    if (filterTo.value && e.date > filterTo.value) return false;
    return true;
  });

  const sorters = {
    dateDesc: (a, b) => b.date.localeCompare(a.date),
    dateAsc: (a, b) => a.date.localeCompare(b.date),
    amountDesc: (a, b) => b.amount - a.amount,
    amountAsc: (a, b) => a.amount - b.amount,
  };
  return result.sort(sorters[sortBy.value]);
}

// ---------- Rendering ----------
function render() {
  const visible = getVisibleExpenses();

  listEl.innerHTML = visible
    .map((e) => {
      const { icon, color } = catInfo(e.category);
      return `
      <li class="expense-item" style="--c:${color}">
        <div class="cat-icon">${icon}</div>
        <div class="expense-info">
          <h4>${escapeHTML(e.title)}</h4>
          <div class="expense-meta">
            <span class="badge">${escapeHTML(e.category)}</span>
            <span>${formatDate(e.date)}</span>
          </div>
        </div>
        <div class="expense-right">
          <span class="expense-amount">${formatMoney(e.amount)}</span>
          <div class="expense-actions">
            <button class="btn small ghost" data-action="edit" data-id="${e.id}">Edit</button>
            <button class="btn small danger" data-action="delete" data-id="${e.id}">Delete</button>
          </div>
        </div>
      </li>`;
    })
    .join("");
  emptyEl.classList.toggle("hidden", visible.length > 0);

  const total = visible.reduce((sum, e) => sum + e.amount, 0);
  totalEl.textContent = formatMoney(total);
  countEl.textContent = visible.length;

  const byCategory = visible.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  topCategoryEl.textContent = entries.length
    ? `${catInfo(entries[0][0]).icon} ${entries[0][0]}`
    : "—";

  summaryEl.innerHTML = entries.length
    ? entries
        .map(([cat, amt]) => {
          const pct = total ? (amt / total) * 100 : 0;
          const { icon, color } = catInfo(cat);
          return `
          <div class="summary-row" style="--c:${color}">
            <div class="row-top">
              <span>${icon} ${escapeHTML(cat)}</span>
              <span>${formatMoney(amt)} · ${pct.toFixed(0)}%</span>
            </div>
            <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
          </div>`;
        })
        .join("")
    : '<div class="empty"><p>No data to summarize yet.</p></div>';
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const data = {
    title: titleInput.value.trim(),
    amount: parseFloat(parseFloat(amountInput.value).toFixed(2)),
    category: categoryInput.value,
    date: dateInput.value,
  };

  const editing = Boolean(idInput.value);
  if (editing) updateExpense(idInput.value, data);
  else addExpense(data);

  saveExpenses();
  resetForm();
  render();
  showToast(editing ? "Expense updated ✓" : "Expense added ✓");
});

cancelBtn.addEventListener("click", resetForm);

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "edit") startEdit(id);
  if (action === "delete") deleteExpense(id);
});

[filterCategory, filterFrom, filterTo, sortBy].forEach((el) =>
  el.addEventListener("input", render)
);

clearFiltersBtn.addEventListener("click", () => {
  filterCategory.value = "All";
  filterFrom.value = "";
  filterTo.value = "";
  sortBy.value = "dateDesc";
  render();
});

// ---------- Init ----------
resetForm();
render();
