import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SongCard from "@/components/atoms/SongCard";
import { MCCard } from "@/components/atoms/MCCard";

type SortableItemProps = {
  id: string;
  onAddToSetlist: (songToAdd: string) => void;
  onRemoveFromSetlist: (id: string) => void;
  isInSetlist: boolean;
  index: number;
  order: number;
  isMC?: boolean;
  content: string;
};

export const SortableItem = ({
  id,
  onAddToSetlist,
  onRemoveFromSetlist,
  isInSetlist,
  index,
  order,
  isMC,
  content,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = () => {
    onRemoveFromSetlist(id);
  };

  return (
    <div className="sortableItem">
      {order !== undefined && <span className="sortableItemOrder">{isMC ? 'MC' : order}</span>}
      <div className="sortableItemContent" ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {isMC ? (
          <MCCard
            mc={{
              id,
              type: 'MC',
              title: content,
            }}
            onRemove={onRemoveFromSetlist}
          />
        ) : (
          <SongCard
            id={id}
            song={content}
            onDelete={isInSetlist ? undefined : () => onRemoveFromSetlist(id)}
            onAddToSetlist={isInSetlist ? undefined : onAddToSetlist}
            buttonLabel={isInSetlist ? "" : "Add Setlist"}
            index={index}
            showIndex={false}
          />
        )}
      </div>
      <button className="RemoveFromSetlistButton" onClick={handleRemove}>Remove</button>
    </div>
  );
}; 