import { useState } from "react";

type AddSongFormProps = {
  onAddSong: (song: string) => void;
};

const AddSongForm = ({ onAddSong }: AddSongFormProps) => {
  const [songName, setSongName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (songName.trim()) {
      onAddSong(songName.trim());
      setSongName(""); // 入力欄をリセット
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
        placeholder="新しい曲を追加"
      />
      <button type="submit">追加</button>
    </form>
  );
};

export default AddSongForm;