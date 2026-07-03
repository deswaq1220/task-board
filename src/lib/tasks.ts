import type { Task, Status } from "../types";

/**
 * 순수 함수 예시 — 이런 로직을 테스트로 검증하세요. (tasks.test.ts 참고)
 * 필요하면 자유롭게 수정/삭제해도 됩니다.
 */
export function moveTask(tasks: Task[], id: string, status: Status): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, status } : t));
}

export function filterByTitle(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((t) => t.title.toLowerCase().includes(q));
}

/**
 * 409 충돌 시 서버가 반환한 최신 태스크로 캐시를 교체합니다.
 * 재조회(refetch) 없이 즉시 최신 상태로 동기화하기 위한 용도입니다.
 */
export function mergeServerTask(tasks: Task[], serverTask: Task): Task[] {
  return tasks.map((t) => (t.id === serverTask.id ? serverTask : t));
}
