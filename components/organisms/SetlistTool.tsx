import { useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { pdf, Document, Page, Text, View, Font } from '@react-pdf/renderer';
import SongInput from "@/components/molecules/SongInput";
import SortableItem from "@/components/molecules/SortableItem";
import SongCard from "@/components/atoms/SongCard";
import H2itle from "@/components/atoms/H2Title";
import Date from "@/components/atoms/form/Date";
import Input from "@/components/atoms/form/Input";
import Submit from "@/components/atoms/form/Submit";
import { supabase } from "@/pages/api/supabaseClient";

const MyDocument = ({ name, date, venue, setlist, eventTitle }: { name: string; date: string; venue: string; setlist: string[]; eventTitle: string }) => (
  <Document>
    <Page size="A4" style={{ padding: 15 }}>
      <div style={{ backgroundColor: 'black', padding: 30, height: '100%' }}>
        <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 10, color: 'white' }}>{name}</Text>
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{date}</Text>
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{eventTitle}</Text>
        <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 40, color: 'white' }}>{venue}</Text>
        {setlist.map((song, index) => (
          <Text key={index} style={{ fontSize: 32, marginBottom: 10, color: 'white' }}>{`${index + 1}. ${song}`}</Text>
        ))}
      </div>
    </Page>
  </Document>
);

const SetlistTool = () => {
  const [songs, setSongs] = useState<string[]>([]);
  const [setlist, setSetlist] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [name, setName] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const savedSongs = localStorage.getItem("songs");
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs));
    }
  }, []);

  const updateLocalStorage = (updatedSongs: string[]) => {
    localStorage.setItem("songs", JSON.stringify(updatedSongs));
  };

  // Supabaseへの登録処理
  const addSongToDB = async (title: string) => {
    const bandId = "example-band-id"; // ← ここを実際のband_idに置き換える
    const { error } = await supabase.from("songs").insert([{ title, band_id: bandId }]);

    if (error) {
      console.error("Supabase insert error:", error.message);
    }
  };

  const addSong = (song: string) => {
    setSongs((prev) => {
      const updatedSongs = [...prev, song];
      updateLocalStorage(updatedSongs);
      return updatedSongs;
    });

    addSongToDB(song); // ← Supabaseに保存
  };

  const handleDeleteSong = (songToDelete: string) => {
    setSongs((prev) => {
      const updatedSongs = prev.filter((song) => song !== songToDelete);
      updateLocalStorage(updatedSongs);
      return updatedSongs;
    });
  };

  const handleAddToSetlist = (songToAdd: string) => {
    setSetlist((prev) => [...prev, songToAdd]);
    setSongs((prev) => prev.filter((song) => song !== songToAdd));
  };

  const handleRemoveFromSetlist = (songToRemove: string) => {
    setSetlist((prev) => prev.filter((song) => song !== songToRemove));
    setSongs((prev) => [...prev, songToRemove]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = setlist.indexOf(active.id as string);
    const newIndex = setlist.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      setSetlist((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const openPDFPreview = async () => {
    const blob = await pdf(
      <MyDocument name={name} date={date} venue={venue} setlist={setlist} eventTitle={eventTitle} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="setlistContent">
      <div className="container">
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
            {songs.map((song) => (
              <SongCard 
                key={song} 
                id={song} 
                song={song} 
                onDelete={handleDeleteSong} 
                onAddToSetlist={handleAddToSetlist} 
                buttonLabel="Add Setlist"
                index={0}
                showIndex={false}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="block">
          <H2itle title="Setlist" />
          <div className="cardList setlistCardList">
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext id="setlist" items={setlist} strategy={verticalListSortingStrategy}>
                {setlist.map((song, index) => (
                  <SortableItem
                    key={song} 
                    id={song} 
                    onAddToSetlist={handleAddToSetlist} 
                    onRemoveFromSetlist={handleRemoveFromSetlist}
                    isInSetlist={true}
                    index={index}
                    order={index + 1}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="block">
          <H2itle title="Date" />
          <Date value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="block">
          <H2itle title="Event Title" />
          <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="enter event title" required />
        </div>
        <div className="block">
          <H2itle title="Venue" />
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="enter venue" required />
        </div>
        <div className="block">
          <Submit onClick={openPDFPreview} text="Preview PDF" />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;
