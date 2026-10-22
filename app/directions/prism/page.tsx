import { headlines } from "@/content/homepage";
import { DocumentHome } from "@/components/directions/document/home";

export default function Page() {
  return (
    <DocumentHome
      theme={{
        direction: "prism",
        headline: { text: headlines[0], emphasis: "building with it." },
        logo: "ink",
        sparks: true,
      }}
    />
  );
}
