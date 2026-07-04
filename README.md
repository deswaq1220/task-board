# Task Board Assignment — 변경원

느리고 불안정한 mock API 위에서 동작하는 칸반 보드를 견고하게 완성한 프로젝트입니다.

## 배포 URL

https://deswaq1220.github.io/task-board/

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버
npm test         # 유닛 테스트
npm run build    # 타입체크 + 프로덕션 빌드
```

## 구현 기능

### Priority 1 (필수) — 전체 구현 완료

- **로드 상태 처리**: React Query `useQuery`로 로딩 / 에러(재시도 버튼) / 빈 상태를 명확히 분기
- **낙관적 업데이트 + 롤백**: 이동·생성·수정·삭제 전체에 `onMutate`/`onError`/`onSettled` 패턴 적용. 실패 시 스냅샷으로 정확히 롤백
- **경쟁 상태 처리**: `cancelQueries`로 진행 중인 요청 취소 + `onSettled`에서 `invalidateQueries`로 최종 서버 상태와 동기화
- **대량 데이터 성능(5,000개)**: `react-window`로 가상화 적용. 검색 필터링도 `useMemo`로 불필요한 재계산 방지
- **CRUD**: 태스크 추가(제목 필수, 우선순위 필수, 설명 선택) / 수정 / 삭제(확인 다이얼로그) 구현
- **핵심 로직 유닛 테스트**: `moveTask`, `filterByTitle`, `mergeServerTask` 순수 함수 테스트 (총 7개)

### Priority 2 (권장) — 일부만 구현

- **409 충돌 처리 UX**: 구현 완료 — 충돌 시 서버 최신 상태를 즉시 반영하고 사용자에게 안내
- 검색 디바운싱, 재시도/백오프, 다중 탭 동기화, 키보드 접근성, 다중 필터: **미구현**

## 사용 기술 스택

- React 18, TypeScript(strict), Vite, Vitest
- @tanstack/react-query — 서버 상태 관리, 낙관적 업데이트
- react-window — 가상화

## 미구현 기능 및 사유

- **검색 디바운싱**: 5,000개 규모에서 `filter()` 연산 자체가 수 ms 내로 끝나 체감 지연이 없어 우선순위를 낮췄습니다.
- **다중 탭 동기화, 키보드 접근성, 재시도/백오프**: 시간 제약상 Priority 1에 집중하기 위해 제외했습니다.

## 설계 결정

자세한 내용은 [DECISIONS.md](./DECISIONS.md) 참고

## AI 도구 사용 내역

자세한 내용은 [AI_USAGE.md](./AI_USAGE.md) 참고
