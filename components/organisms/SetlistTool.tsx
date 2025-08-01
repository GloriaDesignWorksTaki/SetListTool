import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { pdf, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { useSession } from "next-auth/react";
import { SongInput } from "@/components/molecules/SongInput";
import { SortableItem } from "@/components/molecules/SortableItem";
import SongCard from "@/components/atoms/SongCard";
import H2Title from "@/components/atoms/H2Title";
import Date from "@/components/atoms/form/Date";
import Input from "@/components/atoms/form/Input";
import Submit from "@/components/atoms/form/Submit";
import { Toast } from "@/components/atoms/Toast";
import { LogoUpload } from "@/components/atoms/LogoUpload";
import { supabase } from "@/pages/api/supabaseClient";
import { useBand } from "@/contexts/BandContext";
import { FiPlus } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";

type SetlistItem = {
  id: string;
  type: 'song' | 'mc';
  content: string;
  order: number;
};

type Song = {
  id: string;
  title: string;
};

// PDF Document
const MyDocument = ({ name, date, venue, setlist, eventTitle, logoUrl }: { name: string; date: string; venue: string; setlist: SetlistItem[]; eventTitle: string; logoUrl?: string }) => (
  <Document>
    <Page size="A4" style={{ padding: 15 }}>
      <div style={{ backgroundColor: 'black', padding: 30, height: '100%' }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 10,
          marginTop: 0
        }}>
          {logoUrl ? (
            <Image 
              src={logoUrl} 
              style={{ 
                width: 'auto', 
                height: 50, 
                objectFit: 'contain'
              }} 
            />
          ) : (
            <Text style={{ 
              fontSize: 40, 
              textAlign: 'center', 
              color: 'white'
            }}>
              {name}
            </Text>
          )}
        </View>
        
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{date}</Text>
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, color: 'white' }}>{eventTitle}</Text>
        <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 20, color: 'white' }}>{venue}</Text>
        {setlist.map((item, index) => (
          <Text 
            key={item.id} 
            style={{ 
              fontSize: 30, 
              marginBottom: 15, 
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
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [mcInput, setMcInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const { data: session } = useSession();
  const { bandName } = useBand();

  // ドラッグ&ドロップ用のセンサー設定
  const sensors = useSensors(
    useSensor(TouchSensor, {
      // タッチ操作の最適化
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      // マウス操作の最適化
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Setlistをセッションに保存
  const saveSetlistToSession = (newSetlist: SetlistItem[]) => {
    if (session?.user?.id) {
      sessionStorage.setItem(`setlist_${session.user.id}`, JSON.stringify(newSetlist));
    }
  };

  // セッションからSetlistを復元
  const restoreSetlistFromSession = () => {
    if (session?.user?.id) {
      const savedSetlist = sessionStorage.getItem(`setlist_${session.user.id}`);
      if (savedSetlist) {
        try {
          const parsedSetlist = JSON.parse(savedSetlist);
          setSetlist(parsedSetlist);
        } catch (error) {
          console.error('Setlist復元エラー:', error);
        }
      }
    }
  };

  // データベースから曲を読み込み
  const loadSongsFromDB = async () => {
    try {
      const bandId = await getCurrentBandId()
      console.log('読み込み対象のバンドID:', bandId)
      
      if (!bandId) {
        console.log('バンドIDが見つからないため、データベースからの読み込みをスキップ')
        return
      }

      const { data: songs, error } = await supabase
        .from("songs")
        .select('id, title, band_id')
        .eq('band_id', bandId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Supabase select error:", error.message);
        return
      }

      console.log('データベースから取得した曲:', songs)
      
      if (songs && songs.length > 0) {
        setSongs(songs);
        updateLocalStorage(songs);
      }
    } catch (error) {
      console.error("曲の読み込みエラー:", error);
    }
  };

  useEffect(() => {
    // まずローカルストレージから読み込み
    const savedSongs = localStorage.getItem("songs");
    if (savedSongs) {
      try {
        const parsedSongs = JSON.parse(savedSongs);
        // 古い形式（文字列配列）の場合は新しい形式に変換
        if (Array.isArray(parsedSongs) && typeof parsedSongs[0] === 'string') {
          const convertedSongs = parsedSongs.map((title, index) => ({
            id: `local_${index}`,
            title
          }));
          setSongs(convertedSongs);
        } else {
          setSongs(parsedSongs);
        }
      } catch (error) {
        console.error('ローカルストレージからの読み込みエラー:', error);
      }
    }
    
    // 次にデータベースから読み込み（上書き）
    loadSongsFromDB();
    restoreSetlistFromSession(); // セッションからSetlistを復元
    loadLogo(); // ロゴを読み込み
  }, [session]); // sessionが変更されたときに再実行

  const updateLocalStorage = (updatedSongs: Song[]) => {
    localStorage.setItem("songs", JSON.stringify(updatedSongs));
  };

  // ロゴを取得
  const loadLogo = async () => {
    try {
      const bandId = await getCurrentBandId()
      if (!bandId) return

      const { data: band, error } = await supabase
        .from('bands')
        .select('logo_url')
        .eq('id', bandId)
        .single()

      if (error) {
        // logo_urlカラムが存在しない場合は無視
        if (error.code === '42703') {
          console.log('logo_urlカラムが存在しません。データベースにカラムを追加してください。')
          return
        }
        console.error('ロゴ取得エラー:', error)
        return
      }

      if (band?.logo_url) {
        setLogoUrl(band.logo_url)
      }
    } catch (error) {
      console.error('ロゴ取得エラー:', error)
    }
  }

  // 現在のユーザーのバンドIDを取得
  const getCurrentBandId = async () => {
    try {
      console.log('getCurrentBandId開始')
      console.log('セッション情報:', session)
      
      if (!session?.user?.id) {
        console.log('セッションからユーザーIDを取得できません')
        return null
      }

      console.log('現在のユーザー:', session.user.id, session.user.email)
      
      const { data: band, error } = await supabase
        .from('bands')
        .select('id, name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      console.log('Supabaseクエリ結果:', { band, error })

      if (error) {
        console.error('バンドID取得エラー:', error)
        return null
      }

      // バンドが存在しない場合は作成
      if (!band) {
        console.log('バンドが存在しないため、新しく作成します')
        const { data: newBand, error: createError } = await supabase
          .from('bands')
          .insert([{ 
            user_id: session.user.id, 
            name: 'My Band' 
          }])
          .select('id, name')
          .single()

        if (createError) {
          console.error('バンド作成エラー:', createError)
          return null
        }

        console.log('新しく作成したバンド:', newBand)
        return newBand?.id || null
      }

      console.log('取得したバンド:', band)
      return band?.id || null
    } catch (error) {
      console.error('バンドID取得エラー:', error)
      console.log('ネットワークエラーのため、ローカルモードで動作します')
      return null
    }
  }

  // Supabaseへの登録処理
  const addSongToDB = async (title: string) => {
    try {
      console.log('addSongToDB開始:', title)
      const bandId = await getCurrentBandId()
      console.log('取得したバンドID:', bandId)
      
      if (!bandId) {
        console.error('バンドIDが見つかりません。先にバンド名を設定してください。')
        return
      }

      console.log('データベースに挿入するデータ:', { title, band_id: bandId })
      const { data, error } = await supabase.from("songs").insert([{ title, band_id: bandId }]).select('id, title');

      if (error) {
        console.error("Supabase insert error:", error.message);
        console.error("エラー詳細:", error)
      } else {
        console.log("曲をデータベースに保存しました:", title);
        console.log("挿入されたデータ:", data)
        // 新しく追加された曲をsongs状態に追加
        if (data && data[0]) {
          setSongs(prev => [...prev, data[0]]);
        }
      }
    } catch (error) {
      console.error("曲の保存エラー:", error);
    }
  };

  const addSong = (song: string) => {
    const newSong: Song = {
      id: `local_${performance.now()}`,
      title: song
    };
    
    setSongs((prev) => {
      const updatedSongs = [...prev, newSong];
      updateLocalStorage(updatedSongs);
      return updatedSongs;
    });

    addSongToDB(song); // ← Supabaseに保存
  };

  // データベースから曲を削除
  const deleteSongFromDB = async (title: string) => {
    try {
      const bandId = await getCurrentBandId()
      
      if (!bandId) {
        console.error('バンドIDが見つかりません')
        return
      }

      const { error } = await supabase
        .from("songs")
        .delete()
        .eq('title', title)
        .eq('band_id', bandId);

      if (error) {
        console.error("Supabase delete error:", error.message);
      } else {
        console.log("曲をデータベースから削除しました:", title);
      }
    } catch (error) {
      console.error("曲の削除エラー:", error);
    }
  };

  const handleDeleteSong = (songToDelete: string) => {
    setSongs((prev) => {
      const updatedSongs = prev.filter((song) => song.title !== songToDelete);
      updateLocalStorage(updatedSongs);
      return updatedSongs;
    });

    deleteSongFromDB(songToDelete); // ← Supabaseから削除
  };

  const handleAddToSetlist = (songToAdd: string) => {
    setSetlist((prev) => {
              const newSetlist: SetlistItem[] = [...prev, {
          id: `song_${performance.now()}`,
          type: 'song' as const,
          content: songToAdd,
          order: prev.filter(item => item.type === 'song').length + 1
        }];
      saveSetlistToSession(newSetlist);
      return newSetlist;
    });
    
    // トースト通知を表示
    setToastMessage(`${songToAdd}をセットリストに追加しました`);
    setIsToastVisible(true);
  };

  const handleAddMC = () => {
    if (mcInput.trim()) {
      setSetlist((prev) => {
        const newSetlist: SetlistItem[] = [...prev, {
          id: `mc_${performance.now()}`,
          type: 'mc' as const,
          content: mcInput,
          order: 0
        }];
        saveSetlistToSession(newSetlist);
        return newSetlist;
      });
      setMcInput("");
    }
  };

  const handleRemoveFromSetlist = (id: string) => {
    setSetlist((prev) => {
      const itemToRemove = prev.find(item => item.id === id);
      const newSetlist = prev.filter(item => item.id !== id);
      // 曲の順番を再計算
      let songCount = 0;
      const updatedSetlist = newSetlist.map(item => {
        if (item.type === 'song') {
          songCount++;
          return {
            ...item,
            order: songCount
          };
        }
        return item;
      });
      saveSetlistToSession(updatedSetlist);
      return updatedSetlist;
    });
    
    // 削除されたアイテムの内容を取得してトースト通知を表示
    const removedItem = setlist.find(item => item.id === id);
    if (removedItem) {
      const message = removedItem.type === 'song' 
        ? `${removedItem.content}をセットリストから削除しました`
        : `MC: ${removedItem.content}をセットリストから削除しました`;
      setToastMessage(message);
      setIsToastVisible(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSetlist((prev) => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        const newSetlist = arrayMove(prev, oldIndex, newIndex);
        
        // 曲の順番を再計算
        let songCount = 0;
        const updatedSetlist = newSetlist.map(item => {
          if (item.type === 'song') {
            songCount++;
            return {
              ...item,
              order: songCount
            };
          }
          return item;
        });
        saveSetlistToSession(updatedSetlist);
        return updatedSetlist;
      });
    }
  };

  const openPDFPreview = async () => {
    try {
      console.log('PDF生成開始...');
      const blob = await pdf(
        <MyDocument 
          name={bandName} 
          date={date} 
          venue={venue} 
          setlist={setlist} 
          eventTitle={eventTitle}
          logoUrl={logoUrl}
        />
      ).toBlob();
      
      console.log('Blob生成完了:', blob.size, 'bytes');
      
      // Blob URLを生成
      const url = URL.createObjectURL(blob);
      console.log('Blob URL生成完了:', url);
      
      // デバイス判定
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('デバイス判定:', isMobile ? 'モバイル' : 'デスクトップ');
      
      if (isMobile) {
        // スマホの場合は新しいウィンドウで開く
        console.log('モバイル用: 新しいウィンドウでPDFを開きます');
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // ポップアップがブロックされた場合
          console.log('ポップアップがブロックされました。同じウィンドウで開きます');
          window.location.href = url;
        }
      } else {
        // デスクトップの場合は新しいタブで開く
        console.log('デスクトップ用: 新しいタブでPDFを開きます');
        window.open(url, '_blank');
      }
      
      // メモリリーク防止のため、少し遅延してからURLを解放
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('Blob URLを解放しました');
      }, 5000);
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      setToastMessage('PDFの生成に失敗しました');
      setIsToastVisible(true);
    }
  };

  return (
    <div className="setlistContent">
      <Toast 
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
      <div className="container">
        <div className="block">
          <H2Title title="Song Title" />
          <SongInput onAddSong={addSong} />
        </div>
        <div className="block">
          <H2Title title="Added Songs" />
          <div className="cardList">
            {songs.map((song) => (
              <SongCard 
                key={song.id} 
                id={song.id} 
                song={song.title} 
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
          <H2Title title="Setlist" />
          <div className="cardList setlistCardList">
            <DndContext 
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
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
          <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Enter Event Title" required />
        </div>
        <div className="block">
          <H2Title title="Venue" />
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Enter Venue" required />
        </div>
        <div className="block">
          <Submit onClick={openPDFPreview} text="Preview PDF" icon={<FaFilePdf />} />
        </div>
      </div>
    </div>
  );
};

export default SetlistTool;