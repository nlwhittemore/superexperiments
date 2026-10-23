import { headlines } from "@/content/homepage";
import { EditorialHome } from "@/components/directions/editorial/home";

export default function Page() {
  return (
    <EditorialHome
      theme={{
        direction: "paper",
        headline: { text: headlines[0], emphasis: "building", breakAfterEmphasis: true },
        logo: "ink",
      }}
    />
  );
}
