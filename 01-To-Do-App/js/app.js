// Fetching details of task related information from local storage if it is not in the local storage we are taking an empty array
let Tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
// Same we are fetching the last ID of a task from local storage If it is not available we are taking is as a zero
let i = Number(localStorage.getItem("todoLastId")) || 0;
// We are making a variable of task body
const tbody = document.getElementById("TaskBody");
// Save to storage function is used for storing although to do task into the local storage with key to task and to do last ID
function saveToStorage() {
  localStorage.setItem("todoTasks", JSON.stringify(Tasks));
  localStorage.setItem("todoLastId", i.toString());
}
// Get is check to get information about task using their Task ID
function getTask(id) {
  return Tasks.find((t) => t.Id === Number(id));
}
// This function is check that given task is done or not
function isTaskLocked(task) {
  return task.Status === "Done";
}
// Dynamically updates individual task counters in the footer
function updateTaskCounts() {
  const allCount = Tasks.length;
  const pendingCount = Tasks.filter((t) => t.Status === "pending").length;
  const doneCount = Tasks.filter((t) => t.Status === "Done").length;
  document.getElementById("CountAll").innerText = allCount;
  document.getElementById("CountPending").innerText = pendingCount;
  document.getElementById("CountDone").innerText = doneCount;
}
// These functions helps to hide the buttons which is not needed while editing the task information and showing only those button which is needed to show while editing
function toggleEditMode(tr, editing) {
  const span = tr.querySelector("td:nth-child(2) span");
  const input = tr.querySelector("td:nth-child(2) input");
  span.classList.toggle("d-none", editing);
  input.classList.toggle("d-none", !editing);
  tr.querySelectorAll(".Action").forEach((btn) => {
    btn.classList.toggle("d-none", editing);
  });
  tr.querySelectorAll(".Edit").forEach((btn) => {
    btn.classList.toggle("d-none", !editing);
  });
}
// This button works whenever task is done that row will be disabled at the same time.
function disableRow(tr) {
  tr.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
  tr.classList.add("table-success");
}
// This load table function is used to load all the tasks into the table it takes task to render function which is already assigned to the main original task so if in case we call it blank it will show all the data and if you reuse some filters that filters will be pass by of the parameter.
function loadTable(tasksToRender = Tasks) {
  tbody.innerHTML = "";
  tasksToRender.forEach((Task) => {
    const tr = document.createElement("tr");
    tr.dataset.id = Task.Id;
    tr.draggable = true;
    const tdId = document.createElement("td");
    tdId.innerText = Task.Id;
    const tdName = document.createElement("td");
    const span = document.createElement("span");
    span.innerText = Task.TaskTitle;
    const input = document.createElement("input");
    input.type = "text";
    input.value = Task.TaskTitle;
    input.className = "form-control d-none";
    tdName.append(span, input);
    const tdStatus = document.createElement("td");
    const badge = document.createElement("span");
    badge.innerText = Task.Status;
    badge.className =
      Task.Status === "Done"
        ? "badge bg-success"
        : "badge bg-warning text-dark";
    tdStatus.appendChild(badge);
    const tdAction = document.createElement("td");
    const group = document.createElement("div");
    group.className = "btn-group";
    const doneBtn = document.createElement("button");
    doneBtn.className = "btn btn-success Action Done-Task";
    doneBtn.innerText = "Done";
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-warning Action Edit-Task";
    editBtn.innerText = "Edit";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-info Edit CancelEdit d-none Save-Edit";
    saveBtn.innerText = "Save";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-secondary Edit d-none Cancel-Edit";
    cancelBtn.innerText = "Cancel";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger Action Delete-Task";
    deleteBtn.innerText = "Delete";
    if (isTaskLocked(Task)) {
      doneBtn.disabled = true;
      editBtn.disabled = true;
      deleteBtn.disabled = true;
      tr.classList.add("table-success");
    }
    group.append(doneBtn, editBtn, saveBtn, cancelBtn, deleteBtn);
    tdAction.appendChild(group);
    tr.append(tdId, tdName, tdStatus, tdAction);
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("tr").forEach(addDragEvents);
  // Update totals whenever the table updates
  updateTaskCounts();
}
// this functions use to clear input textbox sorry
document.getElementById("Clear-Task").addEventListener("click", () => {
  document.getElementById("TaskInput").value = "";
});
// These functions is To add the task list Will do with Primary precautions That it should not accept any blank or existing Task Into the table
document.getElementById("Add-Task").addEventListener("click", () => {
  const input = document.getElementById("TaskInput");
  const title = input.value.trim().toLowerCase();
  if (!title) {
    alert("Type something!");
    return;
  }
  if (Tasks.some((t) => t.TaskTitle === title)) {
    alert("Task already exists!");
    return;
  }
  Tasks.push({
    Id: ++i,
    TaskTitle: title,
    Status: "pending",
  });
  input.value = "";
  saveToStorage();
  loadTable();
});
// This function is used to Fetch any click perform on Tables body
tbody.addEventListener("click", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = Number(tr.dataset.id);
  const task = getTask(id);
  if (!task) return;
  const locked = isTaskLocked(task);
  const target = e.target;
  if (target.classList.contains("Done-Task")) {
    if (locked) return;
    task.Status = "Done";
    saveToStorage();
    loadTable();
    return;
  }
  if (target.classList.contains("Delete-Task")) {
    if (locked) {
      alert("Completed tasks cannot be deleted.");
      return;
    }
    Tasks = Tasks.filter((t) => t.Id !== id);
    saveToStorage();
    loadTable();
    return;
  }
  if (target.classList.contains("Edit-Task")) {
    if (locked) {
      alert("Completed tasks cannot be edited.");
      return;
    }
    toggleEditMode(tr, true);
    return;
  }
  if (target.classList.contains("Cancel-Edit")) {
    toggleEditMode(tr, false);
    tr.querySelector("input").value = task.TaskTitle;
    return;
  }
  if (target.classList.contains("Save-Edit")) {
    if (locked) {
      alert("Completed tasks cannot be edited.");
      return;
    }
    const input = tr.querySelector("input");
    const span = tr.querySelector("span");
    const newTitle = input.value.trim().toLowerCase();
    if (!newTitle) {
      alert("Task title cannot be empty.");
      input.focus();
      return;
    }
    const duplicate = Tasks.some(
      (t) => t.Id !== id && t.TaskTitle === newTitle,
    );
    if (duplicate) {
      alert("Task already exists.");
      input.focus();
      return;
    }
    task.TaskTitle = newTitle;
    span.innerText = newTitle;
    toggleEditMode(tr, false);
    saveToStorage();
    loadTable();
  }
});
// This Funcition is used apply filter on task table
function filterTasks() {
  const search = document.getElementById("Input-Action").value.toLowerCase();
  const filter = document.getElementById("Input-Select").value;
  const filtered = Tasks.filter((t) => {
    const matchSearch = t.TaskTitle.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "done" && t.Status === "Done") ||
      (filter === "pending" && t.Status === "pending");
    return matchSearch && matchFilter;
  });
  loadTable(filtered);
}
document.getElementById("Input-Action").addEventListener("input", filterTasks);
document.getElementById("Input-Select").addEventListener("change", filterTasks);
let draggedRow = null;
// This function Is used to apply events on table rows so that it would be easy to drag And Functionality to the task based on Their priority of User
function addDragEvents(row) {
  row.addEventListener("dragstart", () => {
    draggedRow = row;
    row.classList.add("dragging");
  });
  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
    draggedRow = null;
    tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("over"));
  });
  row.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  row.addEventListener("dragenter", () => {
    if (row !== draggedRow) row.classList.add("over");
  });
  row.addEventListener("dragleave", () => {
    row.classList.remove("over");
  });
  row.addEventListener("drop", (e) => {
    e.preventDefault();
    if (row !== draggedRow) {
      tbody.insertBefore(draggedRow, row);
      const newOrderedIds = Array.from(tbody.querySelectorAll("tr")).map((tr) =>
        Number(tr.dataset.id),
      );
      Tasks = newOrderedIds.map((id) => Tasks.find((t) => t.Id === id));
      saveToStorage();
    }
    row.classList.remove("over");
  });
}
// Initial Table Render
loadTable();
