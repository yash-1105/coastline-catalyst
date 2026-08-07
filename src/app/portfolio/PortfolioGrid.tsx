'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import CompanyLogo from '@/components/CompanyLogo';
import { companies, type Company } from '@/lib/site';
import styles from './portfolio.module.css';

const GROUPS: { label: string; key: keyof Pick<Company, 'industry' | 'stage' | 'status'> }[] = [
  { label: 'Industry', key: 'industry' },
  { label: 'Stage', key: 'stage' },
  { label: 'Status', key: 'status' },
];

type Selection = Record<(typeof GROUPS)[number]['key'], string>;

const ALL = 'All';

export default function PortfolioGrid() {
  const [selection, setSelection] = useState<Selection>({
    industry: ALL,
    stage: ALL,
    status: ALL,
  });

  // Options are derived from the data, so new companies extend the filters.
  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        options: [ALL, ...new Set(companies.map((company) => company[group.key]))],
      })),
    [],
  );

  const filtered = useMemo(
    () =>
      companies.filter((company) =>
        GROUPS.every(
          ({ key }) => selection[key] === ALL || company[key] === selection[key],
        ),
      ),
    [selection],
  );

  return (
    <section className={styles.body}>
      <div className={styles.wrap}>
        <div className={styles.filters} role="group" aria-label="Filters">
          {groups.map((group) => (
            <div key={group.key} className={styles.filterGroup}>
              <span className={styles.filterLabel} id={`filter-${group.key}`}>
                {group.label}
              </span>
              {group.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.filterPill}
                  aria-pressed={selection[group.key] === option}
                  aria-describedby={`filter-${group.key}`}
                  onClick={() =>
                    setSelection((current) => ({ ...current, [group.key]: option }))
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((company, i) => {
            const external = company.url.startsWith('http');
            return (
              <article key={company.name} className={styles.card} data-reveal={i * 80}>
                <CompanyLogo company={company} className={styles.tile} size={36} />
                <h2 className={styles.name}>{company.name}</h2>
                <p className={styles.desc}>{company.desc}</p>
                <p className={styles.founders}>{company.founders}</p>
                <div className={styles.meta}>
                  <span className={styles.pill}>{company.industry}</span>
                  <span className={styles.pill}>{company.stage}</span>
                  <span className={styles.pillStatus}>{company.status}</span>
                </div>
                <div className={styles.cardLinks}>
                  <a
                    href={company.url}
                    className={styles.cardLink}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                  >
                    Website <span aria-hidden="true">&rarr;</span>
                    <span className="cc-visually-hidden">{`: ${company.name}`}</span>
                  </a>
                  {company.linkedin && (
                    <a
                      href={company.linkedin}
                      className={styles.cardLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn <span aria-hidden="true">&rarr;</span>
                      <span className="cc-visually-hidden">{`: ${company.name}`}</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <p className={styles.empty}>
              No companies match those filters yet. Clear one to see more.
            </p>
          )}

          <Link href="/submit-pitch" className={styles.pitchTile}>
            <span className={styles.pitchTitle}>Your company here.</span>
            <span className={styles.pitchLink}>
              Submit your pitch <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}
