// This will be work as a default state if any local storage is not available It will be assigned the first time value off variable
const defaultState = {
  tasks: [
    {
      id: "task-1",
      title: "Setup project architecture",
      desc: "Initialize git repository, install dependencies, and configure bundlers.",
      priority: "high",
      dueDate: "2026-07-10",
      assignee: "JD",
      column: "todo",
    },
    {
      id: "task-2",
      title: "Design application logo",
      desc: "Create minimalist vector layout concepts for application assets.",
      priority: "low",
      dueDate: "2026-07-15",
      assignee: "AS",
      column: "todo",
    },
    {
      id: "task-3",
      title: "Build HTML Template skeleton",
      desc: "Integrate CDNs and organize robust layout structure with Bootstrap grids.",
      priority: "medium",
      dueDate: "2026-07-02",
      assignee: "JD",
      column: "progress",
    },
  ],
};
// Here we that in browser local storage is available or not if it is available it will choose default state which will be called before
let state =
  JSON.parse(localStorage.getItem("kanban_board_state")) || defaultState;
// Whenever website it loads We need to boards event listeners for drag drop events
document.addEventListener("DOMContentLoaded", () => {
  renderBoard();
  setupEventListeners();
});
// Events Added
function setupEventListeners() {
  const taskModal = document.getElementById("taskModal");
  const taskForm = document.getElementById("taskForm");
  // Intercept modal opening to determine if we are creating or editing a task
  if (taskModal) {
    taskModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget; // Element that triggered the modal
      const taskId = button.getAttribute("data-task-id");
      if (!taskId) {
        // Mode: CREATE NEW TASK
        taskForm.reset();
        taskForm.removeAttribute("data-editing-id");
        document.getElementById("taskModalLabel").textContent = "Add New Task";
        // Set default due date to today
        document.getElementById("taskDueDate").value = new Date()
          .toISOString()
          .split("T")[0];
      } else {
        // Mode: EDIT EXISTING TASK
        document.getElementById("taskModalLabel").textContent =
          "Edit Task Details";
        taskForm.setAttribute("data-editing-id", taskId);
        // Fetch task details from state
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          document.getElementById("taskTitle").value = task.title;
          document.getElementById("taskDesc").value = task.desc;
          document.getElementById("taskPriority").value = task.priority;
          document.getElementById("taskDueDate").value = task.dueDate;
          document.getElementById("taskAssignee").value = task.assignee;
        }
      }
    });
  }
  // Handle Form Submission (Both Creation & Updates)
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editingId = taskForm.getAttribute("data-editing-id");
      const taskData = {
        title: document.getElementById("taskTitle").value.trim(),
        desc: document.getElementById("taskDesc").value.trim(),
        priority: document.getElementById("taskPriority").value,
        dueDate: document.getElementById("taskDueDate").value,
        assignee: document.getElementById("taskAssignee").value,
      };
      if (editingId) {
        // Update Action
        state.tasks = state.tasks.map((task) =>
          task.id === editingId ? { ...task, ...taskData } : task,
        );
      } else {
        // Create Action
        const newTask = {
          id: `task-${Date.now()}`, // Unique absolute timestamp hash
          ...taskData,
          column: "todo", // New tasks always drop safely into Todo first
        };
        state.tasks.push(newTask);
      }
      saveState();
      renderBoard();
      // Programmatically close bootstrap modal
      const modalInstance = bootstrap.Modal.getInstance(taskModal);
      if (modalInstance) modalInstance.hide();
    });
  }
  // Global Context Click delegation (Handles dynamically rendered Delete Button Triggers)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-task-btn")) {
      e.preventDefault();
      const taskId = e.target
        .closest(".delete-task-btn")
        .getAttribute("data-task-id");
      if (confirm("Are you sure you want to delete this task?")) {
        deleteTask(taskId);
      }
    }
  });
}
// 4. --- CRUD OPERATIONS ---
function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveState();
  renderBoard();
}
function saveState() {
  localStorage.setItem("kanban_board_state", JSON.stringify(state));
}
// 5. --- NATIVE HTML5 DRAG AND DROP API WRAPPERS ---
// Configured inline globally inside the HTML document setup
window.allowDrop = function (ev) {
  ev.preventDefault();
};
window.drag = function (ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
};
window.drop = function (ev) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text/plain");
  // Find valid drop column target container safely tracking up structural tree
  const columnBody = ev.target.closest(".column-body");
  if (!columnBody) return;
  const targetColumnId = columnBody.id; // col-todo, col-progress, col-testing, col-done
  const columnMapping = {
    "col-todo": "todo",
    "col-progress": "progress",
    "col-testing": "testing",
    "col-done": "done",
  };
  const newColumnName = columnMapping[targetColumnId];
  // Mutate state column placement target reference mapping
  state.tasks = state.tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, column: newColumnName };
    }
    return task;
  });
  saveState();
  renderBoard();
};
// 6. --- DYNAMIC UI RENDERING MOTOR ---
function renderBoard() {
  // Container targets
  const columns = {
    todo: document.getElementById("col-todo"),
    progress: document.getElementById("col-progress"),
    testing: document.getElementById("col-testing"),
    done: document.getElementById("col-done"),
  };
  // Clear existing nodes inside lanes safely
  Object.values(columns).forEach((col) => {
    if (col) col.innerHTML = "";
  });
  // Iterative task element mapper
  state.tasks.forEach((task) => {
    const targetColumn = columns[task.column];
    if (!targetColumn) return;
    // Resolve priority dynamic CSS badge colors safely
    let badgeClass = "bg-success";
    if (task.priority === "high") badgeClass = "bg-danger";
    if (task.priority === "medium") badgeClass = "bg-warning text-dark";
    // Format human readable date profile shortener logic (e.g. 2026-07-10 -> Jul 10)
    let displayDate = task.dueDate;
    if (task.dueDate) {
      const options = { month: "short", day: "numeric", timeZone: "UTC" };
      displayDate = new Date(task.dueDate).toLocaleDateString("en-US", options);
    }
    const cardHTML = `
      <div class="card border-0 shadow-sm mb-2 task-card" draggable="true" ondragstart="drag(event)" id="${task.id}">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge ${badgeClass} text-uppercase" style="font-size: 0.65rem;">${task.priority}</span>
            <div class="dropdown">
              <button class="btn p-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                <li>
                  <a class="dropdown-item edit-task-btn" href="#" data-bs-toggle="modal" data-bs-target="#taskModal" data-task-id="${task.id}">
                    <i class="bi bi-pencil me-2"></i> Edit
                  </a>
                </li>
                <li>
                  <a class="dropdown-item text-danger delete-task-btn" href="#" data-task-id="${task.id}">
                    <i class="bi bi-trash me-2"></i> Delete
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <h6 class="fw-semibold text-dark mb-1">${task.title}</h6>
          <p class="text-muted small mb-3">${task.desc || "No description provided."}</p>
          <div class="d-flex justify-content-between align-items-center border-top pt-2">
            <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i> ${displayDate}</span>
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 10px; font-weight: bold;">
              ${task.assignee}
            </div>
          </div>
        </div>
      </div>
    `;
    targetColumn.insertAdjacentHTML("beforeend", cardHTML);
  });
  // Update dynamic dynamic badge lane counter tallies
  updateCounters();
}
function updateCounters() {
  const counts = { todo: 0, progress: 0, testing: 0, done: 0 };
  state.tasks.forEach((task) => {
    if (counts.hasOwnProperty(task.column)) {
      counts[task.column]++;
    }
  });
  if (document.getElementById("todo-count"))
    document.getElementById("todo-count").textContent = counts.todo;
  if (document.getElementById("progress-count"))
    document.getElementById("progress-count").textContent = counts.progress;
  if (document.getElementById("testing-count"))
    document.getElementById("testing-count").textContent = counts.testing;
  if (document.getElementById("done-count"))
    document.getElementById("done-count").textContent = counts.done;
}
