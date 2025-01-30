
"use client";

import DragDropList from "@/components/organisms/Setlist";
import Button from "@/components/atoms/Button";

export default function Main() {
  return (
    <main>
      <section id="SongList">
        <div className="wrapper"></div>
      </section>
      <section id="SetList">
        <div className="wrapper">
          <DragDropList />
          <div className="box">
            <Button href="" text="PDFで書き出し" />
          </div>
        </div>
      </section>
    </main>
  );
}
