import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/SongListItem.module.css";

interface SongListItemProps {
  id: string;
  onRemove: (id: string) => void;
}

const SongListItem: React.FC<SongListItemProps> = ({ id, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.SongListItem}>
      <span>{id}</span>
      <button className={styles.RemoveButton} onClick={() => onRemove(id)}>✖</button>
    </div>
  );
};

export default SongListItem;