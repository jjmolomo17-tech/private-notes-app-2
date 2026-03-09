import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NoteCard = ({ note, onUpdate, onDelete }: NoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');

  const handleSave = async () => {
    await onUpdate(note.id, title, content);
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content ?? '');
    setEditing(false);
  };

  const formattedDate = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-200">
      {editing ? (
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Write your note..."
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {note.title}
            </h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(note.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {note.content && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
              {note.content}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground/60">{formattedDate}</p>
        </>
      )}
    </div>
  );
};

export default NoteCard;
