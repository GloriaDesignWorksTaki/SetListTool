'use client'

import React, { useState, useRef, useEffect } from 'react'

interface LogoUploadProps {
  onLogoUpload: (logoUrl: string) => void
  currentLogo?: string
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoUpload, currentLogo }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // currentLogoが変更されたときにpreviewUrlを更新
  useEffect(() => {
    setPreviewUrl(currentLogo || null)
  }, [currentLogo])

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const maxSize = 500 * 1024
      if (file.size > maxSize) {
        alert('ファイルサイズが大きすぎます。500KB以下のファイルを選択してください。')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        onLogoUpload(result)
      }
      reader.readAsDataURL(file)
    } else {
      alert('画像ファイルを選択してください。')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveLogo = () => {
    setPreviewUrl(null)
    onLogoUpload('')
    // ロゴが削除されたら即座に保存
    setTimeout(() => {
      onLogoUpload('')
    }, 0)
  }

  return (
    <div className="logoUpload">
      <h3>Band Logo</h3>
      <div
        className={`logoUploadArea ${isDragging ? 'dragging' : ''} ${previewUrl ? 'hasLogo' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <div className="logoPreview">
            <img src={previewUrl} alt="Band Logo" />
          </div>
        ) : (
          <div className="logoUploadPlaceholder">
            <div className="uploadIcon">📁</div>
            <p>クリックまたはドラッグ&ドロップでロゴをアップロード</p>
            <p className="uploadHint">PNG, JPG, SVG対応（500KB以下）</p>
          </div>
        )}
      </div>
      {previewUrl && (
        <button 
          type="button" 
          className="removeLogoButton submitButton"
          onClick={handleRemoveLogo}
        >Remove Logo</button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
} 