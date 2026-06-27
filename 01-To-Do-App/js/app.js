let Tasks = [];
let i = 0;
const tbody = document.getElementById("TaskBody");
function getTask(id) {
  return Tasks.find((t) => t.Id === Number(id));
}
function isTaskLocked(task) {
  return task.Status === "Done";
}
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
function disableRow(tr) {
  tr.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
  tr.classList.add("table-success");
}
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
}
document.getElementById("Clear-Task").addEventListener("click", () => {
  document.getElementById("TaskInput").value = "";
});
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
  loadTable();
});
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
    loadTable();
    return;
  }
  if (target.classList.contains("Delete-Task")) {
    if (locked) {
      alert("Completed tasks cannot be deleted.");
      return;
    }
    Tasks = Tasks.filter((t) => t.Id !== id);
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
  }
});
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
