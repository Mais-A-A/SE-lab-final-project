const BASE = "/api/tasks";

export async function getTasks(filter, sort) {
  const params = new URLSearchParams();
  if (filter) params.append("filter", filter);
  if (sort)   params.append("sort", sort);
  const res = await fetch(`${BASE}?${params}`);
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTask(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function completeTask(id) {
  const res = await fetch(`${BASE}/${id}/complete`, { method: "PATCH" });
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
}

export function exportTasks() {
  window.open(`${BASE}/export/txt`, "_blank");
}
