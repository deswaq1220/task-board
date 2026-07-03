import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask, createTask, deleteTask, ApiError } from "../api/client";
import type { Task, Status, Priority } from "../types";
import { moveTask } from "../lib/tasks";

export const TASKS_KEY = ["tasks"] as const;

// 카드 이동
export function useMoveTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      version,
    }: {
      id: string;
      status: Status;
      version: number;
    }) => updateTask(id, { status, version }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old ? moveTask(old, id, status) : old
      );
      return { previousTasks };
    },

    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      if (err instanceof ApiError && err.status === 409) {
        const serverTask = (err.payload as { current?: Task })?.current;
        if (serverTask) {
          queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
            old?.map((t) => (t.id === serverTask.id ? serverTask : t))
          );
        }
        alert("다른 곳에서 먼저 변경되었습니다. 최신 상태로 갱신했습니다.");
      } else {
        alert("저장에 실패했습니다. 되돌립니다.");
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

// 생성
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      priority: Priority;
      description?: string;
    }) => createTask({ ...input, status: "todo" }),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);

      const optimisticTask: Task = {
        id: `temp-${crypto.randomUUID()}`,
        title: input.title,
        description: input.description,
        status: "todo",
        priority: input.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 0,
      };
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) => [
        ...(old ?? []),
        optimisticTask,
      ]);
      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      alert("생성에 실패했습니다.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

// 수정
export function useEditTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Task> & { version: number };
    }) => updateTask(id, patch),

    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
      return { previousTasks };
    },

    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      if (err instanceof ApiError && err.status === 409) {
        alert("다른 곳에서 먼저 수정되었습니다.");
      } else {
        alert("수정에 실패했습니다.");
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

// 삭제
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.filter((t) => t.id !== id)
      );
      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      alert("삭제에 실패했습니다.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
