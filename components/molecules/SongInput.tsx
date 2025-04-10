import { useState } from "react";
import Input from "@/components/atoms/form/Input";
import Submit from "@/components/atoms/form/Submit";

type SongInputProps = {
  onAddSong: (song: string) => void;
};

const SongInput = ({ onAddSong }: SongInputProps) => {
  const [song, setSong] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (song.trim()) {
      onAddSong(song.trim());
      setSong("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={song} onChange={(e) => setSong(e.target.value)} placeholder="enter the song name" required />
      <Submit onClick={handleSubmit} text="add song" />
    </form>
  );
};

export default SongInput; 