import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SongListItem.module.css"

interface SongListItemProps {
  id: string;
}

const SongListItem: React.FC<SongListItemProps> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.SongListItem}
    >
      {id}
    </div>
  );
};

export default SongListItem;
