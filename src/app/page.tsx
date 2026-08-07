import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import {
  InvestmentFocus,
  WhatWeBelieve,
  WhatWeLookFor,
  WhoWeAre,
  WhyPartner,
} from '@/components/home/Sections';
import PinnedPortfolio from '@/components/home/PinnedPortfolio';
import HomeScrollFX from '@/components/home/HomeScrollFX';
import CtaBand from '@/components/CtaBand';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} · Early-stage investment, India and the GCC`,
  },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: site.name,
    description: 'Investing in founders building the next generation of businesses.',
    url: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <main id="main">
        <Hero />
        <WhoWeAre />
        <WhatWeBelieve />
        <InvestmentFocus />
        <WhatWeLookFor />
        <PinnedPortfolio />
        <WhyPartner />
        <CtaBand video />
      </main>
      <HomeScrollFX />
    </>
  );
}
