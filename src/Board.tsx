import { useMemo } from "react";
import type { Task, Status } from "./types";
import { ApiError, getTasks, updateTask } from "./api/client";
import { Column } from "./components/Column";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const COLUMNS: { status: Status; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

const TASKS_KEY = ["tasks"] as const;

export default function Board() {
  const queryClient = useQueryClient();

  // 순진한 초기 로드: 로딩만 처리합니다.
  // TODO(P1): 에러 상태 + 재시도, 빈 상태 처리를 구현하세요.

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
  // TODO(P1): 낙관적 업데이트 + 실패 시 롤백 + 경쟁 상태 처리를 구현하세요.
  //   - updateTask(id, { status, version }) 로 서버에 반영
  //   - 실패(15%)하면 이전 상태로 되돌리고 사용자에게 알림
  //   - 같은 카드를 빠르게 연속 이동해도 최종 상태가 서버와 일치하도록
  const moveMutation = useMutation({
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
      // 진행 중인 refetch가 낙관적 변경을 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });

      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);

      // 낙관적으로 UI 먼저 반영
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t))
      );

      // 롤백용 스냅샷 + 이 mutation의 대상 id를 컨텍스트로 전달
      return { previousTasks, id };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }

      if (err instanceof ApiError && err.status === 409) {
        const serverTask = (err.payload as { current?: Task })?.current;
        if (serverTask) {
          // 서버 최신 상태를 캐시에 바로 반영 (재요청 없이)
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
      // 성공/실패 관계없이 서버 최신 상태로 재검증
      // → 경쟁 상태(늦게 도착한 응답) 문제를 여기서 흡수
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const moveTask = (id: string, status: Status) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    moveMutation.mutate({ id, status, version: task.version });
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
    <div className="board">
      {COLUMNS.map((col) => (
        <Column
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={byStatus[col.status]}
          onMove={moveTask}
        />
      ))}
    </div>
  );
}
