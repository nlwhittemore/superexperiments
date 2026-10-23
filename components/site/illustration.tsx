import Image from "next/image";
import type { Direction } from "./plate";

// A generated illustration on a white ground. Multiply blending drops the
// ground so it sits on any light surface.
export function Illustration({
  direction,
  name,
  sizes = "(min-width: 1024px) 480px, 100vw",
  className = "",
}: {
  direction: Direction;
  name: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={`/directions/${direction}/${name}.webp`}
      alt=""
      width={1536}
      height={1024}
      sizes={sizes}
      className={`mix-blend-multiply ${className}`}
    />
  );
}
