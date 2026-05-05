import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_BLOG_POSTS } from "@/lib/blog-posts";

type BlogPayload = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  dateLabel: string;
  readTime: string;
  featured: boolean;
  content: string[];
  order: number;
};

function normalizePostContent(content: unknown): string[] {
  if (!Array.isArray(content)) return [];
  return content.map((line) => (typeof line === "string" ? line.trim() : "")).filter(Boolean);
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parsePayload(body: unknown): BlogPayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const excerpt = typeof raw.excerpt === "string" ? raw.excerpt.trim() : "";
  const imageUrl =
    typeof raw.imageUrl === "string" && raw.imageUrl.trim().length > 0
      ? raw.imageUrl.trim()
      : null;
  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  const dateLabel = typeof raw.dateLabel === "string" ? raw.dateLabel.trim() : "";
  const readTime = typeof raw.readTime === "string" ? raw.readTime.trim() : "";
  const slugInput = typeof raw.slug === "string" ? raw.slug : title;
  const slug = normalizeSlug(slugInput);
  const featured = raw.featured === true;
  const order = typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : 0;
  const content = Array.isArray(raw.content)
    ? raw.content.map((line) => (typeof line === "string" ? line.trim() : "")).filter(Boolean)
    : [];

  if (!title || !excerpt || !category || !dateLabel || !readTime || !slug || content.length === 0) {
    return null;
  }

  return {
    slug,
    category,
    title,
    excerpt,
    imageUrl,
    dateLabel,
    readTime,
    featured,
    content,
    order,
  };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ posts: FALLBACK_BLOG_POSTS });
    }
    if (!prisma?.blogPost?.findMany) {
      console.warn("[api/dashboard/blogs][GET] Prisma client unavailable, using fallback posts.");
      return NextResponse.json({ posts: FALLBACK_BLOG_POSTS });
    }
    const posts = await prisma.blogPost.findMany({ orderBy: { order: "asc" } });
    if (posts.length === 0) {
      return NextResponse.json({ posts: FALLBACK_BLOG_POSTS });
    }
    const normalizedPosts = posts.map((post) => ({
      ...post,
      content: normalizePostContent(post.content),
    }));
    return NextResponse.json({ posts: normalizedPosts });
  } catch (error) {
    console.error("[api/dashboard/blogs][GET] Prisma query failed, using fallback posts.", error);
    return NextResponse.json({ posts: FALLBACK_BLOG_POSTS });
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour modifier les articles." },
      { status: 503 },
    );
  }
  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Payload blog invalide." }, { status: 400 });
  }
  try {
    if (payload.featured) {
      await prisma.blogPost.updateMany({ data: { featured: false } });
    }
    const post = await prisma.blogPost.create({ data: payload });
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer l'article." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour modifier les articles." },
      { status: 503 },
    );
  }
  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Payload blog invalide." }, { status: 400 });
  }
  try {
    if (payload.featured) {
      await prisma.blogPost.updateMany({
        where: { slug: { not: payload.slug } },
        data: { featured: false },
      });
    }
    const post = await prisma.blogPost.update({
      where: { slug: payload.slug },
      data: payload,
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Impossible de mettre à jour l'article." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour modifier les articles." },
      { status: 503 },
    );
  }
  const { searchParams } = new URL(request.url);
  const slug = normalizeSlug(searchParams.get("slug") ?? "");
  if (!slug) {
    return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
  }
  try {
    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer l'article." }, { status: 500 });
  }
}
