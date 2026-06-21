import type { Task, TaskStatus, FilterOptions, SortOptions } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  manager: TaskManager;
  filters: FilterOptions;
  sort: SortOptions;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskMoved: () => void;
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export function KanbanBoard({
  manager,
  filters,
  sort,
  onEdit,
  onDelete,
  onSelect,
  onAddTask,
  onTaskMoved,
}: KanbanBoardProps) {
  return (
    <div className="board grid grid-cols-3 gap-6 items-start">
      {COLUMNS.map(({ status, label }) => (
        <KanbanColumn
          key={status}
          status={status}
          label={label}
          tasks={manager.getFilteredByStatus(status, filters, sort)}
          manager={manager}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onAddTask={onAddTask}
          onTaskMoved={onTaskMoved}
        />
      ))}
    </div>
  );
}
