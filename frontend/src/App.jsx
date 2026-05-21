import React, { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import { getTasks, createTask, updateTask, deleteTask, completeTask, exportTasks } from "./api/tasks";

export default function App() {
  const [tasks,    setTasks]    = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [filter,   setFilter]   = useState("");
  const [sort,     setSort]     = useState("");

  // Load tasks whenever filter or sort changes
  useEffect(() => {
    getTasks(filter, sort).then(setTasks);
  }, [filter, sort]);

  async function handleSubmit(formData) {
    if (editTask) {
      await updateTask(editTask.id, formData);
      setEditTask(null);
    } else {
      await createTask(formData);
    }
    getTasks(filter, sort).then(setTasks);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    getTasks(filter, sort).then(setTasks);
  }

  async function handleComplete(id) {
    await completeTask(id);
    getTasks(filter, sort).then(setTasks);
  }

  const completed = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div style={{ minHeight: "100vh", padding: "32px 16px", background: "#f3f4f6" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>Smart Task Organizer</h1>
            <p style={{ color: "#6b7280", fontSize: 14 }}>{completed}/{tasks.length} completed</p>
          </div>
          <button onClick={exportTasks} style={{ padding: "10px 18px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            ⬇ Export
          </button>
        </div>

        <TaskForm onSubmit={handleSubmit} editTask={editTask} onCancel={() => setEditTask(null)} />

        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>FILTER</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="not-completed">Not Completed</option>
              <option value="high-priority">High Priority</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>SORT</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
              <option value="">Default</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 12, color: "#9ca3af" }}>
            No tasks yet — add one above!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditTask}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const selectStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, background: "#fff" };
