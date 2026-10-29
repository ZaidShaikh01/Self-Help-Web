import { useCallback, useEffect, useState } from 'react';
import {
  createNote,
  createResource,
  deleteBookAttachment,
  deleteNote,
  deleteResource,
  fetchBooks,
  fetchNotes,
  updateEpubReadingProgress,
  updateNote,
  updateResource,
  uploadBookAttachment,
  type CreateNoteInput,
  type CreateResourceInput,
  type Note,
  type Resource,
  type ResourceStatus,
  type UpdateNoteInput,
  type UpdateResourceInput,
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

  const addBook = useCallback(async (data: NewBookData) => {
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
  }, []);

  const updateBook = useCallback(
    async (id: string, data: UpdateResourceInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const updated = await updateResource(id, data);
        setBooks((prev) =>
          prev.map((book) => (book._id === id ? updated : book)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update book.';
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const updateBookProgress = useCallback(
    async (id: string, currentPage: number, status?: ResourceStatus) => {
      setIsSaving(true);
      setError(null);

      try {
        const payload: UpdateResourceInput = { currentPage };
        if (status) payload.status = status;

        const updated = await updateResource(id, payload);
        setBooks((prev) =>
          prev.map((book) => (book._id === id ? updated : book)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update reading progress.';
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deleteBook = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await deleteResource(id);

      // Remove the book from books list
      setBooks((prev) => prev.filter((book) => book._id !== id));

      // Update any linked notes in state: their resource becomes unlinked (null/undefined)
      setNotes((prev) =>
        prev.map((note) => {
          if (
            note.resource &&
            typeof note.resource === 'object' &&
            note.resource._id === id
          ) {
            return { ...note, resource: undefined };
          }
          return note;
        }),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete book.';
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const uploadAttachment = useCallback(async (id: string, file: File) => {
    setIsSaving(true);
    setError(null);

    try {
      const updated = await uploadBookAttachment(id, file);
      setBooks((prev) =>
        prev.map((book) => (book._id === id ? updated : book)),
      );
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload attachment.';
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const removeAttachment = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const updated = await deleteBookAttachment(id);
      setBooks((prev) =>
        prev.map((book) => (book._id === id ? updated : book)),
      );
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove attachment.';
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateEpubProgress = useCallback(
    async (id: string, cfi: string, percentage: number) => {
      try {
        const updated = await updateEpubReadingProgress(id, {
          cfi,
          percentage,
        });
        setBooks((prev) =>
          prev.map((book) => (book._id === id ? updated : book)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update reading position.';
        throw new Error(message);
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

  const updateExistingNote = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        quote?: string;
        reflection?: string;
        tags?: string;
        resourceId?: string;
      },
    ) => {
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

        const trimmedQuote = (data.quote ?? '').trim();
        const trimmedReflection = (data.reflection ?? '').trim();

        if (!trimmedQuote && !trimmedReflection) {
          throw new Error('Please provide a quote or personal reflection.');
        }

        const payload: UpdateNoteInput = {
          title: data.title?.trim() || undefined,
          quote: trimmedQuote || undefined,
          content: trimmedReflection || undefined,
          tags: rawTags.length > 0 ? rawTags : [],
          resourceId: data.resourceId || undefined,
        };

        const updated = await updateNote(id, payload);

        // Populate resource in state if not returned in full by server
        if (data.resourceId) {
          const matchingBook = books.find((b) => b._id === data.resourceId);
          if (matchingBook) {
            updated.resource = {
              _id: matchingBook._id,
              title: matchingBook.title,
              author: matchingBook.author,
            };
          }
        } else if (data.resourceId === '') {
          updated.resource = undefined;
        }

        setNotes((prev) =>
          prev.map((note) => (note._id === id ? updated : note)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update note.';
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [books],
  );

  const deleteExistingNote = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete note.';
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    books,
    notes,
    isLoading,
    isSaving,
    error,
    reload: loadLibrary,
    addBook,
    updateBook,
    updateBookProgress,
    deleteBook,
    uploadAttachment,
    removeAttachment,
    updateEpubProgress,
    addNote,
    updateExistingNote,
    deleteExistingNote,
  };
}
