import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Workspace — ChatPulse",
};

export default async function CreateWorkspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
