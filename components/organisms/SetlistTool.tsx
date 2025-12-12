import { useState, useEffect } from "react";
import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useBand } from "@/contexts/BandContext";
import { SongInput } from "@/components/molecules/SongInput";
import { SortableItem } from "@/components/molecules/SortableItem";
import SongCard from "@/components/atoms/SongCard";
import H2Title from "@/components/atoms/H2Title";
import Date from "@/components/atoms/form/Date";
import Input from "@/components/atoms/form/Input";
import Submit from "@/components/atoms/form/Submit";
import { Toast } from "@/components/atoms/Toast";
import { PDFPreviewModal } from "@/components/atoms/PDFPreviewModal";
import { FiPlus } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { useBandId } from "@/hooks/useBandId";
import { useSongs } from "@/hooks/useSongs";
import { useSetlist } from "@/hooks/useSetlist";
import { useLogo } from "@/hooks/useLogo";
import { useToast } from "@/hooks/useToast";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { Song } from "@/types";
const SetlistTool = () => {
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [mcInput, setMcInput] = useState("");

  const { bandName } = useBand();
  const { bandId } = useBandId({ createIfNotExists: true });
  const { songs, addSong, deleteSong } = useSongs(bandId);
  const {
    setlist,
    addSongToSetlist,
    addMCToSetlist,
    removeFromSetlist,
    handleDragEnd,
    getRemovedItem,
  } = useSetlist();
  const { logoUrl } = useLogo(bandId);
  const { message: toastMessage, isVisible: isToastVisible, showToast, hideToast } = useToast();
  const { generatePDF } = usePDFGenerator();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPDFLoading, setIsPDFLoading] = useState(false);

  // ドラッグ&ドロップ用のセンサー設定
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // 曲をセットリストに追加（トースト通知付き）
  const handleAddToSetlist = (songToAdd: string) => {
    addSongToSetlist(songToAdd);
    showToast(`${songToAdd}をセットリストに追加しました`);
  };

  // MCを追加
  const handleAddMC = () => {
    if (mcInput.trim()) {
      addMCToSetlist(mcInput);
      setMcInput("");
    }
  };

  // セットリストから削除（トースト通知付き）
  const handleRemoveFromSetlist = (id: string) => {
    const removedItem = getRemovedItem(id);
    removeFromSetlist(id);

    if (removedItem) {
      const message =
        removedItem.type === 'song'
          ? `${removedItem.content}をセットリストから削除しました`
          : `MC: ${removedItem.content}をセットリストから削除しました`;
      showToast(message);
    }
  };

  // PDFプレビューを開く
  const openPDFPreview = async () => {
    setIsPDFLoading(true);
    try {
      const url = await generatePDF({
        name: bandName,
        date,
        venue,
        setlist,
        eventTitle,
        logoUrl,
      });
      setPdfUrl(url);
      setIsPDFModalOpen(true);
    } catch (error) {
      showToast('PDFの生成に失敗しました');
    } finally {
      setIsPDFLoading(false);
    }
  };

  // PDFモーダルを閉じる
  const closePDFModal = () => {
    setIsPDFModalOpen(false);
    // メモリリーク防止のため、URLを解放
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <div className="setlistContent">
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={hideToast} />
      <PDFPreviewModal
        isOpen={isPDFModalOpen}
        onClose={closePDFModal}
        pdfUrl={pdfUrl}
      />
      <div className="container">
        <div className="block">
          <H2Title title="Song Title" />
          <SongInput onAddSong={addSong} />
        </div>
        <div className="block">
          <H2Title title="Added Songs" />
          <div className="cardList">
            {songs.map((song: Song) => (
              <SongCard
                key={song.id}
                id={song.id}
                song={song.title}
                onDelete={deleteSong}
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
          <H2Title title="Setlist" />
          <div className="cardList setlistCardList">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                id="setlist"
                items={setlist}
                strategy={verticalListSortingStrategy}
              >
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
          <H2Title title="Add MC" />
          <div className="flex gap-4">
            <Input
              value={mcInput}
              onChange={(e) => setMcInput(e.target.value)}
              placeholder="Enter MC Content"
            />
            <Submit onClick={handleAddMC} text="Add MC" icon={<FiPlus />} />
          </div>
        </div>

        <div className="block">
          <H2Title title="Date" />
          <Date value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="block">
          <H2Title title="Event Title" />
          <Input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter Event Title"
            required
          />
        </div>

        <div className="block">
          <H2Title title="Venue" />
          <Input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Enter Venue"
            required
          />
        </div>

        <div className="block">
          <Submit onClick={openPDFPreview} text="Preview PDF" icon={<FaFilePdf />} loading={isPDFLoading} disabled={isPDFLoading} />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;
