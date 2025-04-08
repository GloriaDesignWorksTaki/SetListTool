import React from "react";

type DateProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
};

const Date: React.FC<DateProps> = ({ value, onChange, placeholder, required }) => {
  return (
    <input
      className="input"
      type="date"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  );
};

export default Date;