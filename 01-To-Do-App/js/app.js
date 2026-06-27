let Tasks = [];
let i = 0;
let tbody = document.getElementById("TaskBody");
function loadTable(Tasks) {
  tbody.innerHTML = "";

  for (let Task of Tasks) {
    let tbodytr = document.createElement("tr");
    tbodytr.dataset.id = Task.Id;
    tbodytr.draggable = true;

    // ID
    let trtdid = document.createElement("td");
    trtdid.innerText = Task.Id;

    // Task Name
    let trtdName = document.createElement("td");

    let taskText = document.createElement("span");
    taskText.innerText = Task.TaskTitle;

    let taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.className = "form-control d-none";
    taskInput.value = Task.TaskTitle;

    trtdName.appendChild(taskText);
    trtdName.appendChild(taskInput);

    // Status
    let trtdStatus = document.createElement("td");

    let statusBadge = document.createElement("span");
    statusBadge.innerText = Task.Status;

    if (Task.Status === "pending") {
      statusBadge.className = "badge bg-warning text-dark";
    } else {
      statusBadge.className = "badge bg-success";
    }

    trtdStatus.appendChild(statusBadge);

    // Actions
    let trtdAction = document.createElement("td");

    let btngrp = document.createElement("div");
    btngrp.className = "btn-group";

    let doneBtn = document.createElement("button");
    doneBtn.className = "btn btn-success Action";
    doneBtn.id = "Done-Task";
    doneBtn.innerText = "Done";

    let editBtn = document.createElement("button");
    editBtn.className = "btn btn-warning Action";
    editBtn.id = "Edit-Task";
    editBtn.innerText = "Edit";

    let saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-info d-none Edit";
    saveBtn.id = "Save-Edit";
    saveBtn.innerText = "Save";

    let cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-warning d-none Edit";
    cancelBtn.id = "CancelEdit";
    cancelBtn.innerText = "Cancel";

    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger Action";
    deleteBtn.id = "Delete-Task";
    deleteBtn.innerText = "Delete";

    btngrp.append(doneBtn, editBtn, saveBtn, cancelBtn, deleteBtn);
    trtdAction.appendChild(btngrp);

    tbodytr.append(trtdid, trtdName, trtdStatus, trtdAction);

    tbody.appendChild(tbodytr);
  }
}
document.getElementById("Clear-Task").addEventListener("click", () => {
  document.getElementById("TaskInput").value = "";
});
document.getElementById("Add-Task").addEventListener("click", (e) => {
  let NewtaskEle = document.getElementById("TaskInput");
  const title = NewtaskEle.value.trim().toLowerCase();
  if (title === "") {
    alert("Type Something!");
    return;
  }
  const existing = Tasks.some((task) => task.TaskTitle === title);
  console.log(existing);
  if (existing) {
    alert("Task already exists!");
    return;
  }
  let Task = {
    Id: ++i,
    TaskTitle: title,
    isEditing: false,
    markAsDone: false,
    Status: "pending",
  };
  Tasks.push(Task);
  loadTable(Tasks);
  NewtaskEle.value = "";
});
tbody.addEventListener("click", (e) => {
  if (e.target.id === "Edit-Task") {
    const tr = e.target.closest("tr");
    const id = Number(tr.dataset.id);
    const task = Tasks.find((t) => t.Id === id);
    const span = tr.querySelector("span");
    const input = tr.querySelector("input");
    span.classList.add("d-none");
    input.classList.remove("d-none");
    tr.querySelectorAll(".Action").forEach((el) => {
      el.classList.add("d-none");
    });

    tr.querySelectorAll(".Edit").forEach((el) => {
      el.classList.remove("d-none");
    });
  }

  if (e.target.id === "Delete-Task") {
    const id = Number(e.target.closest("tr").dataset.id);
    Tasks = Tasks.filter((t) => t.Id !== id);
    console.log(id);
    loadTable(Tasks);
  }
  if (e.target.id === "Done-Task") {
    const id = e.target.closest("tr").dataset.id;
    const t = Tasks.find((t) => t.Id === Number(id));
    console.log(t, id);
    t.Status = "Done";
    loadTable(Tasks);
  }
  if (e.target.id === "CancelEdit") {
    const tr = e.target.closest("tr");
    const span = tr.querySelector("span");
    const input = tr.querySelector("input");
    span.classList.remove("d-none");
    input.classList.add("d-none");
    tr.querySelectorAll(".Action").forEach((el) => {
      el.classList.remove("d-none");
    });
    tr.querySelectorAll(".Edit").forEach((el) => {
      el.classList.add("d-none");
    });
  }
  if (e.target.id === "Save-Edit") {
    const tr = e.target.closest("tr");
    const id = Number(tr.dataset.id);

    const input = tr.querySelector("input");
    const span = tr.querySelector("span");

    const task = Tasks.find((t) => t.Id === id);
    if (!task) return;

    const newTitle = input.value.trim().toLowerCase();

    if (newTitle === "") {
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

    // Update task
    task.TaskTitle = newTitle;

    // Update UI
    span.innerText = newTitle;

    // Hide input, show text
    input.classList.add("d-none");
    span.classList.remove("d-none");

    // Show normal action buttons
    tr.querySelectorAll(".Action").forEach((el) => {
      el.classList.remove("d-none");
    });

    // Hide edit buttons
    tr.querySelectorAll(".Edit").forEach((el) => {
      el.classList.add("d-none");
    });
  }
});
