import { headlines } from "@/content/homepage";
import { EditorialHome } from "@/components/directions/editorial/home";

export default function Page() {
  return (
    <EditorialHome
      theme={{
        direction: "mono",
        headline: { text: headlines[2], emphasis: "AI." },
        logo: "ink",
      }}
    />
  );
}
