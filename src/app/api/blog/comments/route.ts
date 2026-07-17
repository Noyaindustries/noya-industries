import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/security/rate-limit";

const MAX_COMMENT_BODY_BYTES = 8 * 1024;

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postSlug = normalizeSlug(searchParams.get("slug") ?? "");
  if (!postSlug) {
    return NextResponse.json({ error: "Slug article manquant." }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL || !prisma?.blogComment?.findMany) {
      return NextResponse.json({ comments: [] });
    }

    const comments = await prisma.blogComment.findMany({
      where: { postSlug },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: Request) {
  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (Number.isFinite(contentLength) && contentLength > MAX_COMMENT_BODY_BYTES) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
  }

  const rateLimit = consumeRateLimit(`blog-comment:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de commentaires envoyés. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (!process.env.DATABASE_URL || !prisma?.blogComment?.create) {
    return NextResponse.json(
      { error: "Les commentaires sont temporairement indisponibles." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { slug?: unknown; author?: unknown; message?: unknown }
    | null;
  const postSlug = normalizeSlug(typeof body?.slug === "string" ? body.slug : "");
  const author = typeof body?.author === "string" ? body.author.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!postSlug || !author || !message) {
    return NextResponse.json({ error: "Nom, message et slug sont requis." }, { status: 400 });
  }
  if (author.length > 80 || message.length > 2000) {
    return NextResponse.json({ error: "Commentaire trop long." }, { status: 400 });
  }

  try {
    const comment = await prisma.blogComment.create({
      data: { postSlug, author, message },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le commentaire." },
      { status: 500 },
    );
  }
}

