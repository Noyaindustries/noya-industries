import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedAdminId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminId = await verifyAdminSessionValue(sessionToken);
  if (!adminId || adminId === "legacy") return null;
  return adminId;
}

export async function getAuthenticatedAdmin() {
  const adminId = await getAuthenticatedAdminId();
  if (!adminId || !process.env.DATABASE_URL) return null;

  try {
    return await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, updatedAt: true, createdAt: true },
    });
  } catch {
    return null;
  }
}
