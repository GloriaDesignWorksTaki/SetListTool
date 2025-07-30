import { useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { pdf, Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { SongInput } from "@/components/molecules/SongInput";
import { SortableItem } from "@/components/molecules/SortableItem";
import SongCard from "@/components/atoms/SongCard";
import H2Title from "@/components/atoms/H2Title";
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
  };

  const handleAddMC = () => {
    if (mcInput.trim()) {
      const newItem: SetlistItem = {
        id: `mc-${performance.now()}`,
        type: 'mc',
        content: mcInput.trim(),
        order: setlist.length + 1
      };
      setSetlist((prev) => [...prev, newItem]);
      setMcInput("");
    }
  };

  const handleRemoveFromSetlist = (id: string) => {
    setSetlist((prev) => {
      const updatedSetlist = prev.filter((item) => item.id !== id);
      // 曲の順番を再計算
      let songOrder = 1;
      return updatedSetlist.map((item) => {
        if (item.type === 'song') {
          return { ...item, order: songOrder++ };
        }
        return item;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSetlist((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 曲の順番を再計算
        let songOrder = 1;
        return newItems.map((item) => {
          if (item.type === 'song') {
            return { ...item, order: songOrder++ };
          }
          return item;
        });
      });
    }
  };

  const openPDFPreview = async () => {
    const doc = <MyDocument name={name} date={date} venue={venue} setlist={setlist} eventTitle={eventTitle} />;
    const pdfBlob = await pdf(doc).toBlob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newTab = window.open(pdfUrl, '_blank');
    if (newTab) {
      newTab.focus();
    } else {
      alert('Please allow popups for this website');
    }
  };

  return (
    <div className="setlistTool">
      <div className="inputSection">
        <H2Title title="アーティスト名" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="アーティスト名を入力"
          className="input"
        />

        <H2Title title="曲名" />
        <SongInput onAddSong={addSong} />

        <H2Title title="日付" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />

        <H2Title title="会場" />
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="会場名を入力"
          className="input"
        />

        <H2Title title="イベントタイトル" />
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="イベントタイトルを入力"
          className="input"
        />

        <button onClick={openPDFPreview} className="submitButton">
          PDFプレビュー
        </button>
      </div>

      <div className="setlistSection">
        <div className="addedSongs">
          <H2Title title="追加された曲" />
          <div className="songList">
            {songs.map((song, index) => (
              <SongCard
                key={`${song}-${index}`}
                id={`${song}-${index}`}
                song={song}
                onAddToSetlist={handleAddToSetlist}
                onRemoveFromSetlist={() => handleDeleteSong(song)}
                isInSetlist={false}
                buttonLabel="Add Setlist"
              />
            ))}
          </div>
        </div>

        <div className="setlist">
          <H2Title title="セットリスト" />
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={setlist.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="setlistItems">
                {setlist.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    content={item.content}
                    index={index}
                    order={item.order}
                    onAddToSetlist={() => {}}
                    onRemoveFromSetlist={() => handleRemoveFromSetlist(item.id)}
                    isInSetlist={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;
