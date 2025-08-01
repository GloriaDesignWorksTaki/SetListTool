import React, { useState } from 'react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { FiPlus } from 'react-icons/fi'

interface SongInputProps {
  onAddSong: (song: string) => void
}

export const SongInput: React.FC<SongInputProps> = ({ onAddSong }) => {
  const [song, setSong] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (song.trim()) {
      onAddSong(song.trim())
      setSong('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="songInput">
      <Input
        value={song}
        onChange={(e) => setSong(e.target.value)}
        placeholder="Enter Song Title"
        required={true}
      />
      <Button className='submitButton' type="submit" text="Add Song" icon={<FiPlus />} />
    </form>
  )
} 