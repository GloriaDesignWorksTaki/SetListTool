"use client"

import React, { memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type SongCardProps = {
  song: string;
  onDelete: (song: string) => void;
  onAddToSetlist?: (song: string) => void;
  onRemoveFromSetlist?: (song: string) => void;
  isInSetlist?: boolean;
  buttonLabel: string;
  id: string;
  index?: number;
  showIndex?: boolean;
}

const SongCard: React.FC<SongCardProps> = memo(({ song, onDelete, onAddToSetlist, isInSetlist, buttonLabel, id, index, showIndex }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className="songCard"
    >
      {showIndex && index !== undefined ? <span>{index + 1}. </span> : null}
      <span className="songCardTitle">{song}</span>
      {isInSetlist ? null : (
        <>
          <button onClick={() => onDelete(song)} className="songCardDelete">Delete</button>
          <button onClick={() => onAddToSetlist?.(song)} className="AddToSetlistButton">{buttonLabel}</button>
        </>
      )}
    </div>
  );
});

export default SongCard;