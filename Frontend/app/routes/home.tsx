import { useEffect, useState } from 'react';
import type { Route } from './+types/home';
import LandingHeader from '~/components/landing/LandingHeader';
import LandingHero from '~/components/landing/LandingHero';
import LandingFeatures from '~/components/landing/LandingFeatures';
import LandingFooter from '~/components/landing/LandingFooter';

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
  const [selectedView, setSelectedView] = useState(4);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 32);

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  function scrollToSection(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <div className="landing-page">
      <LandingHeader
        scrolled={scrolled}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onCloseMenu={() => setMenuOpen(false)}
        onScrollTo={scrollToSection}
      />

      <main id="main-content">
        <LandingHero onScrollTo={scrollToSection} />
        <LandingFeatures
          selectedView={selectedView}
          onSelectView={setSelectedView}
        />
      </main>

      <LandingFooter onScrollTo={scrollToSection} />
    </div>
  );
}
