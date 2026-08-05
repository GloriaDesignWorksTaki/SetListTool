"use client"

import React, { memo, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { FiTrash2, FiPlus, FiEdit2, FiCheck, FiX } from "react-icons/fi"
import { Button } from "@/components/atoms/Button"

type SongCardProps = {
  id: string
  song: string
  onDelete?: (songId: string) => void
  onUpdate?: (songId: string, title: string) => Promise<boolean> | boolean
  onAddToSetlist?: (song: string) => void
  onRemoveFromSetlist?: (song: string) => void
  isInSetlist?: boolean
  buttonLabel: string
  index?: number
  showIndex?: boolean
}

const SongCard: React.FC<SongCardProps> = memo(
  ({ song, onDelete, onUpdate, onAddToSetlist, isInSetlist, buttonLabel, id, index, showIndex }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
      id,
      disabled: !isInSetlist,
    })
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(song)
    const [saving, setSaving] = useState(false)

    const stopPointer = (e: React.SyntheticEvent) => {
      e.stopPropagation()
    }

    const startEdit = () => {
      setDraft(song)
      setEditing(true)
    }

    const cancelEdit = () => {
      setDraft(song)
      setEditing(false)
    }

    const saveEdit = async () => {
      if (!onUpdate) return
      const next = draft.trim()
      if (!next || next === song) {
        setEditing(false)
        return
      }
      setSaving(true)
      const ok = await onUpdate(id, next)
      setSaving(false)
      if (ok) {
        setEditing(false)
      }
    }

    return (
      <div
        ref={setNodeRef}
        {...(isInSetlist ? attributes : {})}
        {...(isInSetlist ? listeners : {})}
        className={`songCard no-select ${isInSetlist ? "draggable" : "songCardWithActions"} ${isDragging ? "dragging" : ""}`}
      >
        <div className="songCardMain">
          {showIndex && index !== undefined ? <span>{index + 1}. </span> : null}

          {editing ? (
            <input
              className="songCardEditInput"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={stopPointer}
              onPointerDown={stopPointer}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void saveEdit()
                }
                if (e.key === "Escape") {
                  cancelEdit()
                }
              }}
              disabled={saving}
              autoFocus
            />
          ) : (
            <span className="songCardTitle">{song}</span>
          )}
        </div>

        {isInSetlist ? null : (
          <div className="songCardActions" onPointerDown={stopPointer}>
            {editing ? (
              <>
                <Button
                  onClick={() => void saveEdit()}
                  className="AddToSetlistButton"
                  text="Save"
                  icon={<FiCheck />}
                  disabled={saving}
                />
                <Button
                  onClick={cancelEdit}
                  className="songCardDelete secondary"
                  text="Cancel"
                  icon={<FiX />}
                  disabled={saving}
                />
              </>
            ) : (
              <>
                {onUpdate && (
                  <Button
                    onClick={startEdit}
                    className="songCardEdit"
                    text="Edit"
                    icon={<FiEdit2 />}
                  />
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(id)}
                    className="songCardDelete secondary"
                    text="Delete"
                    icon={<FiTrash2 />}
                  />
                )}
                {onAddToSetlist && (
                  <Button
                    onClick={() => onAddToSetlist(song)}
                    className="AddToSetlistButton"
                    text={buttonLabel}
                    icon={<FiPlus />}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }
)

export default SongCard
