const TransactionTypes = Object.freeze({
  INCOME: "Income",
  EXPENSE: "Expense",
});
const IncomeCategory = Object.freeze({
  SALARY: "Salary",
  FREELANCE: "Freelance",
  BUSINESS: "Business",
  INVESTMENT: "Investment",
  BONUS: "Bonus",
  GIFT: "Gift",
  OTHER: "Other",
});
const ExpenseCategory = Object.freeze({
  FOOD: "Food",
  SHOPPING: "Shopping",
  TRAVEL: "Travel",
  RENT: "Rent",
  BILLS: "Bills",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  TRANSPORTATION: "Transportation",
  OTHER: "Other",
});
function GetMonthData(key) {
  return (
    JSON.parse(localStorage.getItem(key)) || {
      totalIncome: 0,
      totalExpense: 0,
      budget: 0,
      transactions: [],
    }
  );
}
// State tracking configs
let expenseChartInstance = null;
let currentPage = 1;
const rowsPerPage = 5;
// Global UI assignments
const monthsSelected = document.querySelector("#MonthSelect");
const transactionForm = document.getElementById("transactionForm");
const transactionTbody = document.getElementById("TransactionTbody");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const months = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];
const today = new Date();
document.getElementById("transactionDate").value = today
  .toISOString()
  .split("T")[0];
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
let LocalStoragekey = `${currentMonth} - ${currentYear}`;
// Process Dynamic Financial Year drop down metrics
months.forEach((m, i) => {
  const options = document.createElement("option");
  const year = i < 9 ? fyStartYear : fyStartYear + 1;
  options.value = `${(i + 3) % 12} - ${year}`;
  options.textContent = `${m} - ${year}`;
  if (currentMonth === (i + 3) % 12) {
    options.selected = true;
  }
  monthsSelected.appendChild(options);
});
let MonthYear = GetMonthData(LocalStoragekey);
let lastId = Number(localStorage.getItem("LastTransactionId")) || 0;
function SavetoStorage() {
  localStorage.setItem(LocalStoragekey, JSON.stringify(MonthYear));
  localStorage.setItem("LastTransactionId", lastId.toString());
}
function recalculateTotals() {
  let income = 0;
  let expense = 0;
  MonthYear.transactions.forEach((t) => {
    if (t.type === TransactionTypes.INCOME) income += t.amount;
    else expense += t.amount;
  });
  MonthYear.totalIncome = income;
  MonthYear.totalExpense = expense;
}
function loadExpenseSummaryCards() {
  recalculateTotals();
  const totalIncome = MonthYear.totalIncome || 0;
  const totalExpense = MonthYear.totalExpense || 0;
  const balance = totalIncome - totalExpense;
  const budget = MonthYear.budget || 0;
  const cards = document.querySelectorAll("#ExpenseSummaryCard .card h3");
  cards[0].textContent = `₹${totalIncome.toFixed(2)}`;
  cards[1].textContent = `₹${totalExpense.toFixed(2)}`;
  cards[2].textContent = `₹${balance.toFixed(2)}`;
  document.getElementById("budgetAmount").textContent =
    `₹${budget.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
}
function renderTable(filterText = "") {
  transactionTbody.innerHTML = "";
  const filtered = MonthYear.transactions.filter((t) =>
    t.title.toLowerCase().includes(filterText.toLowerCase()),
  );
  const totalItems = filtered.length;
  document.getElementById("totalCountBadge").textContent =
    `${totalItems} total`;
  if (totalItems === 0) {
    transactionTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No transactions recorded for this period.</td></tr>`;
    document.getElementById("paginationInfo").textContent =
      "Showing 0-0 of 0 items";
    document.getElementById("paginationControls").innerHTML = "";
    return;
  }
  // Slicing metrics logic
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = filtered.slice(startIndex, endIndex);
  document.getElementById("paginationInfo").textContent =
    `Showing ${startIndex + 1}-${endIndex} of ${totalItems} items`;
  paginatedItems.forEach((t) => {
    const tr = document.createElement("tr");
    const isIncome = t.type === TransactionTypes.INCOME;
    const formattedDate = new Date(t.date).toLocaleDateString("en-IN");
    tr.innerHTML = `
      <td class="fw-semibold ps-4">${t.title}</td>
      <td>
        <span class="badge ${isIncome ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}">
          ${t.category}
        </span>
      </td>
      <td class="${isIncome ? "text-success" : "text-danger"} fw-medium">${t.type}</td>
      <td class="${isIncome ? "text-success" : "text-danger"} fw-bold">
        ${isIncome ? "+" : "-"}₹${t.amount.toFixed(2)}
      </td>
      <td class="text-muted small">${formattedDate}</td>
      <td class="text-end pe-4">
        <button class="btn btn-sm btn-light text-danger p-1 option-delete" data-id="${t.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    transactionTbody.appendChild(tr);
  });
  document.querySelectorAll(".option-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = Number(btn.getAttribute("data-id"));
      MonthYear.transactions = MonthYear.transactions.filter(
        (t) => t.id !== targetId,
      );
      SavetoStorage();
      loadExpenseSummaryCards();
      renderTable(searchInput.value);
      updateChart();
    });
  });
  setupPaginationControls(totalPages, filterText);
}
function setupPaginationControls(totalPages, filterText) {
  const controlsContainer = document.getElementById("paginationControls");
  controlsContainer.innerHTML = "";
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<button class="page-link border-0 bg-light me-1 px-3">Prev</button>`;
  if (currentPage > 1) {
    prevLi.addEventListener("click", () => {
      currentPage--;
      renderTable(filterText);
    });
  }
  controlsContainer.appendChild(prevLi);
  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${currentPage === i ? "active" : ""}`;
    pageLi.innerHTML = `<button class="page-link border-0 me-1 px-3">${i}</button>`;
    pageLi.addEventListener("click", () => {
      currentPage = i;
      renderTable(filterText);
    });
    controlsContainer.appendChild(pageLi);
  }
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextLi.innerHTML = `<button class="page-link border-0 bg-light px-3">Next</button>`;
  if (currentPage < totalPages) {
    nextLi.addEventListener("click", () => {
      currentPage++;
      renderTable(filterText);
    });
  }
  controlsContainer.appendChild(nextLi);
}
function updateChart() {
  const canvas = document.getElementById("expenseChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const expenses = MonthYear.transactions.filter(
    (t) => t.type === TransactionTypes.EXPENSE,
  );
  const dataMap = {};
  expenses.forEach((e) => {
    dataMap[e.category] = (dataMap[e.category] || 0) + e.amount;
  });
  const labels = Object.keys(dataMap);
  const dataValues = Object.values(dataMap);
  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }
  if (labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  expenseChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "#dc3545",
            "#fd7e14",
            "#ffc107",
            "#198754",
            "#20c997",
            "#0dcaf0",
            "#0d6efd",
            "#6610f2",
            "#6f42c1",
            "#d63384",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });
}
function exportToCSV() {
  if (MonthYear.transactions.length === 0) {
    alert("No data available to export for this month.");
    return;
  }
  const headers = ["Title", "Category", "Type", "Amount (INR)", "Date"];
  const rows = MonthYear.transactions.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.type}"`,
    t.amount.toFixed(2),
    t.date,
  ]);
  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join(
    "\n",
  );
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `ExpenseReport_${LocalStoragekey.replace(/ /g, "")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
// Event Triggers
monthsSelected.addEventListener("change", (e) => {
  LocalStoragekey = e.target.value;
  MonthYear = GetMonthData(LocalStoragekey);
  currentPage = 1;
  loadExpenseSummaryCards();
  renderTable();
  updateChart();
});
const editBtn = document.getElementById("editBudgetBtn");
const saveBtn = document.getElementById("saveBudgetBtn");
const editBox = document.getElementById("budgetEditBox");
const budgetInput = document.getElementById("budgetInput");
const budgetAmount = document.getElementById("budgetAmount");
editBtn.addEventListener("click", () => {
  editBox.classList.remove("d-none");
  budgetInput.value = MonthYear.budget || "";
  budgetInput.focus();
  budgetAmount.classList.add("d-none");
});
saveBtn.addEventListener("click", () => {
  const amount = Number(budgetInput.value) || 0;
  if (amount < 0) {
    alert("Budget cannot be negative.");
    return;
  }
  MonthYear.budget = amount;
  SavetoStorage();
  editBox.classList.add("d-none");
  budgetAmount.classList.remove("d-none");
  loadExpenseSummaryCards();
});
const TransactionTypeInput = document.getElementById("TransactionType");
const TypeCategory = document.getElementById("TypeCategory");
function loadCategories(type) {
  TypeCategory.innerHTML = "";
  const categories =
    type === TransactionTypes.INCOME
      ? Object.values(IncomeCategory)
      : Object.values(ExpenseCategory);
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    TypeCategory.appendChild(option);
  });
}
TransactionTypeInput.addEventListener("change", () => {
  const selectedType = document.getElementById("income").checked
    ? TransactionTypes.INCOME
    : TransactionTypes.EXPENSE;
  loadCategories(selectedType);
});
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("transactionTitle").value.trim();
  const amount = parseFloat(document.getElementById("transactionAmount").value);
  const date = document.getElementById("transactionDate").value;
  const type = document.getElementById("income").checked
    ? TransactionTypes.INCOME
    : TransactionTypes.EXPENSE;
  const category = TypeCategory.value;
  if (!title || isNaN(amount) || amount <= 0 || !date) return;
  lastId++;
  MonthYear.transactions.unshift({
    id: lastId,
    title,
    amount,
    date,
    type,
    category,
  });
  SavetoStorage();
  currentPage = 1;
  loadExpenseSummaryCards();
  renderTable();
  updateChart();
  transactionForm.reset();
  document.getElementById("transactionDate").value = today
    .toISOString()
    .split("T")[0];
  loadCategories(TransactionTypes.INCOME);
});
searchInput.addEventListener("input", (e) => {
  currentPage = 1;
  renderTable(e.target.value);
});
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentPage = 1;
  renderTable();
});
exportCsvBtn.addEventListener("click", exportToCSV);
document.addEventListener("DOMContentLoaded", () => {
  loadCategories(TransactionTypes.INCOME);
  loadExpenseSummaryCards();
  renderTable();
  updateChart();
});
