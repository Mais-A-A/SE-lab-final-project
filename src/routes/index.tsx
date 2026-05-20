import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Task, TaskInput, Priority,
  fetchTasks, createTask, updateTask, deleteTask, exportTasksTxt,
} from "@/lib/tasksApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Download, Plus } from "lucide-react";

export const Route = createFileRoute("/")({ component: TasksPage });

type SortBy = "deadline" | "priority";
type FilterBy = "all" | "completed" | "active" | "high";

const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

const emptyForm: TaskInput = {
  title: "", description: "", deadline: "", priority: "Medium",
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("deadline");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");

  // FR9: load tasks on start
  useEffect(() => { fetchTasks().then(setTasks); }, []);

  const visible = useMemo(() => {
    let list = [...tasks];
    if (filterBy === "completed") list = list.filter(t => t.status === "Completed");
    if (filterBy === "active") list = list.filter(t => t.status === "ToDo");
    if (filterBy === "high") list = list.filter(t => t.priority === "High");
    list.sort((a, b) => sortBy === "deadline"
      ? a.deadline.localeCompare(b.deadline)
      : PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    return list;
  }, [tasks, sortBy, filterBy]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.deadline) return;
    if (editingId) {
      const updated = await updateTask(editingId, form); // FR2
      setTasks(prev => prev.map(t => t.id === editingId ? updated : t));
    } else {
      const created = await createTask(form); // FR1 + FR5 (status defaults to ToDo)
      setTasks(prev => [...prev, created]);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    await deleteTask(id); // FR3
    setTasks(prev => prev.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  }

  async function handleToggleComplete(t: Task) {
    const next = t.status === "Completed" ? "ToDo" : "Completed";
    const updated = await updateTask(t.id, { status: next }); // FR6
    setTasks(prev => prev.map(x => x.id === t.id ? updated : x));
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description, deadline: t.deadline, priority: t.priority });
  }

  // FR10
  async function handleExport() {
    const txt = await exportTasksTxt();
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tasks.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Task Organizer</h1>
            <p className="text-muted-foreground text-sm">Manage your daily tasks</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-2" /> Export
          </Button>
        </header>

        {/* FR1 / FR2 form */}
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              required
            />
            <Textarea
              className="md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Select
              value={form.priority}
              onValueChange={(v: Priority) => setForm({ ...form, priority: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="size-4 mr-2" />
                {editingId ? "Save changes" : "Add task"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </Card>

        {/* FR7 sort + FR8 filter */}
        <div className="flex flex-wrap gap-3">
          <Select value={sortBy} onValueChange={(v: SortBy) => setSortBy(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Sort: Deadline</SelectItem>
              <SelectItem value="priority">Sort: Priority</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={(v: FilterBy) => setFilterBy(v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tasks</SelectItem>
              <SelectItem value="completed">Completed only</SelectItem>
              <SelectItem value="active">Not completed</SelectItem>
              <SelectItem value="high">High priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* FR4 list */}
        <section className="space-y-3">
          {visible.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No tasks yet.</p>
          )}
          {visible.map(t => (
            <Card key={t.id} className="p-4 flex items-start gap-3">
              <Checkbox
                checked={t.status === "Completed"}
                onCheckedChange={() => handleToggleComplete(t)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold ${t.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </h3>
                  <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "secondary"}>
                    {t.priority}
                  </Badge>
                  <Badge variant="outline">{t.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">Due {t.deadline}</span>
                </div>
                {t.description && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => startEdit(t)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}