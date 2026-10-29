import { useEffect, useRef, useState } from 'react';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const main = document.querySelector('main');
    const bar = barRef.current;

    if (!main || !bar) return;

    let ticking = false;

    const updateProgress = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        const maxScroll = main.scrollHeight - main.clientHeight;
        const percentage = maxScroll > 0 ? main.scrollTop / maxScroll : 0;

        const value = Math.min(1, Math.max(0, percentage));

        bar.style.transform = `scaleX(${value})`;
        setProgress(Math.round(value * 100));

        ticking = false;
      });
    };

    updateProgress();

    main.addEventListener('scroll', updateProgress, {
      passive: true,
    });

    window.addEventListener('resize', updateProgress);

    return () => {
      main.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className='relative h-[2px] w-full bg-[var(--border-subtle)]'>
      <div
        ref={barRef}
        className='absolute inset-0 origin-left bg-[var(--accent)]'
        style={{
          transform: 'scaleX(0)',
          willChange: 'transform',
        }}
      />

      <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono leading-none text-[var(--text-3)]'>
        {progress}%
      </span>
    </div>
  );
}
