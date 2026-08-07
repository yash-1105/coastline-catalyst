import { initialsOf, type Company } from '@/lib/site';

/**
 * A company's mark in its bordered tile, falling back to initials while a logo
 * is still missing. Brand marks keep their own colours: they are the one place
 * on the site where the closed palette does not apply, because recolouring
 * someone else's logo would misrepresent it.
 */
export default function CompanyLogo({
  company,
  className,
  size,
}: {
  company: Company;
  className: string;
  size: number;
}) {
  if (!company.logo) {
    return (
      <div className={className} aria-hidden="true">
        {initialsOf(company.name)}
      </div>
    );
  }

  return (
    <div className={className} data-has-logo="true" aria-hidden="true">
      {/* Plain img: these are small, fixed-size, and one is an SVG, so the
          optimizer would add work without adding anything. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={company.logo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
