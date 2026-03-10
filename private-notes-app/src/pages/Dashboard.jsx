import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, Plus, StickyNote } from 'lucide-react';
import NoteCard from '@/components/NoteCard';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createNote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('notes').insert([
        {
          title: newTitle,
          content: newContent || null,
          user_id: user.id,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewTitle('');
      setNewContent('');
      setShowForm(false);
      toast.success('Note created');
    },
    onError: (e) => toast.error(e.message),
  });

  const updateNote = async (id, title, content) => {
    const { error } = await supabase.from('notes').update({ title, content }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated');
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createNote.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              My Notes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {showForm ? (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] space-y-3"
          >
            <Input
              placeholder="Note title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              autoFocus
              style={{ fontFamily: 'var(--font-display)' }}
              className="font-semibold text-lg"
            />
            <Textarea
              placeholder="Write something..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createNote.isPending}>
                {createNote.isPending ? 'Saving...' : 'Save note'}
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowForm(true)} className="mb-8">
            <Plus className="h-4 w-4 mr-1" /> New note
          </Button>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">No notes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
