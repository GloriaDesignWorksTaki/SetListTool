import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SongCard from "@/components/atoms/SongCard";
import React from 'react';

interface SortableItemProps {
  id: string;
  onAddToSetlist: (song: string) => void;
  onRemoveFromSetlist: (song: string) => void;
  isInSetlist: boolean;
  index: number;
  order: number | undefined;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, onAddToSetlist, onRemoveFromSetlist, isInSetlist, index, order }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const handleRemove = () => {
    onRemoveFromSetlist(id);
  };

  return (
    <div className="sortableItem">
      {order !== undefined && <span className="sortableItemOrder">{order}</span>}
      <div
        className="sortableItemSongCard"
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        {...attributes}
        {...listeners}
      >
        <SongCard 
          id={id}
          song={id} 
          onDelete={() => {}} 
          onAddToSetlist={onAddToSetlist} 
          onRemoveFromSetlist={handleRemove}
          isInSetlist={isInSetlist}
          buttonLabel="Remove from Setlist"
          index={index}
        />
      </div>
      <button className="RemoveFromSetlistButton" onClick={handleRemove}>Remove</button>
    </div>
  );
};

export default SortableItem; 