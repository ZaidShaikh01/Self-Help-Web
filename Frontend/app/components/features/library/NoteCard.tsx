import React from 'react';
import { Quote } from 'lucide-react';
import type { Note } from '~/lib/library';

interface NoteCardProps {
  note: Note;
}

function formatNoteDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function NoteCard({ note }: NoteCardProps) {
  const displayTitle =
    note.resource && typeof note.resource === 'object' && note.resource.title
      ? note.resource.title
      : note.title || 'Personal Reflection';

  return (
    <div className="bg-white border border-[#EEEEEE] rounded-xl p-6 shadow-sm hover:border-[#D0D1D2] transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-semibold text-[#3E6AE1] bg-[#3E6AE1]/10 px-2 py-0.5 rounded truncate max-w-[200px]">
            {displayTitle}
          </span>
          <span className="text-[11px] text-[#5C5E62] shrink-0 font-mono">
            {formatNoteDate(note.createdAt)}
          </span>
        </div>

        {note.quote && (
          <div className="flex gap-3 bg-[#F4F4F4] p-3.5 rounded-lg border-l-2 border-[#3E6AE1]">
            <Quote className="w-5 h-5 text-[#5C5E62] shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-[#171A20] italic">
              "{note.quote}"
            </p>
          </div>
        )}

        {note.content && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
              Personal Reflection
            </p>
            <p className="text-xs text-[#393C41] leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#EEEEEE]">
        <div className="flex flex-wrap items-center gap-1.5">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] bg-[#EEEEEE] text-[#5C5E62] px-2 py-0.5 rounded font-mono"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-[#8C8E92] font-mono">
              No tags
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
