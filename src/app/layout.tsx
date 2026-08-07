import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CookieBanner from '@/components/CookieBanner';
import PageTransition from '@/components/PageTransition';
import RevealObserver from '@/components/RevealObserver';
import Analytics from '@/components/Analytics';
import { site } from '@/lib/site';
import './globals.css';

/* Headings: Manrope 500/700 only. Body and UI: Inter 400/500 only. No other faces. */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: `${site.name} · Early-stage investment, India and the GCC`,
    // Titles use · as the separator. Em and en dashes are banned in all copy.
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_GB',
    title: site.name,
    description: 'Investing in founders building the next generation of businesses.',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: 'Investing in founders building the next generation of businesses.',
  },
  robots: { index: true, follow: true },
  other: {
    // Slot: Search Console verification, e.g. 'google-site-verification': '...'
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { 'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBFBF9',
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  description: 'Early-stage investment firm partnering with founders across India and the GCC.',
  url: site.baseUrl,
  email: site.email,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`js ${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Without JavaScript nothing should ever stay hidden waiting for a reveal. */}
        <noscript>
          {/* eslint-disable-next-line react/no-danger */}
          <style
            dangerouslySetInnerHTML={{
              __html: '[data-reveal]{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </head>
      <body>
        <a className="cc-skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CookieBanner />
        <PageTransition />
        <RevealObserver />
        <Analytics />
      </body>
    </html>
  );
}
