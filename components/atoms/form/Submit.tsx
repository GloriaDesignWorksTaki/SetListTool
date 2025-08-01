import React from "react";

type SubmitProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text: string;
  icon?: React.ReactNode;
};

const SubmitButton: React.FC<SubmitProps> = ({ onClick, text, icon }) => {
  return (
    <button className="submitButton" onClick={onClick}>
      {icon}
      {text}
    </button>
  );
};

export default SubmitButton;