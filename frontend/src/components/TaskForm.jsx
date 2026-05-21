import React, { useState, useEffect } from "react";

const EMPTY = { title: "", description: "", deadline: "", priority: "Medium" };

export default function TaskForm({ onSubmit, editTask, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  // If editing, fill the form with task data
  useEffect(() => {
    if (editTask) {
      setForm({
        title:       editTask.title || "",
        description: editTask.description || "",
        deadline:    editTask.deadline ? editTask.deadline.split("T")[0] : "",
        priority:    editTask.priority || "Medium",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editTask]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");
    onSubmit(form);
    setForm(EMPTY);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>{editTask ? "Edit Task" : "New Task"}</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} name="title" value={form.title} onChange={handleChange} placeholder="Task title" />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} name="description" value={form.description} onChange={handleChange} placeholder="Optional" />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Deadline</label>
            <input style={inputStyle} type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} name="priority" value={form.priority} onChange={handleChange}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={btnPrimary}>{editTask ? "Save" : "Add Task"}</button>
          {editTask && <button type="button" style={btnSecondary} onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" };
const inputStyle  = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "inherit" };
const btnPrimary  = { padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600 };
const btnSecondary = { padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600 };
