import { useState } from 'react';
import { supabase } from '@/pages/api/supabaseClient';
import Head from 'next/head';
const Settings = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const uploadLogo = async () => {
    if (!logo) return;

    setUploading(true);
    const filePath = `logos/${logo.name}`; // ストレージ内のパスを指定

    const { data, error } = await supabase.storage
      .from('logos') // ストレージバケット名
      .upload(filePath, logo);

    if (error) {
      console.error('Error uploading logo:', error.message);
      setMessage('ロゴのアップロードに失敗しました。');
    } else {
      setMessage('ロゴがアップロードされました！');
      console.log('Uploaded logo:', data);
    }

    setUploading(false);
  };

  return (
    <main>
      <Head>
        <title>Setlist Maker | 設定</title>
        <meta name="description" content="Setlist Makerの設定画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={uploadLogo} disabled={uploading}>
            {uploading ? 'アップロード中...' : 'ロゴをアップロード'}
          </button>
        </div>
        {message && <p>{message}</p>}
      </section>
    </main>
  );
};

export default Settings;
