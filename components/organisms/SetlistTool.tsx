import { useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { pdf, Document, Page, Text, View, Font } from '@react-pdf/renderer';
import SongInput from "@/components/molecules/SongInput";
import { SortableItem } from "@/components/molecules/SortableItem";
import SongCard from "@/components/atoms/SongCard";
import H2itle from "@/components/atoms/H2Title";
import Date from "@/components/atoms/form/Date";
import Input from "@/components/atoms/form/Input";
import Submit from "@/components/atoms/form/Submit";
import { supabase } from "@/pages/api/supabaseClient";

type SetlistItem = {
  id: string;
  type: 'song' | 'mc';
  content: string;
  order: number;
};

const MyDocument = ({ name, date, venue, setlist, eventTitle }: { name: string; date: string; venue: string; setlist: SetlistItem[]; eventTitle: string }) => (
  <Document>
    <Page size="A4" style={{ padding: 15 }}>
      <div style={{ backgroundColor: 'black', padding: 30, height: '100%' }}>
        <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 10, color: 'white' }}>{name}</Text>
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{date}</Text>
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{eventTitle}</Text>
        <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 40, color: 'white' }}>{venue}</Text>
        {setlist.map((item, index) => (
          <Text 
            key={item.id} 
            style={{ 
              fontSize: 30, 
              marginBottom: 10, 
              color: 'white',
              padding: item.type === 'mc' ? 5 : 0
            }}
          >
            {item.type === 'song' ? `${item.order}. ${item.content}` : `---MC: ${item.content}---`}
          </Text>
        ))}
      </div>
    </Page>
  </Document>
);

const SetlistTool = () => {
  const [songs, setSongs] = useState<string[]>([]);
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [name, setName] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [mcInput, setMcInput] = useState("");

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
    const newItem: SetlistItem = {
      id: `song-${performance.now()}`,
      type: 'song',
      content: songToAdd,
      order: setlist.filter(item => item.type === 'song').length + 1
    };
    setSetlist((prev) => [...prev, newItem]);
    setSongs((prev) => prev.filter((song) => song !== songToAdd));
  };

  const handleAddMC = () => {
    if (mcInput.trim()) {
      const newItem: SetlistItem = {
        id: `mc-${performance.now()}`,
        type: 'mc',
        content: mcInput.trim(),
        order: 0
      };
      setSetlist((prev) => [...prev, newItem]);
      setMcInput("");
    }
  };

  const handleRemoveFromSetlist = (id: string) => {
    const itemToRemove = setlist.find(item => item.id === id);
    if (itemToRemove?.type === 'song') {
      setSongs((prev) => [...prev, itemToRemove.content]);
    }
    setSetlist((prev) => {
      const updatedSetlist = prev.filter(item => item.id !== id);
      // 曲の順番を更新（MCカードを除いて計算）
      let songCount = 0;
      return updatedSetlist.map((item) => {
        if (item.type === 'song') {
          songCount++;
          return {
            ...item,
            order: songCount
          };
        }
        return item;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = setlist.findIndex(item => item.id === active.id);
    const newIndex = setlist.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setSetlist((prev) => {
        const updatedSetlist = arrayMove(prev, oldIndex, newIndex);
        // 曲の順番を更新（MCカードを除いて計算）
        let songCount = 0;
        return updatedSetlist.map((item) => {
          if (item.type === 'song') {
            songCount++;
            return {
              ...item,
              order: songCount
            };
          }
          return item;
        });
      });
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Artist Name" required />
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
                {setlist.map((item, index) => (
                  <SortableItem
                    key={item.id} 
                    id={item.id} 
                    onAddToSetlist={handleAddToSetlist} 
                    onRemoveFromSetlist={handleRemoveFromSetlist}
                    isInSetlist={true}
                    index={index}
                    order={item.type === 'song' ? item.order : 0}
                    isMC={item.type === 'mc'}
                    content={item.content}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="block">
          <H2itle title="Add MC" />
          <div className="flex gap-4">
            <Input 
              value={mcInput} 
              onChange={(e) => setMcInput(e.target.value)} 
              placeholder="Enter MC Content" 
            />
            <Submit onClick={handleAddMC} text="Add MC" />
          </div>
        </div>
        <div className="block">
          <H2itle title="Date" />
          <Date value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="block">
          <H2itle title="Event Title" />
          <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Enter Event Title" required />
        </div>
        <div className="block">
          <H2itle title="Venue" />
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Enter Venue" required />
        </div>
        <div className="block">
          <Submit onClick={openPDFPreview} text="Preview PDF" />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;
