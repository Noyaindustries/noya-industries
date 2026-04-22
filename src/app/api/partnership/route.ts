import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const workType = b.workType === "investisseur" ? "investisseur" : "partenaire";
  const firstName = typeof b.firstName === "string" ? b.firstName.trim() : "";
  const lastName = typeof b.lastName === "string" ? b.lastName.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const company = typeof b.company === "string" ? b.company.trim() : "";
  const country = typeof b.country === "string" ? b.country.trim() : "";
  const referral = typeof b.referral === "string" ? b.referral.trim() : "";
  const partnerType = typeof b.partnerType === "string" ? b.partnerType.trim() : "";
  const sector = typeof b.sector === "string" ? b.sector.trim() : "";
  const partnerDescription =
    typeof b.partnerDescription === "string" ? b.partnerDescription.trim() : "";
  const investorProfile =
    typeof b.investorProfile === "string" ? b.investorProfile.trim() : "";
  const investorTicket = typeof b.investorTicket === "string" ? b.investorTicket.trim() : "";
  const investorDescription =
    typeof b.investorDescription === "string" ? b.investorDescription.trim() : "";
  const interests = Array.isArray(b.interests)
    ? b.interests.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Le prénom et le nom sont requis." }, { status: 400 });
  }
  if (!email || !emailRe.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (!company) {
    return NextResponse.json(
      { error: "L'entreprise / organisation est requise." },
      { status: 400 },
    );
  }
  if (!country) {
    return NextResponse.json({ error: "Le pays est requis." }, { status: 400 });
  }

  if (workType === "partenaire") {
    if (!partnerType || !partnerDescription) {
      return NextResponse.json(
        { error: "Complétez les informations de partenariat." },
        { status: 400 },
      );
    }
  } else if (!investorProfile || !investorDescription || interests.length === 0) {
    return NextResponse.json(
      { error: "Complétez les informations investisseur." },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Base de données non configurée (DATABASE_URL)." },
      { status: 503 },
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const topic = workType === "partenaire" ? "Partenariat" : "Investissement";

  const details: string[] = [
    `Type de demande: ${workType}`,
    `Prénom: ${firstName}`,
    `Nom: ${lastName}`,
    `Entreprise: ${company}`,
    `Pays: ${country}`,
    `Téléphone: ${phone || "-"}`,
    `Origine du contact: ${referral || "-"}`,
  ];

  if (workType === "partenaire") {
    details.push(`Type de partenariat: ${partnerType}`);
    details.push(`Secteur: ${sector || "-"}`);
    details.push(`Description: ${partnerDescription}`);
  } else {
    details.push(`Profil investisseur: ${investorProfile}`);
    details.push(`Ticket envisagé: ${investorTicket || "-"}`);
    details.push(`Entités d'intérêt: ${interests.join(", ")}`);
    details.push(`Approche: ${investorDescription}`);
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: fullName,
        email,
        company: company || null,
        phone: phone || null,
        topic,
        message: details.join("\n"),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Enregistrement impossible pour le moment." },
      { status: 500 },
    );
  }
}
