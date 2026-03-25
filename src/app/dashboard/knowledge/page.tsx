import { KnowledgePageClient } from "@/components/dashboard/knowledge-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kunnskapsbase",
};

export default function KnowledgePage(): React.ReactNode {
  return <KnowledgePageClient />;
}
