import Image from 'next/image';
import logo from '@/assets/logo.png';

/**
 * The Coastline Catalyst mark. Decorative: every place it appears sits next to
 * the wordmark or inside a labelled link, so it carries an empty alt.
 *
 * The asset is keyed to transparency from the supplied artwork, so it composes
 * on Paper without a background square. The mark fills ~92.5% of its box, which
 * matches the optical size of the placeholder it replaced.
 */
export default function Logo({
  size = 32,
  priority = false,
}: {
  size?: number;
  /** True in the header, where the mark is above the fold on every page. */
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt=""
      width={size}
      height={size}
      priority={priority}
      style={{ display: 'block', width: size, height: size }}
    />
  );
}
