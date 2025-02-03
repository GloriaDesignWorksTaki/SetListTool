"use client";

import { useState } from "react";
import DragDropList from "@/components/organisms/Setlist";
import AddSong from "@/components/organisms/AddSong";
import Button from "@/components/atoms/Button";

export default function Main() {
  const [items, setItems] = useState([
    "We are in the Heyday of Youth",
    "Blinded My Eyes",
    "Introduce",
    "Insurance",
    "Long Way to Failure",
  ]);

  const Home = (newSong: string) => {
    setItems((prev) => [...prev, newSong]);
  };

  return (
    <main>
      <section id="SongList">
        <div className="wrapper">
          <AddSong onAddSong={Home} />
        </div>
      </section>
      <section id="SetList">
        <div className="wrapper">
          <DragDropList items={items} setItems={setItems} />
          <div className="box">
            <Button href="" text="PDFで書き出し" />
          </div>
        </div>
      </section>
    </main>
  );
}