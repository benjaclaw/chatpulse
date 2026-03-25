import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { CenteredLayout } from "@/components/auth/centered-layout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Workspace — ChatPulse",
};

export default async function CreateWorkspacePage(): Promise<React.ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <CenteredLayout>
      <CreateWorkspaceForm />
    </CenteredLayout>
  );
}
