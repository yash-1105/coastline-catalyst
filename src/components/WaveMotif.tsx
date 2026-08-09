import styles from './WaveMotif.module.css';

/**
 * Faint Paper wave motif sitting at the bottom of the dark navy bands.
 *
 * Both lines run one wave period wider than the viewBox so they can drift
 * without exposing an end: see WaveMotif.module.css for the loop maths. The
 * top line spans 0 to 1800 and travels left, the bottom line spans -300 to
 * 1500 and travels right, so at every moment the full 0 to 1500 viewBox is
 * covered by both.
 */
export default function WaveMotif({
  height,
  opacity,
}: {
  height: number;
  opacity: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1500 200"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <path
        className={styles.waveA}
        d="M0 80 q75 -24 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="1.5"
      />
      <path
        className={styles.waveB}
        d="M-300 130 q75 -20 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="1.5"
      />
    </svg>
  );
}
