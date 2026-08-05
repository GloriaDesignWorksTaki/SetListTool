import { useState } from "react";
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
import { useToast } from "@/hooks/useToast";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { Song } from "@/types";

const SetlistTool = () => {
  const [mcInput, setMcInput] = useState("");

  const { bandName, bandId: contextBandId, logoUrl } = useBand();
  const { bandId } = useBandId({ createIfNotExists: true });
  const resolvedBandId = bandId ?? contextBandId;
  const { songs, addSong, updateSong, deleteSong } = useSongs(resolvedBandId);
  const {
    setlist,
    date,
    venue,
    eventTitle,
    setDate,
    setVenue,
    setEventTitle,
    addSongToSetlist,
    addMCToSetlist,
    removeFromSetlist,
    handleDragEnd,
    getRemovedItem,
    syncSongTitle,
  } = useSetlist(resolvedBandId);
  const { message: toastMessage, isVisible: isToastVisible, showToast, hideToast } = useToast();
  const { generatePDF } = usePDFGenerator();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPDFLoading, setIsPDFLoading] = useState(false);

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

  const handleAddToSetlist = (songToAdd: string) => {
    addSongToSetlist(songToAdd);
    showToast(`${songToAdd}をセットリストに追加しました`);
  };

  const handleUpdateSong = async (id: string, title: string) => {
    const previous = songs.find((s) => s.id === id)?.title;
    const ok = await updateSong(id, title);
    if (ok && previous && previous !== title) {
      syncSongTitle(previous, title);
      showToast("曲名を更新しました");
    } else if (!ok) {
      showToast("曲名の更新に失敗しました（重複の可能性があります）");
    }
    return ok;
  };

  const handleAddMC = () => {
    if (mcInput.trim()) {
      addMCToSetlist(mcInput);
      setMcInput("");
    }
  };

  const handleRemoveFromSetlist = (id: string) => {
    const removedItem = getRemovedItem(id);
    removeFromSetlist(id);

    if (removedItem) {
      const message =
        removedItem.type === "song"
          ? `${removedItem.content}をセットリストから削除しました`
          : `MC: ${removedItem.content}をセットリストから削除しました`;
      showToast(message);
    }
  };

  const generateFileName = () => {
    const parts: string[] = [];
    if (bandName) parts.push(bandName.replace(/\s+/g, ""));
    if (date) parts.push(date.replace(/-/g, ""));
    if (eventTitle) {
      const sanitizedTitle = eventTitle.replace(/\s+/g, "").substring(0, 20);
      if (sanitizedTitle) parts.push(sanitizedTitle);
    }
    return parts.length > 0 ? `${parts.join("_")}.pdf` : "setlist.pdf";
  };

  const openPDFPreview = async () => {
    if (!date.trim() || !eventTitle.trim() || !venue.trim()) {
      showToast("Date / Event Title / Venue を入力してください");
      return;
    }
    if (setlist.length === 0) {
      showToast("セットリストに曲またはMCを追加してください");
      return;
    }

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
    } catch {
      showToast("PDFの生成に失敗しました");
    } finally {
      setIsPDFLoading(false);
    }
  };

  const closePDFModal = () => {
    setIsPDFModalOpen(false);
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
        fileName={generateFileName()}
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
                onUpdate={handleUpdateSong}
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
                    order={item.type === "song" ? item.order : 0}
                    isMC={item.type === "mc"}
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
          <Submit
            onClick={openPDFPreview}
            text="Preview PDF"
            icon={<FaFilePdf />}
            loading={isPDFLoading}
            disabled={isPDFLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;
