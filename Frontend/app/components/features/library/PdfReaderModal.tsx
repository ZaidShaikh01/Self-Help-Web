import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { getBookAttachmentStreamUrl, type Resource, type ResourceStatus } from '~/lib/library';

interface PdfReaderModalProps {
  book: Resource;
  onClose: () => void;
  onUpdateProgress: (
    id: string,
    currentPage: number,
    status?: ResourceStatus,
  ) => Promise<void>;
  onReconcilePages?: (id: string, totalPages: number) => Promise<void>;
}

export default function PdfReaderModal({
  book,
  onClose,
  onUpdateProgress,
  onReconcilePages,
}: PdfReaderModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(book.pages || 0);
  const [pageInput, setPageInput] = useState<string>(String(book.currentPage || 1));
  const [zoomScale, setZoomScale] = useState<number>(1.25);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const saveTimeoutRef = useRef<any>(null);
  const latestPageRef = useRef<number>(book.currentPage || 1);

  // Load PDF.js dynamically on client
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);

      try {
        const pdfjsLib = await import('pdfjs-dist');

        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
              'pdfjs-dist/build/pdf.worker.mjs',
              import.meta.url,
            ).toString();
          } catch {
            // Worker URL fallback
          }
        }

        const streamUrl = getBookAttachmentStreamUrl(book._id);
        const loadingTask = pdfjsLib.getDocument({
          url: streamUrl,
          withCredentials: true,
          enableXfa: false,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);

        // Reconcile total pages with book record if unknown or mismatch
        if (!book.pages || book.pages !== doc.numPages) {
          onReconcilePages?.(book._id, doc.numPages).catch(() => {});
        }

        const startPage = Math.min(
          Math.max(book.currentPage || 1, 1),
          doc.numPages,
        );
        setCurrentPage(startPage);
        setPageInput(String(startPage));
        latestPageRef.current = startPage;
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load PDF document';
          setError(message);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [book._id]);

  // Render current page onto canvas
  useEffect(() => {
    const doc = pdfDocRef.current;
    if (!doc || !canvasRef.current) return;
    let isCancelled = false;

    async function renderPage() {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await doc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: zoomScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [currentPage, zoomScale]);

  // Persist reading progress (debounced 800ms)
  const queueProgressSave = (newPage: number) => {
    latestPageRef.current = newPage;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSavingProgress(true);
        const isCompleted = totalPages > 0 && newPage >= totalPages;
        const newStatus: ResourceStatus = isCompleted
          ? 'Completed'
          : 'In Progress';
        await onUpdateProgress(book._id, newPage, newStatus);
      } catch (err) {
        console.warn('Progress update failed:', err);
      } finally {
        setIsSavingProgress(false);
      }
    }, 800);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return;
    setCurrentPage(newPage);
    setPageInput(String(newPage));
    queueProgressSave(newPage);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      handlePageChange(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Keyboard navigation & close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Close with immediate progress flush
  const handleClose = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const finalPage = latestPageRef.current;
    if (finalPage !== book.currentPage) {
      const isCompleted = totalPages > 0 && finalPage >= totalPages;
      const finalStatus: ResourceStatus = isCompleted ? 'Completed' : 'In Progress';
      onUpdateProgress(book._id, finalPage, finalStatus).catch(() => {});
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Reader for ${book.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-[#171A20] text-white"
    >
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 bg-[#171A20] px-4 py-2.5 shadow-md">
        {/* Book Title & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-[#3E6AE1] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-md">
              {book.title}
            </h2>
            {book.author && (
              <p className="text-[11px] text-neutral-400 truncate">
                {book.author}
              </p>
            )}
          </div>
          {isSavingProgress && (
            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded animate-pulse">
              Saving…
            </span>
          )}
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-700 text-xs">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous page"
            className="p-1 hover:bg-neutral-800 rounded disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              aria-label="Current page number"
              className="w-12 text-center bg-neutral-800 border border-neutral-700 rounded py-0.5 text-xs text-white outline-none focus:border-[#3E6AE1]"
            />
            <span className="text-neutral-400">/ {totalPages || '…'}</span>
          </form>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={(totalPages > 0 && currentPage >= totalPages) || isLoading}
            aria-label="Next page"
            className="p-1 hover:bg-neutral-800 rounded disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Exit Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.2))}
            aria-label="Zoom out"
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-neutral-400 min-w-[38px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(3.0, z + 0.2))}
            aria-label="Zoom in"
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reader and return to library"
            className="flex items-center gap-1 bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewport */}
      <div className="flex-1 overflow-auto bg-[#26282B] p-4 flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-neutral-400 text-sm">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#3E6AE1] border-t-transparent" />
            <span>Loading document…</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="max-w-md rounded-xl border border-red-500/30 bg-red-950/40 p-6 text-center text-red-200 space-y-3"
          >
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="font-semibold text-sm">Failed to Load PDF</h3>
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-lg text-white"
            >
              Return to Library
            </button>
          </div>
        )}

        <div className={isLoading || error ? 'hidden' : 'block shadow-2xl rounded'}>
          <canvas ref={canvasRef} className="max-w-full rounded bg-white" />
        </div>
      </div>
    </div>
  );
}
