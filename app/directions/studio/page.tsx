import { headlines } from "@/content/homepage";
import { DocumentHome } from "@/components/directions/document/home";

export default function Page() {
  return (
    <DocumentHome
      theme={{
        direction: "studio",
        headline: { text: headlines[1], emphasis: "Get good at it." },
        logo: "ink",
        sparks: true,
        ills: {
          finder: "ill-finder",
          levels: ["ill-foundations", "ill-professional", "ill-advanced"],
          champions: "ill-champions",
          subscription: "ill-subscription",
          method: "ill-method",
          closing: "ill-closing",
        },
      }}
    />
  );
}
