import React from 'react';

type MCCardProps = {
  mc: {
    type: string;
    title: string;
    id: string;
  };
  onRemove: (id: string) => void;
  isDragging?: boolean;
}

export const MCCard: React.FC<MCCardProps> = ({ mc, onRemove, isDragging = false }) => {
  return (
    <div className={`mcCard no-select ${isDragging ? 'dragging' : ''}`}>
      <span className="mcCardTitle">{mc.type}: {mc.title}</span>
    </div>
  );
};