"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/data/types";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="rounded-xl bg-brand-50 border border-brand-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-neutral-400">
            {formatDate(note.createdAt)}
          </span>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-neutral-400 hover:text-brand-600"
                  onClick={() => onEdit(note)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-neutral-400 hover:text-rose-600"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-neutral-700 mt-1 whitespace-pre-wrap">
          {note.content}
        </p>
      </CardContent>
    </Card>
  );
}
