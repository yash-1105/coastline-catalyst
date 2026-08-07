/** Faint Paper wave motif sitting at the bottom of the dark navy bands. */
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
        d="M0 80 q75 -24 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="1.5"
      />
      <path
        d="M0 130 q75 -20 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="1.5"
      />
    </svg>
  );
}
