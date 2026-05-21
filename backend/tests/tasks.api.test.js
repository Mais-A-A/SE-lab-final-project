import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("../server.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/tasks.json");

function resetTasks(tasks = []) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

async function createTask(overrides = {}) {
  const res = await request(app).post("/api/tasks").send({
    title: "Test Task", description: "Desc", deadline: "2025-12-31", priority: "Medium", ...overrides,
  });
  return res.body;
}

beforeEach(() => resetTasks());
afterAll(() => resetTasks());

// FR1 — Create Task
it("TC-FR1-01 | creates a task with all fields and returns 201", async () => {
  const res = await request(app).post("/api/tasks").send({
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    deadline: "2025-06-01",
    priority: "High",
  });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    deadline: "2025-06-01",
    priority: "High",
  });
  expect(res.body.id).toBeDefined();
});

// FR2 — Edit Task
it("TC-FR2-01 | edits an existing task title and priority", async () => {
  const created = await createTask({ title: "Read book", priority: "Low" });

  const res = await request(app)
    .put(`/api/tasks/${created.id}`)
    .send({ title: "Read 2 books", priority: "High" });

  expect(res.status).toBe(200);
  expect(res.body.title).toBe("Read 2 books");
  expect(res.body.priority).toBe("High");
});

// FR3 — Delete Task
it("TC-FR3-01 | deletes a task and it no longer appears in the list", async () => {
  const created = await createTask({ title: "Clean house" });

  await request(app).delete(`/api/tasks/${created.id}`);
  const listRes = await request(app).get("/api/tasks");

  expect(listRes.body.find((t) => t.id === created.id)).toBeUndefined();
});

// FR4 — Display All Tasks
it("TC-FR4-01 | returns all tasks with correct details", async () => {
  await createTask({ title: "Exercise", priority: "Medium", deadline: "2025-05-30" });
  await createTask({ title: "Study" });

  const res = await request(app).get("/api/tasks");
  const task = res.body.find((t) => t.title === "Exercise");

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(task.priority).toBe("Medium");
  expect(task.deadline).toBe("2025-05-30");
});

// FR5 — Default Status ToDo
it("TC-FR5-01 | new task has status 'ToDo' by default", async () => {
  const res = await request(app).post("/api/tasks").send({ title: "Write report" });

  expect(res.status).toBe(201);
  expect(res.body.status).toBe("ToDo");
});

// FR6 — Mark as Completed
it("TC-FR6-01 | marks a task as Completed", async () => {
  const created = await createTask({ title: "Submit form" });

  const res = await request(app).patch(`/api/tasks/${created.id}/complete`);

  expect(res.status).toBe(200);
  expect(res.body.status).toBe("Completed");
});

// FR7 — Sort by Deadline
it("TC-FR7-01 | sorts tasks by deadline nearest-first", async () => {
  await createTask({ title: "Far",  deadline: "2025-12-01" });
  await createTask({ title: "Near", deadline: "2025-05-15" });
  await createTask({ title: "Mid",  deadline: "2025-08-10" });

  const res = await request(app).get("/api/tasks?sort=deadline");

  expect(res.body.map((t) => t.deadline)).toEqual([
    "2025-05-15", "2025-08-10", "2025-12-01",
  ]);
});

// FR7 — Sort by Priority (same FR, second sort option)
it("TC-FR7-02 | sorts tasks by priority High → Medium → Low", async () => {
  await createTask({ title: "Low task",    priority: "Low"    });
  await createTask({ title: "High task",   priority: "High"   });
  await createTask({ title: "Medium task", priority: "Medium" });

  const res = await request(app).get("/api/tasks?sort=priority");

  expect(res.body.map((t) => t.priority)).toEqual(["High", "Medium", "Low"]);
});

// FR8 — Filter Completed
it("TC-FR8-01 | filter=completed shows only completed tasks", async () => {
  const t1 = await createTask({ title: "Task A" });
  await createTask({ title: "Task B" });
  await request(app).patch(`/api/tasks/${t1.id}/complete`);

  const res = await request(app).get("/api/tasks?filter=completed");

  expect(res.body).toHaveLength(1);
  expect(res.body[0].status).toBe("Completed");
});

// FR8 — Filter Not Completed
it("TC-FR8-02 | filter=not-completed shows only ToDo tasks", async () => {
  const t1 = await createTask({ title: "Task A" });
  await createTask({ title: "Task B" });
  await request(app).patch(`/api/tasks/${t1.id}/complete`);

  const res = await request(app).get("/api/tasks?filter=not-completed");

  expect(res.body).toHaveLength(1);
  expect(res.body[0].status).toBe("ToDo");
});

// FR8 — Filter High Priority
it("TC-FR8-03 | filter=high-priority shows only High priority tasks", async () => {
  await createTask({ title: "High 1",   priority: "High"   });
  await createTask({ title: "Medium 1", priority: "Medium" });

  const res = await request(app).get("/api/tasks?filter=high-priority");

  expect(res.body).toHaveLength(1);
  expect(res.body[0].priority).toBe("High");
});

// FR9 — Auto Save
it("TC-FR9-01 | task is saved to JSON file immediately after creation", async () => {
  await request(app).post("/api/tasks").send({ title: "Task X", priority: "High" });

  const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  expect(saved).toHaveLength(1);
  expect(saved[0].title).toBe("Task X");
});

// FR10 — Auto Load
it("TC-FR10-01 | loads pre-existing tasks from file on startup", async () => {
  resetTasks([
    { id: "uuid-1", title: "Task X", description: "", deadline: null, priority: "High",   status: "ToDo",      createdAt: new Date().toISOString() },
    { id: "uuid-2", title: "Task Y", description: "", deadline: null, priority: "Low",    status: "Completed", createdAt: new Date().toISOString() },
  ]);

  const res = await request(app).get("/api/tasks");

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(res.body.find((t) => t.title === "Task X")).toBeDefined();
  expect(res.body.find((t) => t.title === "Task Y")).toBeDefined();
});

// FR11 — Export to Text File
it("TC-FR11-01 | exports all tasks to a downloadable text file", async () => {
  await createTask({ title: "Buy milk", description: "Whole milk", deadline: "2025-06-01", priority: "High" });

  const res = await request(app).get("/api/tasks/export/txt");

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toMatch(/text\/plain/);
  expect(res.headers["content-disposition"]).toContain("tasks.txt");
  expect(res.text).toContain("Buy milk");
  expect(res.text).toContain("Whole milk");
  expect(res.text).toContain("High");
});