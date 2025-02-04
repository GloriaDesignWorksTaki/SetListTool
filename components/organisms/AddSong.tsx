import AddSongForm from "@/components/molecules/AddSongForm";

type AddSongProps = {
  onAddSong: (song: string) => void;
};

const AddSong = ({ onAddSong }: AddSongProps) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3>曲を追加</h3>
      <AddSongForm onAddSong={onAddSong} />
    </div>
  );
};

export default AddSong;