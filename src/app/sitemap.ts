import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** Thank You and 404 are noindex, so they stay out of the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/about', priority: 0.8 },
    { path: '/portfolio', priority: 0.8 },
    { path: '/submit-pitch', priority: 0.9 },
    { path: '/contact', priority: 0.7 },
    { path: '/privacy', priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${site.baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  }));
}
