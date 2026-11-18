import { useEffect, useState } from 'react';
import type { Route } from './+types/home';
import LandingHeader from '~/components/landing/LandingHeader';
import LandingHero from '~/components/landing/LandingHero';
import LandingFeatures from '~/components/landing/LandingFeatures';
import LandingFooter from '~/components/landing/LandingFooter';
import LandingIntro from '~/components/landing/LandingIntro';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Growth OS | A personal growth workspace' },
    {
      name: 'description',
      content:
        'Build practices, keep reflections, collect what teaches you, and understand your personal history.',
    },
  ];
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedView, setSelectedView] = useState(4);
  const [selectedDay, setSelectedDay] = useState('2026-10-24');

  useEffect(() => {
    const updateScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollable > 0
          ? Math.round((window.scrollY / scrollable) * 100)
          : 0;

      setScrolled(window.scrollY > 32);
      setProgress(Math.max(0, Math.min(100, nextProgress)));
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      '.landing-page .landing-section, .landing-page .landing-final, .landing-page .public-footer',
    );

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach((section) => section.setAttribute('data-reveal', 'visible'));
      return;
    }

    sections.forEach((section) => {
      section.setAttribute('data-reveal', 'pending');
    });

    const revealVisibleSections = () => {
      sections.forEach((section) => {
        if (section.dataset.reveal !== 'pending') return;

        const bounds = section.getBoundingClientRect();
        if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
          section.setAttribute('data-reveal', 'visible');
        }
      });

      if ([...sections].every((section) => section.dataset.reveal === 'visible')) {
        window.removeEventListener('scroll', revealVisibleSections);
        window.removeEventListener('resize', revealVisibleSections);
      }
    };

    revealVisibleSections();
    window.addEventListener('scroll', revealVisibleSections, { passive: true });
    window.addEventListener('resize', revealVisibleSections);

    return () => {
      window.removeEventListener('scroll', revealVisibleSections);
      window.removeEventListener('resize', revealVisibleSections);
    };
  }, []);

  function scrollToSection(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <>
      <LandingIntro />
      <div className="landing-page">
        <LandingHeader
          scrolled={scrolled}
          progress={progress}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onCloseMenu={() => setMenuOpen(false)}
          onScrollTo={scrollToSection}
        />

        <main id="main-content">
          <LandingHero
            onScrollTo={scrollToSection}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          <LandingFeatures
            selectedView={selectedView}
            onSelectView={setSelectedView}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </main>

        <LandingFooter onScrollTo={scrollToSection} />
      </div>
    </>
  );
}
