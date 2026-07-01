const TransactionType = Object.freeze({
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
const TransactionCategories = Object.freeze({
  [TransactionType.INCOME]: Object.values(IncomeCategory),
  [TransactionType.EXPENSE]: Object.values(ExpenseCategory),
});
function GetMonthData(LocalStoragekey) {
  console.log(LocalStoragekey);
  return (
    JSON.parse(localStorage.getItem(LocalStoragekey)) || {
      totalIncome: 0,
      totalExpense: 0,
      budget: 0,
      transactions: [],
    }
  );
}
// This is loading the drop down of current financial year month and year into the drop down select Which is placed in navbar
const monthsSelected = document.querySelector("#MonthSelect");
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
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
let LocalStoragekey = `${currentMonth} - ${currentYear}`;
months.forEach((m, i) => {
  const options = document.createElement("option");
  const year = i < 9 ? fyStartYear : fyStartYear + 1;
  options.value = `${(i + 3) % 12} - ${year}`;
  options.textContent = `${m} - ${year}`;
  if (currentMonth == (i + 3) % 12) {
    options.selected = true;
  }
  monthsSelected.appendChild(options);
});
MonthSelect.addEventListener("change", (e) => {
  LocalStoragekey = e.target.value;
  MonthYear = GetMonthData(LocalStoragekey);
  loadExpenseSummaryCards();
});
// Fetching information from local storage
let MonthYear = GetMonthData(LocalStoragekey);
let id = Number(localStorage.getItem("LastTransactionId")) || 0;
console.log(MonthYear, id);
function SavetoStorage() {
  localStorage.setItem(LocalStoragekey, JSON.stringify(MonthYear));
  localStorage.setItem("LastTransactionId", JSON.stringify(id.toString()));
}

function loadExpenseSummaryCards() {
  const totalIncome = MonthYear.totalIncome || 0;
  const totalExpense = MonthYear.totalExpense || 0;
  const balance = totalIncome - totalExpense;
  const budget = MonthYear.budget || 0;
  const cards = document.querySelectorAll("#ExpenseSummaryCard .card h3");
  cards[0].textContent = `₹${totalIncome.toFixed(2)}`;
  cards[1].textContent = `₹${totalExpense.toFixed(2)}`;
  cards[2].textContent = `₹${balance.toFixed(2)}`;
  cards[3].textContent = `₹${budget.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
loadExpenseSummaryCards();
// Editing budget for Selected month Is below
const editBtn = document.getElementById("editBudgetBtn");
const saveBtn = document.getElementById("saveBudgetBtn");
const editBox = document.getElementById("budgetEditBox");
const budgetInput = document.getElementById("budgetInput");
const budgetAmount = document.getElementById("budgetAmount");
editBtn.addEventListener("click", () => {
  editBox.classList.remove("d-none");
  budgetInput.value = "";
  budgetInput.focus();
  budgetAmount.classList.add("d-none");
});
saveBtn.addEventListener("click", () => {
  const amount = Number(budgetInput.value) || 0;
  budgetAmount.textContent = `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  MonthYear.budget = amount;
  SavetoStorage();
  editBox.classList.add("d-none");
  budgetAmount.classList.remove("d-none");
});
