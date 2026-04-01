import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { checkRateLimit } from "@/lib/api-helpers";

const rateLimiter = createRateLimiter(10); // 10 uploads per minute per user

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "text/markdown",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "csv", "txt", "md"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function extractText(
  buffer: Buffer,
  extension: string,
): Promise<string> {
  switch (extension) {
    case "pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      return result.text;
    }
    case "docx": {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "xlsx": {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const parts: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        parts.push(`--- ${sheetName} ---\n${csv}`);
      }
      return parts.join("\n\n");
    }
    case "csv":
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit per user
  const rateLimited = checkRateLimit(rateLimiter, user.id);
  if (rateLimited) return rateLimited;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const workspaceId = formData.get("workspace_id") as string | null;

  if (!file || !workspaceId) {
    return Response.json(
      { error: "File and workspace_id are required" },
      { status: 400 },
    );
  }

  if (!isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspace_id" }, { status: 400 });
  }

  // Path traversal check on filename
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return Response.json({ error: "Invalid file name" }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File size exceeds 10MB limit" },
      { status: 400 },
    );
  }

  // Validate file type
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return Response.json(
      { error: `Unsupported file type: .${extension}` },
      { status: 400 },
    );
  }

  if (file.type && !ALLOWED_TYPES.has(file.type) && !["csv", "txt", "md"].includes(extension)) {
    return Response.json(
      { error: "Unsupported MIME type" },
      { status: 400 },
    );
  }

  // Verify workspace membership
  const { data: membership } = await supabase
    .from("members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return Response.json({ error: "Not a workspace member" }, { status: 403 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${workspaceId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      return Response.json(
        { error: "File upload failed" },
        { status: 500 },
      );
    }

    // Extract text
    const extractedText = await extractText(buffer, extension);

    // Create knowledge entry
    const { data, error: insertError } = await supabase
      .from("knowledge")
      .insert({
        workspace_id: workspaceId,
        title: file.name,
        content: extractedText,
        category: "Dokument",
        file_url: storagePath,
        file_name: file.name,
      })
      .select("id, title, content, category, created_at, file_url, file_name")
      .single();

    if (insertError) {
      return Response.json(
        { error: "Failed to save knowledge entry" },
        { status: 500 },
      );
    }

    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Text extraction failed" },
      { status: 500 },
    );
  }
}
