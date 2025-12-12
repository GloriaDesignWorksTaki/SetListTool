"use client"

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--primary-color, #6670da)',
}) => {
  const sizeMap = {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
  }

  return (
    <div className="loading-spinner" style={{ width: sizeMap[size], height: sizeMap[size] }}>
      <div className="spinner-circle" style={{ borderColor: `${color} transparent transparent transparent` }}></div>
    </div>
  )
}
