import React from "react";

type SubmitProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

const SubmitButton: React.FC<SubmitProps> = ({ onClick, text, icon, loading = false, disabled = false }) => {
  return (
    <button 
      className={`submitButton ${loading ? 'loading' : ''}`} 
      onClick={onClick}
      disabled={disabled || loading}
    >
      {!loading && icon}
      <span>{loading ? '処理中...' : text}</span>
    </button>
  );
};

export default SubmitButton;