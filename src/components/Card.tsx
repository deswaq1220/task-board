import type { Task } from "../types";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function Card({ task, onEdit, onDelete }: Props) {
  return (
    <article
      className={`card priority-${task.priority}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
    >
      <div className="card-title" title={task.title}>
        {task.title}
      </div>
      <div className="card-meta">
        <span className={`badge badge-${task.priority}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        <span className="date">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="card-actions">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          수정
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          삭제
        </button>
      </div>
    </article>
  );
}
