const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { TaskSorter } = require("../patterns");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data/tasks.json");

// Read tasks from file
function readTasks() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Write tasks to file
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// GET /api/tasks
router.get("/", (req, res) => {
  const { filter, sort } = req.query;
  let tasks = readTasks();

  // Filter
  if (filter === "completed")      tasks = tasks.filter((t) => t.status === "Completed");
  if (filter === "not-completed")  tasks = tasks.filter((t) => t.status === "ToDo");
  if (filter === "high-priority")  tasks = tasks.filter((t) => t.priority === "High");

  // Sort — Strategy Pattern
  tasks = new TaskSorter(sort).sort(tasks);

  res.json(tasks);
});

// GET /api/tasks/export/txt
router.get("/export/txt", (req, res) => {
  const tasks = readTasks();
  const lines = tasks.map((t, i) =>
    `Task ${i + 1}\n  Title:    ${t.title}\n  Desc:     ${t.description || "-"}\n  Deadline: ${t.deadline || "-"}\n  Priority: ${t.priority}\n  Status:   ${t.status}\n`
  );
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=tasks.txt");
  res.send(`Smart Task Organizer\n${"=".repeat(30)}\n\n${lines.join("\n")}`);
});

// GET /api/tasks/:id
router.get("/:id", (req, res) => {
  const task = readTasks().find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /api/tasks
router.post("/", (req, res) => {
  const { title, description, deadline, priority } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const newTask = {
    id: uuidv4(),
    title,
    description: description || "",
    deadline: deadline || null,
    priority: priority || "Medium",
    status: "ToDo",
    createdAt: new Date().toISOString(),
  };

  const tasks = readTasks();
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id
router.put("/:id", (req, res) => {
  const tasks = readTasks();
  const i = tasks.findIndex((t) => t.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Task not found" });
  tasks[i] = { ...tasks[i], ...req.body, id: tasks[i].id };
  writeTasks(tasks);
  res.json(tasks[i]);
});

// PATCH /api/tasks/:id/complete
router.patch("/:id/complete", (req, res) => {
  const tasks = readTasks();
  const i = tasks.findIndex((t) => t.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Task not found" });
  tasks[i].status = "Completed";
  writeTasks(tasks);
  res.json(tasks[i]);
});

// DELETE /api/tasks/:id
router.delete("/:id", (req, res) => {
  const tasks = readTasks();
  const filtered = tasks.filter((t) => t.id !== req.params.id);
  if (filtered.length === tasks.length) return res.status(404).json({ error: "Task not found" });
  writeTasks(filtered);
  res.json({ message: "Task deleted" });
});

module.exports = router;
