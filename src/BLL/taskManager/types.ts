export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskType = 'feature' | 'bug' | 'review' | 'testing';

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title';

export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'board' | 'list';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignees: string[];
  status: TaskStatus;
  taskType: TaskType;
  tags: string[];
  createdAt: string;
  comments: number;
  links: number;
  subTasksCompleted: number;
  subTasksTotal: number;
}

export interface FilterOptions {
  priority: TaskPriority | 'all';
  assignee: string | 'all';
  search: string;
}

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignees: string[];
  status: TaskStatus;
  taskType: TaskType;
  tags: string[];
}

export interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  date: 'today' | 'yesterday';
  type: 'status' | 'reaction' | 'comment' | 'upload';
  emoji?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}
