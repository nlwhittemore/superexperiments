import { headlines } from "@/content/homepage";
import { EditorialHome } from "@/components/directions/editorial/home";

export default function Page() {
  return (
    <EditorialHome
      theme={{
        direction: "night",
        headline: { text: headlines[1], emphasis: "Get good at it." },
        logo: "white",
      }}
    />
  );
}
