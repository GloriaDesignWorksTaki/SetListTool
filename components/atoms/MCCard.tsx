import React from 'react';

type MCCardProps = {
  mc: {
    type: string;
    title: string;
    id: string;
  };
  onRemove: (id: string) => void;
}

export const MCCard: React.FC<MCCardProps> = ({ mc, onRemove }) => {
  return (
    <div className="mcCard">
      <span className="mcCardTitle">{mc.type}: {mc.title}</span>
    </div>
  );
};