import Link from 'next/link';
import Logo from './Logo';
import { footerNavLinks, site } from '@/lib/site';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer} data-site-footer>
      <div className={styles.columns}>
        <div className={styles.brandColumn}>
          <div className={styles.brand}>
            <Logo size={30} />
            <span className={styles.wordmark}>{site.name}</span>
          </div>
          <p className={styles.tagline}>{site.tagline}</p>
        </div>

        <nav className={styles.column} aria-label="Footer">
          {footerNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.column}>
          <a href={`mailto:${site.email}`} className={styles.link}>
            {site.email}
          </a>
          <a
            href={site.linkedinUrl}
            className={styles.link}
            target={site.linkedinUrl.startsWith('http') ? '_blank' : undefined}
            rel={site.linkedinUrl.startsWith('http') ? 'noreferrer' : undefined}
          >
            LinkedIn
          </a>
          <span className={styles.location}>{site.location}</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.fine}>{site.copyright}</span>
          <span className={styles.disclaimer}>{site.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
