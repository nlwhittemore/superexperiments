import type { Placeholder } from "@/content/homepage";

// A copy-doc [[PLACEHOLDER]]: the slot stays in the design, visibly unfinished.
export function PlaceholderSlot({
  value,
  className = "",
}: {
  value: Placeholder;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-[3px] border border-dashed border-current px-1.5 py-0.5 font-mono text-[11px] tracking-normal opacity-60 ${className}`}
      title="Placeholder from the copy doc"
    >
      TBD: {value.placeholder}
    </span>
  );
}
