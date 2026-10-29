import { useCallback, useEffect, useState } from 'react';
import {
  createNote,
  createResource,
  fetchBooks,
  fetchNotes,
  type CreateNoteInput,
  type CreateResourceInput,
  type Note,
  type Resource,
} from '~/lib/library';
import type { NewBookData, NewNoteData } from '~/components/common/AddModal';

export function useLibrary() {
  const [books, setBooks] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [booksRes, notesRes] = await Promise.all([
        fetchBooks(50),
        fetchNotes({ limit: 50 }),
      ]);

      setBooks(booksRes.resources || []);
      setNotes(notesRes.notes || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load library data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const addBook = useCallback(
    async (data: NewBookData) => {
      setIsSaving(true);
      setError(null);

      try {
        const payload: CreateResourceInput = {
          title: data.title.trim(),
          type: 'Book',
          author: data.author.trim() || undefined,
          category: data.category,
          pages: Number(data.pages) > 0 ? Number(data.pages) : undefined,
          currentPage: 0,
          status: 'Plan to Do',
        };

        const newResource = await createResource(payload);
        setBooks((prev) => [newResource, ...prev]);
        return newResource;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save book.';
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const addNote = useCallback(
    async (data: NewNoteData) => {
      setIsSaving(true);
      setError(null);

      try {
        const rawTags = data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          : [];

        if (rawTags.length > 10) {
          throw new Error('A note can have at most 10 tags.');
        }

        for (const tag of rawTags) {
          if (tag.length > 20) {
            throw new Error(`Tag "${tag}" exceeds the 20 character limit.`);
          }
        }

        const trimmedQuote = data.quote.trim();
        const trimmedReflection = data.reflection.trim();

        if (!trimmedQuote && !trimmedReflection) {
          throw new Error('Please provide a quote or personal reflection.');
        }

        const payload: CreateNoteInput = {
          title: data.bookTitle.trim() || undefined,
          quote: trimmedQuote || undefined,
          content: trimmedReflection || undefined,
          tags: rawTags.length > 0 ? rawTags : undefined,
          resourceId: data.resourceId || undefined,
        };

        const createdNote = await createNote(payload);

        // If the note was created with a resourceId and the backend populated
        // resource wasn't returned in full, resolve resource details locally
        if (createdNote.resource === undefined && data.resourceId) {
          const matchingBook = books.find((b) => b._id === data.resourceId);
          if (matchingBook) {
            createdNote.resource = {
              _id: matchingBook._id,
              title: matchingBook.title,
              author: matchingBook.author,
            };
          }
        }

        setNotes((prev) => [createdNote, ...prev]);
        return createdNote;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save note.';
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [books],
  );

  return {
    books,
    notes,
    isLoading,
    isSaving,
    error,
    reload: loadLibrary,
    addBook,
    addNote,
  };
}
