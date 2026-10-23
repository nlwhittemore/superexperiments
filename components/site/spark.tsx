// The four-point spark from the Superintelligent logo, as a brand glyph.
// Filled with --spark-fill, so a direction can paint it a color or a gradient.
export function Spark({ size = 12, className = "" }: { size?: number; className?: string }) {
  return <span aria-hidden className={`site-spark ${className}`} style={{ width: size, height: size }} />;
}
