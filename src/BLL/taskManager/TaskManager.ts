import { mockTasks } from './mockData';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  FilterOptions,
  SortOptions,
  TaskFormData,
  SortField,
} from './types';

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export class TaskManager {
  private tasks: Task[];

  constructor() {
    this.tasks = [...mockTasks];
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  createTask(data: TaskFormData): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      comments: 0,
      links: 0,
      subTasksCompleted: 0,
      subTasksTotal: 0,
    };
    this.tasks = [task, ...this.tasks];
    return task;
  }

  updateTask(id: string, data: Partial<TaskFormData>): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const updated: Task = { ...this.tasks[index], ...data };
    this.tasks = [
      ...this.tasks.slice(0, index),
      updated,
      ...this.tasks.slice(index + 1),
    ];
    return updated;
  }

  deleteTask(id: string): boolean {
    const len = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < len;
  }

  moveTo(id: string, status: TaskStatus): Task | undefined {
    return this.updateTask(id, { status });
  }

  filterTasks(options: FilterOptions): Task[] {
    return this.tasks.filter((task) => {
      if (options.priority !== 'all' && task.priority !== options.priority) return false;
      if (options.assignee !== 'all' && !task.assignees.includes(options.assignee)) return false;
      if (
        options.search.trim() &&
        !task.title.toLowerCase().includes(options.search.toLowerCase()) &&
        !task.description.toLowerCase().includes(options.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }

  sortTasks(tasks: Task[], options: SortOptions): Task[] {
    return [...tasks].sort((a, b) => {
      let cmp = 0;
      const field: SortField = options.field;
      if (field === 'dueDate' || field === 'createdAt') {
        cmp = new Date(a[field]).getTime() - new Date(b[field]).getTime();
      } else if (field === 'priority') {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (field === 'title') {
        cmp = a.title.localeCompare(b.title);
      }
      return options.direction === 'asc' ? cmp : -cmp;
    });
  }

  getFilteredAndSorted(filters: FilterOptions, sort: SortOptions): Task[] {
    return this.sortTasks(this.filterTasks(filters), sort);
  }

  getFilteredByStatus(status: TaskStatus, filters: FilterOptions, sort: SortOptions): Task[] {
    const filtered = this.filterTasks(filters).filter((t) => t.status === status);
    return this.sortTasks(filtered, sort);
  }

  getAllAssignees(): string[] {
    const set = new Set<string>();
    this.tasks.forEach((t) => t.assignees.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }

  isOverdue(task: Task): boolean {
    if (task.status === 'done') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }
}
