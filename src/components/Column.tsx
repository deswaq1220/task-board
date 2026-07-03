import type { Task, Status } from "../types";
import { Card } from "./Card";
import { List, RowComponentProps } from "react-window";
interface Props {
  title: string;
  status: Status;
  tasks: Task[];
  onMove: (id: string, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const ROW_HEIGHT = 100; // Card 실제 높이 재서 맞추기 (아래 설명 참고)
const LIST_HEIGHT = 600; // column-body가 화면에서 실제로 차지하는 높이

function Row({
  index,
  style,
  tasks,
  onEdit,
  onDelete,
}: RowComponentProps<{
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}>) {
  const task = tasks[index];
  return (
    <div style={{ ...style, paddingBottom: 8 }}>
      <Card task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export function Column({
  title,
  status,
  tasks,
  onMove,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("text/plain");
        if (id) onMove(id, status);
      }}
    >
      <h2 className="column-title">
        {title} <span className="count">{tasks.length}</span>
      </h2>
      <div className="column-body">
        {/* ⚠️ 5,000개를 그대로 렌더합니다. 대량 데이터 성능 최적화는 당신의 몫입니다. */}
        <List
          rowCount={tasks.length}
          rowHeight={ROW_HEIGHT}
          rowComponent={Row}
          rowProps={{ tasks, onEdit, onDelete }}
          style={{ height: LIST_HEIGHT }}
        />
      </div>
    </section>
  );
}
