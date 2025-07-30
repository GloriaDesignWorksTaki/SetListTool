import React from 'react'

interface SelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  className?: string
  children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  children
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`select ${className}`}
    >
      {children}
    </select>
  )
} 