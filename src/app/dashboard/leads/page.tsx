import { Suspense } from "react";
import { LeadsPageLazy } from "./leads-lazy";

export const metadata = {
  title: "Leads",
};

export default function LeadsPage(): React.ReactNode {
  return (
    <Suspense>
      <LeadsPageLazy />
    </Suspense>
  );
}
