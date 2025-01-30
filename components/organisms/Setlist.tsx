import { useState } from "react";
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
import styles from "./SetList.module.css"


const DragDropList = () => {
  const [items, setItems] = useState(["We are in the Heyday of Youth", "Blinded My Eyes", "Introduce", "Insurance", "Long Way to Failure"]);

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={styles.SetList}>
          <h2>今夜のセットリスト</h2>
          {items.map((id) => (
            <SongListItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default DragDropList;