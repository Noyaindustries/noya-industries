import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_TEAM_MEMBERS, type TeamSocialKind, type TeamTone } from "@/lib/team-members";

type TeamPayload = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  tone: TeamTone;
  desc: string;
  skills: string[];
  imageUrl: string | null;
  socials: Record<TeamSocialKind, string | null>;
  order: number;
};

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toOptionalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function parsePayload(body: unknown): TeamPayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const role = typeof raw.role === "string" ? raw.role.trim() : "";
  const desc = typeof raw.desc === "string" ? raw.desc.trim() : "";
  const initialsInput = typeof raw.initials === "string" ? raw.initials.trim().toUpperCase() : "";
  const initials = initialsInput.slice(0, 3);
  const slugInput = typeof raw.slug === "string" ? raw.slug : name;
  const slug = normalizeSlug(slugInput);
  const toneCandidate = raw.tone === "gold" || raw.tone === "blue" || raw.tone === "green" ? raw.tone : "blue";
  const skills = Array.isArray(raw.skills)
    ? raw.skills.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
  const imageUrl = toOptionalUrl(raw.imageUrl);
  const order = typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : 0;
  const socialsRaw = raw.socials && typeof raw.socials === "object" ? (raw.socials as Record<string, unknown>) : {};
  const socials: Record<TeamSocialKind, string | null> = {
    linkedin: toOptionalUrl(socialsRaw.linkedin),
    facebook: toOptionalUrl(socialsRaw.facebook),
    instagram: toOptionalUrl(socialsRaw.instagram),
    tiktok: toOptionalUrl(socialsRaw.tiktok),
    x: toOptionalUrl(socialsRaw.x),
  };

  if (!name || !role || !desc || !slug || !initials || skills.length === 0) return null;

  return {
    slug,
    initials,
    name,
    role,
    tone: toneCandidate,
    desc,
    skills,
    imageUrl,
    socials,
    order,
  };
}

function toResponseMember(member: {
  slug: string;
  initials: string;
  name: string;
  role: string;
  tone: string;
  desc: string;
  skills: string[];
  imageUrl: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  x: string | null;
  order: number;
}) {
  return {
    slug: member.slug,
    initials: member.initials,
    name: member.name,
    role: member.role,
    tone: member.tone === "gold" || member.tone === "green" ? member.tone : "blue",
    desc: member.desc,
    skills: member.skills,
    imageUrl: member.imageUrl,
    socials: {
      linkedin: member.linkedin,
      facebook: member.facebook,
      instagram: member.instagram,
      tiktok: member.tiktok,
      x: member.x,
    },
    order: member.order,
  };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL || !prisma?.teamMember?.findMany) {
      return NextResponse.json({ members: FALLBACK_TEAM_MEMBERS });
    }
    const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
    if (members.length === 0) return NextResponse.json({ members: FALLBACK_TEAM_MEMBERS });
    return NextResponse.json({ members: members.map(toResponseMember) });
  } catch {
    return NextResponse.json({ members: FALLBACK_TEAM_MEMBERS });
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL est requis pour modifier l'équipe." }, { status: 503 });
  }
  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) return NextResponse.json({ error: "Payload équipe invalide." }, { status: 400 });
  try {
    const created = await prisma.teamMember.create({
      data: {
        slug: payload.slug,
        initials: payload.initials,
        name: payload.name,
        role: payload.role,
        tone: payload.tone,
        desc: payload.desc,
        skills: payload.skills,
        imageUrl: payload.imageUrl,
        linkedin: payload.socials.linkedin,
        facebook: payload.socials.facebook,
        instagram: payload.socials.instagram,
        tiktok: payload.socials.tiktok,
        x: payload.socials.x,
        order: payload.order,
      },
    });
    return NextResponse.json({ member: toResponseMember(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le membre." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL est requis pour modifier l'équipe." }, { status: 503 });
  }
  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) return NextResponse.json({ error: "Payload équipe invalide." }, { status: 400 });
  try {
    const updated = await prisma.teamMember.update({
      where: { slug: payload.slug },
      data: {
        initials: payload.initials,
        name: payload.name,
        role: payload.role,
        tone: payload.tone,
        desc: payload.desc,
        skills: payload.skills,
        imageUrl: payload.imageUrl,
        linkedin: payload.socials.linkedin,
        facebook: payload.socials.facebook,
        instagram: payload.socials.instagram,
        tiktok: payload.socials.tiktok,
        x: payload.socials.x,
        order: payload.order,
      },
    });
    return NextResponse.json({ member: toResponseMember(updated) });
  } catch {
    return NextResponse.json({ error: "Impossible de mettre à jour le membre." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL est requis pour modifier l'équipe." }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const slug = normalizeSlug(searchParams.get("slug") ?? "");
  if (!slug) return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
  try {
    await prisma.teamMember.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer le membre." }, { status: 500 });
  }
}

