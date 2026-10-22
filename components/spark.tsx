import Image from "next/image";

export function Spark({ className }: { className?: string }) {
  return (
    <Image
      src="/spark.png"
      alt=""
      width={473}
      height={473}
      className={className}
      priority
    />
  );
}
