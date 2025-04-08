import { useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "@/components/molecules/SortableItem";
import SongInput from "@/components/molecules/SongInput";
import SongCard from "@/components/atoms/SongCard";
import H2itle from "@/components/atoms/H2Title";
import Submit from "@/components/atoms/form/Submit";
import Date from "@/components/atoms/form/Date";
import Input from "@/components/atoms/form/Input";

const SetlistTool = () => {
  const [songs, setSongs] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    // クライアントサイドでのみ localStorage を使用
    const savedSongs = localStorage.getItem("songs");
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs));
    }
  }, []);

  const addSong = (song: string) => {
    setSongs((prev) => {
      const updatedSongs = [...prev, song];
      localStorage.setItem("songs", JSON.stringify(updatedSongs)); // ローカルストレージに保存
      return updatedSongs;
    });
  };

  const handleDeleteSong = (songToDelete: string) => {
    setSongs((prev) => {
      const updatedSongs = prev.filter((song) => song !== songToDelete);
      localStorage.setItem("songs", JSON.stringify(updatedSongs)); // ローカルストレージを更新
      return updatedSongs;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const oldIndex = songs.indexOf(active.id as string);
      const newIndex = songs.indexOf(over.id as string);

      const reorderedSongs = Array.from(songs);
      reorderedSongs.splice(oldIndex, 1);
      reorderedSongs.splice(newIndex, 0, active.id as string);
      setSongs(reorderedSongs);
      localStorage.setItem("songs", JSON.stringify(reorderedSongs)); // ローカルストレージを更新
    }
  };

  const exportToPDF = () => {
    console.log("PDF出力:", { songs, date, venue });
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "45%" }}>
        <div className="block">
          <H2itle title="Artist Name" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="enter artist name" required />
        </div>
        <div className="block">
          <H2itle title="Song Title" />
          <SongInput onAddSong={addSong} />
        </div>
        <div className="block">
          <H2itle title="Added Songs" />
          <div className="cardList">
            {songs.map((song, index) => (
              <SongCard key={index} song={song} onDelete={handleDeleteSong} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: "45%" }}>
        <div className="block">
          <H2itle title="Setlist" />
          <div className="cardList">
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext items={songs} strategy={verticalListSortingStrategy}>
                {songs.map((song) => (
                  <SortableItem key={song} id={song} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="block">
          <H2itle title="Date" />
          <Date value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="block">
          <H2itle title="Venue" />
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="enter venue" required />
        </div>
        <div className="block">
          <Submit onClick={exportToPDF} text="convert to PDF" />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool; 