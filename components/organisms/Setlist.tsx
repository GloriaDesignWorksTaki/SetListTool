import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SongListItem from "@/components/atoms/SongListItem";

type DragDropListProps = {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
};

const DragDropList = ({ items, setItems }: DragDropListProps) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over?.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // 曲を削除する関数
  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((song) => song !== id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SongListItem key={id} id={id} onRemove={handleRemove} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default DragDropList;
