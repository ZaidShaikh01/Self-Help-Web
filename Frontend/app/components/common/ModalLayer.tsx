import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalLayerProps {
  children: ReactNode;
  className: string;
  onClose: () => void;
  canDismiss?: boolean;
}

const activeLayers: symbol[] = [];
let previousBodyOverflow = '';

export default function ModalLayer({
  children,
  className,
  onClose,
  canDismiss = true,
}: ModalLayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const layerId = useRef(Symbol('modal-layer'));
  const onCloseRef = useRef(onClose);
  const canDismissRef = useRef(canDismiss);

  useEffect(() => {
    onCloseRef.current = onClose;
    canDismissRef.current = canDismiss;
  }, [onClose, canDismiss]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (activeLayers.length === 0) {
      previousBodyOverflow = document.body.style.overflow;
    }
    activeLayers.push(layerId.current);
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      const isTopLayer =
        activeLayers[activeLayers.length - 1] === layerId.current;
      if (event.key === 'Escape' && isTopLayer && canDismissRef.current) {
        onCloseRef.current();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const layerIndex = activeLayers.indexOf(layerId.current);
      if (layerIndex !== -1) activeLayers.splice(layerIndex, 1);
      if (activeLayers.length === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [isMounted, layerId]);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={className}
      onClick={(event) => {
        if (event.target === event.currentTarget && canDismissRef.current) {
          onCloseRef.current();
        }
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
