import { describe, it, expect } from "vitest";
import { moveTask, filterByTitle, mergeServerTask } from "./tasks";
import type { Task } from "../types";

const make = (id: string, over: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  status: "todo",
  priority: "medium",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: 1,
  ...over,
});

describe("moveTask", () => {
  it("대상 태스크의 status 만 바꾸고 나머지는 그대로 둔다", () => {
    const tasks = [make("a"), make("b")];
    const next = moveTask(tasks, "a", "done");
    expect(next.find((t) => t.id === "a")?.status).toBe("done");
    expect(next.find((t) => t.id === "b")?.status).toBe("todo");
  });

  it("불변성을 지킨다 (원본 배열/객체를 변경하지 않는다)", () => {
    const tasks = [make("a")];
    const next = moveTask(tasks, "a", "done");
    expect(tasks[0].status).toBe("todo");
    expect(next).not.toBe(tasks);
  });
});

describe("filterByTitle", () => {
  it("대소문자 구분 없이 제목으로 필터링한다", () => {
    const tasks = [
      make("a", { title: "Fix login bug" }),
      make("b", { title: "Write docs" }),
    ];
    expect(filterByTitle(tasks, "FIX")).toHaveLength(1);
  });

  it("빈 검색어면 전체를 반환한다", () => {
    const tasks = [make("a"), make("b")];
    expect(filterByTitle(tasks, "   ")).toHaveLength(2);
  });
});

describe("mergeServerTask", () => {
  it("해당 id의 태스크를 서버가 준 최신 상태로 교체한다", () => {
    const tasks = [make("a", { version: 1 }), make("b", { version: 1 })];
    const serverTask = make("a", { version: 5, status: "done" });
    const result = mergeServerTask(tasks, serverTask);
    expect(result.find((t) => t.id === "a")).toEqual(serverTask);
    expect(result.find((t) => t.id === "b")?.version).toBe(1);
  });

  it("일치하는 id가 없으면 원본을 그대로 반환한다", () => {
    const tasks = [make("a")];
    const serverTask = make("z", { version: 9 });
    const result = mergeServerTask(tasks, serverTask);
    expect(result).toEqual(tasks);
  });

  it("불변성을 지킨다 (원본 배열을 변경하지 않는다)", () => {
    const tasks = [make("a", { version: 1 })];
    const serverTask = make("a", { version: 5 });
    mergeServerTask(tasks, serverTask);
    expect(tasks[0].version).toBe(1); // 원본은 그대로
  });
});
