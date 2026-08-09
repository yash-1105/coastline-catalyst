import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { site } from '@/lib/site';

export const alt = 'Coastline Catalyst · Early-stage investment, India and the GCC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Generated at build time so the card never depends on a runtime fetch. */
export const dynamic = 'force-static';

export default async function OpengraphImage() {
  const assets = join(process.cwd(), 'src', 'assets');
  const [bold, medium, mark] = await Promise.all([
    readFile(join(assets, 'Manrope-Bold.ttf')),
    readFile(join(assets, 'Manrope-Medium.ttf')),
    readFile(join(assets, 'logo.png')),
  ]);

  // ImageResponse has no next/image, so the mark is inlined.
  const markSrc = `data:image/png;base64,${mark.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FBFBF9',
          padding: 72,
          fontFamily: 'Manrope',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={markSrc} width={52} height={52} alt="" />
          <span style={{ fontSize: 30, fontWeight: 700, color: '#0C1116' }}>{site.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#0C1116',
              maxWidth: 900,
            }}
          >
            Investing in founders building the next generation of businesses.
          </div>
          <div style={{ height: 1, background: '#0F3350', margin: '44px 0 28px' }} />
          <div style={{ fontSize: 24, fontWeight: 500, color: '#6B7280' }}>
            Early-stage investment · India and the GCC
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Manrope', data: bold, weight: 700, style: 'normal' },
        { name: 'Manrope', data: medium, weight: 500, style: 'normal' },
      ],
    },
  );
}
