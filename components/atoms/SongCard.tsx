"use client"

import React, { memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { FiTrash2, FiPlus } from "react-icons/fi"
import { Button } from "@/components/atoms/Button"

type SongCardProps = {
  id: string;
  song: string;
  onDelete?: (songId: string) => void;
  onAddToSetlist?: (song: string) => void;
  onRemoveFromSetlist?: (song: string) => void;
  isInSetlist?: boolean;
  buttonLabel: string;
  index?: number;
  showIndex?: boolean;
}

const SongCard: React.FC<SongCardProps> = memo(({ song, onDelete, onAddToSetlist, isInSetlist, buttonLabel, id, index, showIndex }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`songCard no-select draggable ${isDragging ? 'dragging' : ''}`}
    >
      {showIndex && index !== undefined ? <span>{index + 1}. </span> : null}
      <span className="songCardTitle">{song}</span>
      {isInSetlist ? null : (
        <>
          {onDelete && (
            <Button 
              onClick={() => onDelete(id)} 
              className="songCardDelete secondary"
              text="Delete"
              icon={<FiTrash2 />}
            />
          )}
          {onAddToSetlist && (
            <Button 
              onClick={() => onAddToSetlist(song)} 
              className="AddToSetlistButton"
              text={buttonLabel}
              icon={<FiPlus />}
            />
          )}
        </>
      )}
    </div>
  );
});

export default SongCard;