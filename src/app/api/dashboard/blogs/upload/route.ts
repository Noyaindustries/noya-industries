import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function POST(request: Request) {
  // #region agent log
  fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
    body: JSON.stringify({
      sessionId: "efec23",
      runId: "pre-fix",
      hypothesisId: "H8",
      location: "src/app/api/dashboard/blogs/upload/route.ts:31",
      message: "Upload endpoint called",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour modifier les articles." },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const uploadedFile = formData?.get("file");
  if (!(uploadedFile instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  // #region agent log
  fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
    body: JSON.stringify({
      sessionId: "efec23",
      runId: "pre-fix",
      hypothesisId: "H9",
      location: "src/app/api/dashboard/blogs/upload/route.ts:57",
      message: "Upload file metadata",
      data: { size: uploadedFile.size, type: uploadedFile.type, name: uploadedFile.name },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!ALLOWED_MIME_TYPES.has(uploadedFile.type)) {
    return NextResponse.json({ error: "Format image non supporté (jpg, png, webp, gif)." }, { status: 415 });
  }
  if (uploadedFile.size <= 0 || uploadedFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image invalide ou trop lourde (max 5 MB)." }, { status: 413 });
  }

  try {
    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = getExtensionFromMimeType(uploadedFile.type);
    const sanitizedBaseName = path
      .basename(uploadedFile.name, path.extname(uploadedFile.name))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizedBaseName || "image"}.${extension}`;
    const uploadDirectoryPath = path.join(process.cwd(), "public", "uploads", "blog");
    const absoluteFilePath = path.join(uploadDirectoryPath, fileName);
    await mkdir(uploadDirectoryPath, { recursive: true });
    await writeFile(absoluteFilePath, buffer);
    const publicUrl = `/uploads/blog/${fileName}`;

    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
      body: JSON.stringify({
        sessionId: "efec23",
        runId: "pre-fix",
        hypothesisId: "H10",
        location: "src/app/api/dashboard/blogs/upload/route.ts:104",
        message: "Upload saved",
        data: { publicUrl },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'upload de l'image." }, { status: 500 });
  }
}
