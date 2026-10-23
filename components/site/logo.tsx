import Image from "next/image";

// The Superintelligent logo, from the production PNG on besuper.ai, recolored
// to one flat color. Swap for the original vector file when it's in the repo.
export function Logo({
  tone = "ink",
  width = 168,
  className,
}: {
  tone?: "ink" | "white";
  width?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/brand/logo-${tone}.png`}
      alt="Superintelligent"
      width={566}
      height={91}
      style={{ width, height: "auto" }}
      className={className}
      preload
    />
  );
}
