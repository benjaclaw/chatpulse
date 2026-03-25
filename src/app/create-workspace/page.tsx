import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CreateWorkspacePage(): never {
  redirect("/onboarding");
}
