import React from "react";

type SubmitProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text: string;
};

const SubmitButton: React.FC<SubmitProps> = ({ onClick, text }) => {
  return (
    <button className="submitButton" onClick={onClick}>{text}</button>
  );
};

export default SubmitButton;