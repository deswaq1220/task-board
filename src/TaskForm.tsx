import { useState } from "react";
import type { Task, Priority } from "./types";

interface Props {
  task: Task | null;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    priority: Priority;
    description?: string;
  }) => void;
  onUpdate: (id: string, patch: Partial<Task> & { version: number }) => void;
}

export function TaskForm({ task, onClose, onCreate, onUpdate }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? "medium"
  );
  const [description, setDescription] = useState(task?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (task) {
      onUpdate(task.id, {
        title,
        priority,
        description,
        version: task.version,
      });
    } else {
      onCreate({ title, priority, description });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3>{task ? "태스크 수정" : "태스크 추가"}</h3>
        <label>
          제목 *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          우선순위
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          설명
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button type="submit">{task ? "수정" : "추가"}</button>
        </div>
      </form>
    </div>
  );
}
