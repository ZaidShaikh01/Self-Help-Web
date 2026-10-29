import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import { getBookAttachmentStreamUrl, type Resource } from '~/lib/library';

interface EpubReaderModalProps {
  book: Resource;
  onClose: () => void;
  onUpdateEpubProgress: (
    id: string,
    cfi: string,
    percentage: number,
  ) => Promise<void>;
}

export default function EpubReaderModal({
  book,
  onClose,
  onUpdateEpubProgress,
}: EpubReaderModalProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const epubBookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const saveTimeoutRef = useRef<any>(null);
  const latestCfiRef = useRef<string>(book.attachment?.epubProgress?.cfi || '');
  const latestPercentageRef = useRef<number>(
    book.attachment?.epubProgress?.percentage || 0,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(
    book.attachment?.epubProgress?.percentage || 0,
  );
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Load and render EPUB on the client
  useEffect(() => {
    let isCancelled = false;

    async function loadEpub() {
      setIsLoading(true);
      setError(null);

      try {
        const streamUrl = getBookAttachmentStreamUrl(book._id);

        // Fetch through authenticated backend session
        const response = await fetch(streamUrl, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch EPUB file (${response.status} ${response.statusText})`,
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        if (isCancelled) return;

        // Dynamically import epubjs on client
        const ePub = (await import('epubjs')).default;

        const epubBook = ePub(arrayBuffer);
        epubBookRef.current = epubBook;

        await epubBook.ready;
        if (isCancelled || !viewerRef.current) return;

        // Generate locations for accurate percentage tracking
        epubBook.locations.generate(1000).catch(() => {});

        // Render into viewer with strict security settings
        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'auto',
          // Security: strictly disable any scripted content in EPUB
          allowScriptedContent: false,
        });

        renditionRef.current = rendition;

        // Apply clean readable styling matching the design tokens
        rendition.themes.default({
          body: {
            color: '#171A20 !important',
            background: '#FAF9F8 !important',
            'font-family':
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
            'line-height': '1.7 !important',
            padding: '0 1rem !important',
          },
          p: {
            'margin-bottom': '1em !important',
          },
          'h1, h2, h3, h4': {
            color: '#171A20 !important',
            'font-weight': '700 !important',
          },
        });

        // Restore saved position or open from beginning
        const initialCfi = book.attachment?.epubProgress?.cfi;
        if (initialCfi) {
          await rendition.display(initialCfi);
        } else {
          await rendition.display();
        }

        if (isCancelled) return;

        // Track location changes
        rendition.on('relocated', (location: any) => {
          if (!location || !location.start) return;

          const currentCfi = location.start.cfi;
          latestCfiRef.current = currentCfi;

          // Get percentage from locations or location.start.percentage
          let calcPct = 0;
          if (
            epubBook.locations &&
            typeof epubBook.locations.percentageFromCfi === 'function'
          ) {
            calcPct = Math.round(
              epubBook.locations.percentageFromCfi(currentCfi) * 100,
            );
          } else if (typeof location.start.percentage === 'number') {
            calcPct = Math.round(location.start.percentage * 100);
          }

          if (!isNaN(calcPct)) {
            const boundedPct = Math.min(100, Math.max(0, calcPct));
            setPercentage(boundedPct);
            latestPercentageRef.current = boundedPct;
            queueProgressSave(currentCfi, boundedPct);
          }

          // Try to get chapter title from navigation
          try {
            const currentChapter = epubBook.navigation?.get(location.start.href);
            if (currentChapter?.label) {
              setChapterTitle(currentChapter.label.trim());
            }
          } catch {
            // Ignore chapter resolution error
          }
        });
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load EPUB document';
          setError(message);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadEpub();

    return () => {
      isCancelled = true;
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch {}
      }
      if (epubBookRef.current) {
        try {
          epubBookRef.current.destroy();
        } catch {}
      }
    };
  }, [book._id]);

  // Debounced reading position persistence (800ms)
  const queueProgressSave = (cfi: string, pct: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSavingProgress(true);
        await onUpdateEpubProgress(book._id, cfi, pct);
      } catch (err) {
        console.warn('EPUB progress save failed:', err);
      } finally {
        setIsSavingProgress(false);
      }
    }, 800);
  };

  const handlePrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  // Keyboard navigation & close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close and flush final reading progress
  const handleClose = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const finalCfi = latestCfiRef.current;
    const finalPct = latestPercentageRef.current;

    if (
      finalCfi &&
      (finalCfi !== book.attachment?.epubProgress?.cfi ||
        finalPct !== book.attachment?.epubProgress?.percentage)
    ) {
      onUpdateEpubProgress(book._id, finalCfi, finalPct).catch(() => {});
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`EPUB Reader for ${book.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F8] text-[#171A20]"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEEEE] bg-white px-4 py-2.5 shadow-sm">
        {/* Book Title & Chapter Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen className="w-4 h-4 text-[#3E6AE1] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#171A20] truncate max-w-[200px] sm:max-w-md">
              {book.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-[#5C5E62]">
              {book.author && <span className="truncate">{book.author}</span>}
              {chapterTitle && (
                <>
                  <span>•</span>
                  <span className="truncate font-medium">{chapterTitle}</span>
                </>
              )}
            </div>
          </div>
          {isSavingProgress && (
            <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded animate-pulse">
              Saving position…
            </span>
          )}
        </div>

        {/* Progress & Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5C5E62] bg-[#F4F4F4] px-2.5 py-1 rounded-lg border border-[#EEEEEE]">
            <Bookmark className="w-3.5 h-3.5 text-[#3E6AE1]" />
            <span className="font-semibold text-[#171A20]">{percentage}%</span>
            <span>read</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isLoading}
              aria-label="Previous page"
              className="p-1.5 bg-[#F4F4F4] hover:bg-[#EEEEEE] rounded-lg text-[#171A20] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              aria-label="Next page"
              className="p-1.5 bg-[#F4F4F4] hover:bg-[#EEEEEE] rounded-lg text-[#171A20] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#EEEEEE] mx-1" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reader and return to library"
            className="flex items-center gap-1 bg-[#F4F4F4] hover:bg-[#EEEEEE] text-[#171A20] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main EPUB Reader Viewport */}
      <div className="relative flex-1 overflow-hidden bg-[#FAF9F8]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FAF9F8] text-[#5C5E62] text-sm z-10">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#3E6AE1] border-t-transparent" />
            <span>Loading EPUB book…</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#FAF9F8] z-10">
            <div
              role="alert"
              className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3"
            >
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="font-semibold text-sm">Failed to Load EPUB</h3>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 bg-white border border-red-300 hover:bg-red-50 text-xs font-medium rounded-lg text-red-700 cursor-pointer"
              >
                Return to Library
              </button>
            </div>
          </div>
        )}

        <div
          ref={viewerRef}
          className="w-full h-full max-w-4xl mx-auto px-4 sm:px-8 py-6 select-text"
        />
      </div>
    </div>
  );
}
