// ============================================================
// Tasks API client — connect this to your Node.js backend.
// Replace the in-memory MOCK_DB implementations with real fetch
// calls to your REST endpoints.
//
// Expected backend endpoints (suggested):
//   GET    /api/tasks            -> Task[]
//   POST   /api/tasks            -> Task          (body: TaskInput)
//   PUT    /api/tasks/:id        -> Task          (body: Partial<TaskInput>)
//   DELETE /api/tasks/:id        -> { ok: true }
//   GET    /api/tasks/export     -> text/plain    (FR10 export)
// ============================================================

export type Priority = "High" | "Medium" | "Low";
export type Status = "ToDo" | "Completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date
  priority: Priority;
  status: Status;
}

export type TaskInput = Omit<Task, "id" | "status"> & { status?: Status };

// TODO(BACKEND): set this to your Node API base URL, e.g. "http://localhost:3000"
const API_BASE = "";

// ---------- MOCK (remove once backend is wired) ----------
const LS_KEY = "smart-tasks-mock";
const loadMock = (): Task[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
};
const saveMock = (t: Task[]) => localStorage.setItem(LS_KEY, JSON.stringify(t));
// ---------------------------------------------------------

export async function fetchTasks(): Promise<Task[]> {
  // TODO(BACKEND): return (await fetch(`${API_BASE}/api/tasks`)).json();
  return loadMock();
}

export async function createTask(input: TaskInput): Promise<Task> {
  // TODO(BACKEND):
  // return (await fetch(`${API_BASE}/api/tasks`, {
  //   method: "POST", headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(input),
  // })).json();
  const tasks = loadMock();
  const task: Task = { ...input, id: crypto.randomUUID(), status: input.status ?? "ToDo" };
  tasks.push(task); saveMock(tasks);
  return task;
}

export async function updateTask(id: string, patch: Partial<TaskInput> & { status?: Status }): Promise<Task> {
  // TODO(BACKEND):
  // return (await fetch(`${API_BASE}/api/tasks/${id}`, {
  //   method: "PUT", headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(patch),
  // })).json();
  const tasks = loadMock();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error("Task not found");
  tasks[idx] = { ...tasks[idx], ...patch };
  saveMock(tasks);
  return tasks[idx];
}

export async function deleteTask(id: string): Promise<void> {
  // TODO(BACKEND): await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
  saveMock(loadMock().filter(t => t.id !== id));
}

export async function exportTasksTxt(): Promise<string> {
  // TODO(BACKEND): return (await fetch(`${API_BASE}/api/tasks/export`)).text();
  const tasks = loadMock();
  return tasks.map(t =>
    `[${t.status}] (${t.priority}) ${t.title} — due ${t.deadline}\n${t.description}\n`
  ).join("\n----------------\n");
}