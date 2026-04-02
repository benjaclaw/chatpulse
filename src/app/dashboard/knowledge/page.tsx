import { Suspense } from "react";
import { KnowledgePageClient } from "@/components/dashboard/knowledge-page";

export const metadata = {
  title: "Kunnskapsbase",
};

export default function KnowledgePage(): React.ReactNode {
  return (
    <Suspense>
      <KnowledgePageClient />
    </Suspense>
  );
}
