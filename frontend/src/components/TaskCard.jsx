import React from "react";

const PRIORITY_COLOR = {
  High:   { background: "#fef2f2", color: "#dc2626" },
  Medium: { background: "#fffbeb", color: "#d97706" },
  Low:    { background: "#f0fdf4", color: "#16a34a" },
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const done = task.status === "Completed";
  const pc   = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.Medium;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: done ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 600, textDecoration: done ? "line-through" : "none", color: done ? "#9ca3af" : "#111827" }}>
          {task.title}
        </span>
        <span style={{ ...pc, fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
          {task.priority}
        </span>
      </div>

      {task.description && <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>{task.description}</p>}

      <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 13, color: "#6b7280" }}>
        {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
        <span style={{ background: done ? "#f0fdf4" : "#f3f4f6", color: done ? "#16a34a" : "#6b7280", padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>
          {task.status}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!done && <button style={btn("#f0fdf4","#16a34a","#bbf7d0")} onClick={() => onComplete(task.id)}>✓ Complete</button>}
        <button style={btn("#eff6ff","#2563eb","#bfdbfe")} onClick={() => onEdit(task)}>Edit</button>
        <button style={btn("#fef2f2","#dc2626","#fecaca")} onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}

function btn(bg, color, border) {
  return { padding: "6px 14px", background: bg, color, border: `1px solid ${border}`, borderRadius: 6, fontSize: 13, fontWeight: 600 };
}
