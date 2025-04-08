"use client"

import React from "react"
import { memo } from "react"

type SongCardProps = {
  song: string;
  onDelete: (song: string) => void;
}

const SongCard: React.FC<SongCardProps> = memo(({ song, onDelete }) => {
  return (
    <div className="songCard">
      <span>{song}</span>
      <button onClick={() => onDelete(song)} className="songCardDelete">Delete</button>
    </div>
  );
});

export default SongCard; 