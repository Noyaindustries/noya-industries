import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
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
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour modifier les articles." },
      { status: 503 },
    );
  }
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasOidcStoreCredentials = Boolean(
    process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID,
  );
  if (!hasBlobToken && !hasOidcStoreCredentials) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob n'est pas configuré. Connectez un Blob Store au projet puis synchronisez les variables d'environnement.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const uploadedFile = formData?.get("file");
  if (!(uploadedFile instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(uploadedFile.type)) {
    return NextResponse.json({ error: "Format image non supporté (jpg, png, webp, gif)." }, { status: 415 });
  }
  if (uploadedFile.size <= 0 || uploadedFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image invalide ou trop lourde (max 4 MB)." }, { status: 413 });
  }

  try {
    const extension = getExtensionFromMimeType(uploadedFile.type);
    const sanitizedBaseName = uploadedFile.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    const blob = await put(
      `blog/${sanitizedBaseName || "image"}.${extension}`,
      uploadedFile,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: uploadedFile.type,
        cacheControlMaxAge: 31_536_000,
      },
    );

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("[api/dashboard/blogs/upload] Blob upload failed.", error);
    return NextResponse.json({ error: "Erreur lors de l'upload de l'image." }, { status: 500 });
  }
}
