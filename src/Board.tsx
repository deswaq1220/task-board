import { useMemo, useState } from "react";
import type { Task, Status } from "./types";
import { getTasks } from "./api/client";
import { Column } from "./components/Column";
import { useQuery } from "@tanstack/react-query";
import { TaskForm } from "./TaskForm";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useMoveTaskMutation,
} from "./hooks/useTaskMutations";

const COLUMNS: { status: Status; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

const TASKS_KEY = ["tasks"] as const;

export default function Board() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 순진한 초기 로드: 로딩만 처리합니다.
  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: ({ signal }) => getTasks(signal),
    retry: 2,
  });

  // ⚠️ 서버에 저장하지 않고 로컬 상태만 바꾸는 "순진한" 이동입니다.

  const moveMutation = useMoveTaskMutation();
  const createMutation = useCreateTaskMutation();
  const editMutation = useEditTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  const moveTask = (id: string, status: Status) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    moveMutation.mutate({ id, status, version: task.version });
  };

  const handleDelete = (id: string) => {
    if (confirm("이 태스크를 삭제할까요?")) deleteMutation.mutate(id);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const byStatus = useMemo(() => {
    const map: Record<Status, Task[]> = {
      todo: [],
      "in-progress": [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  if (isLoading) return <p className="hint">불러오는 중…</p>;
  if (isError)
    return (
      <div className="hint">
        <p>불러오기에 실패했습니다.</p>
        <button onClick={() => refetch()}>다시 시도</button>
      </div>
    );
  if (tasks.length === 0) return <p className="hint">태스크가 없습니다.</p>;

  return (
    <div className="app">
      <button
        onClick={() => {
          setEditingTask(null);
          setFormOpen(true);
        }}
      >
        + 태스크 추가
      </button>

      <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={byStatus[col.status]}
            onMove={moveTask}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => setFormOpen(false)}
          onCreate={(input) => {
            createMutation.mutate(input);
            setFormOpen(false);
          }}
          onUpdate={(id, patch) => {
            editMutation.mutate({ id, patch });
            setFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
